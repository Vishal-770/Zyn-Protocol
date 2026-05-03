import { NameRegistered as NameRegisteredEvent } from "../generated/SubdomainRegistrar/SubdomainRegistrar"
import { Registration } from "../generated/schema"

export function handleNameRegistered(event: NameRegisteredEvent): void {
  let entity = new Registration(event.params.name)
  
  entity.label = event.params.label
  entity.stealthMetaAddress = event.params.stealthMetaAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
