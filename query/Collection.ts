import { gql, request } from "graphql-request"
import { CHAIN } from "constants/network"

export const collectionQuery = async () => {
  const endpoint = "https://api.zora.co/graphql"

  const req = gql`
    query ActiveAuctionQuery($address: [String!], $chain: Chain!) {
      mints(
        networks: { network: ETHEREUM, chain: $chain }
        sort: { sortKey: NONE, sortDirection: ASC }
        pagination: { limit: 100 }
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
    address: "0x0a7a9b0f77099f99fb6f566c069fbe28c49da714",
    chain: CHAIN,
  }

  const data = await request(endpoint, req, variables)

  console.log("D", data)

  return data.mints.nodes
}
