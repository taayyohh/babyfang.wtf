import { gql, request } from "graphql-request"
import { ORIGIN_STORY_DROP } from "../constants/addresses"
import { CHAIN } from "../constants/network"

export const isActiveAuction = async (tokenId: string) => {
  const endpoint = "https://api.zora.co/graphql"

  const req = gql`
    query isActiveAuctionQuery($address: String!, $tokenId: String!, $chain: Chain!) {
      market(
        where: { marketType: ACTIVE_V3_RESERVE_AUCTION, token: { address: $address, tokenId: $tokenId } }
        network: { network: ETHEREUM, chain: $chain }
      ) {
        collectionAddress
        tokenId
        transactionInfo {
          blockNumber
          transactionHash
          blockTimestamp
        }
      }
    }
  `

  const variables = {
    address: ORIGIN_STORY_DROP,
    tokenId,
    chain: CHAIN,
  }

  const tokens = await request(endpoint, req, variables)
  return tokens.market
}
