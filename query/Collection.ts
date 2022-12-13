import { gql, request } from "graphql-request"
import { CHAIN } from "constants/network"
import { ORIGIN_STORY_DROP } from "../constants/addresses"

export const collectionQuery = async () => {
  const endpoint = "https://api.zora.co/graphql"

  const req = gql`
    query ActiveAuctionQuery($address: [String!], $chain: Chain!) {
      mints(
        networks: { network: ETHEREUM, chain: $chain }
        sort: { sortKey: NONE, sortDirection: ASC }
        pagination: { limit: 420 }
        where: { collectionAddresses: $address }
      ) {
        nodes {
          token {
            image {
              mediaEncoding {
                ... on ImageEncodingTypes {
                  large
                  poster
                }
              }
              size
              url
              mimeType
            }
            metadata
            tokenId
            owner
            tokenUrl
            description
            collectionName
            collectionAddress
          }
        }
      }
    }
  `

  const variables = {
    address: ORIGIN_STORY_DROP,
    chain: CHAIN,
  }

  const data = await request(endpoint, req, variables)

  return data.mints.nodes
}
