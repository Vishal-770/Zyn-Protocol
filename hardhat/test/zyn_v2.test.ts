import { expect } from "chai";
import { ethers } from "hardhat";

describe("Zyn StealthPay V2 (Zero-Link)", function () {
    let owner: any, user1: any, relayer: any;
    let announcer: any, resolver: any, registrar: any;
    let ensRegistry: any, publicResolver: any;

    const PARENT_NODE = ethers.namehash("zyn.eth");
    const STEALTH_META = "st:eth:0x123...abc";

    beforeEach(async function () {
        [owner, user1, relayer] = await ethers.getSigners();

        // 1. Deploy Mocks
        const MockENS = await ethers.getContractFactory("MockENSRegistry");
        ensRegistry = await MockENS.deploy();

        const MockResolver = await ethers.getContractFactory("MockPublicResolver");
        publicResolver = await MockResolver.deploy();

        // 2. Deploy EphemeralAnnouncer
        const Announcer = await ethers.getContractFactory("EphemeralAnnouncer");
        announcer = await Announcer.deploy();

        // 3. Deploy StealthResolver
        const Resolver = await ethers.getContractFactory("StealthResolver");
        resolver = await Resolver.deploy("http://api.zyn.eth", owner.address);

        // 4. Deploy SubdomainRegistrar
        const Registrar = await ethers.getContractFactory("SubdomainRegistrar");
        registrar = await Registrar.deploy(
            await ensRegistry.getAddress(),
            PARENT_NODE,
            await publicResolver.getAddress(),
            await resolver.getAddress()
        );
    });

    describe("SubdomainRegistrar", function () {
        it("Should register a subdomain to the contract (Zero-Link)", async function () {
            const name = "alice";
            const subnode = ethers.namehash("alice.zyn.eth");

            await registrar.connect(user1).register(name, STEALTH_META);

            // Verify owner in ENS Registry is the Registrar contract
            expect(await ensRegistry.owner(subnode)).to.equal(await registrar.getAddress());
            
            // Verify secret is in the Official Resolver
            expect(await publicResolver.text(subnode, "stealth")).to.equal(STEALTH_META);
        });

        it("Should block duplicate registrations", async function () {
            await registrar.register("alice", STEALTH_META);
            await expect(registrar.register("alice", "another_secret")).to.be.revertedWith("Taken");
        });

        it("Should correctly check isAvailable", async function () {
            expect(await registrar.isAvailable("bob")).to.be.true;
            await registrar.register("bob", STEALTH_META);
            expect(await registrar.isAvailable("bob")).to.be.false;
        });
    });

    describe("StealthResolver (CCIP-Read)", function () {
        it("Should revert with OffchainLookup on resolve()", async function () {
            const dnsName = ethers.dnsEncode("alice.zyn.eth");
            const calldata = "0x"; 

            await expect(resolver.resolve(dnsName, calldata))
                .to.be.revertedWithCustomError(resolver, "OffchainLookup");
        });

        it("Should verify backend signature in resolveWithProof", async function () {
            const result = ethers.hexlify(ethers.randomBytes(32));
            const expires = Math.floor(Date.now() / 1000) + 3600;
            const extraData = ethers.id("test");

            const messageHash = ethers.solidityPackedKeccak256(
                ["bytes2", "address", "uint64", "bytes32", "bytes32"],
                ["0x1900", await resolver.getAddress(), expires, ethers.keccak256(extraData), ethers.keccak256(result)]
            );
            
            const signature = await owner.signMessage(ethers.getBytes(messageHash));
            
            const response = ethers.AbiCoder.defaultAbiCoder().encode(
                ["bytes", "uint64", "bytes"],
                [result, expires, signature]
            );

            const verifiedResult = await resolver.resolveWithProof(response, extraData);
            expect(verifiedResult).to.equal(result);
        });
    });

    describe("EphemeralAnnouncer", function () {
        it("Should emit Announcement event", async function () {
            const stealthAddr = ethers.Wallet.createRandom().address;
            const ephemeralKey = ethers.hexlify(ethers.randomBytes(33));
            const viewTag = "0x01";

            await expect(announcer.announce(0, stealthAddr, ephemeralKey, viewTag))
                .to.emit(announcer, "Announcement")
                .withArgs(0, stealthAddr, owner.address, ephemeralKey, "0x01");
        });

        it("Should support relayed announcements via announceFor", async function () {
            const stealthAddr = ethers.Wallet.createRandom().address;
            const ephemeralKey = ethers.hexlify(ethers.randomBytes(33));
            const viewTag = "0x01";
            const metadata = "0x01";

            // Sender signs the announcement
            const payloadHash = ethers.solidityPackedKeccak256(
                ["uint256", "address", "bytes", "bytes"],
                [0, stealthAddr, ephemeralKey, metadata]
            );
            const signature = await user1.signMessage(ethers.getBytes(payloadHash));

            // Relayer submits it
            await expect(announcer.connect(relayer).announceFor(0, stealthAddr, ephemeralKey, viewTag, signature))
                .to.emit(announcer, "Announcement")
                .withArgs(0, stealthAddr, user1.address, ephemeralKey, "0x01");
        });
    });
});
