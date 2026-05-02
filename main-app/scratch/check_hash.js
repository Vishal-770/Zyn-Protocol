const { keccak256, toUtf8Bytes, namehash, labelhash } = require('viem');
const name = "badguy69";
console.log("Name:", name);
console.log("keccak256(name):", keccak256(toUtf8Bytes(name)));
console.log("labelhash(name):", labelhash(name));
console.log("namehash(name + '.zyn.eth'):", namehash(name + '.zyn.eth'));
console.log("keccak256(name + '.zyn.eth'):", keccak256(toUtf8Bytes(name + '.zyn.eth')));
