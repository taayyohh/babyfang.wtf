import useSWR from "swr"
import { ethers } from "ethers"
import { HausCatalogue__factory } from "../types/ethers-contracts"
import ZORA_ADDRESSES from "@zoralabs/v3/dist/addresses/5.json"
import { useLayoutStore } from "../stores/useLayoutStore"
import { Provider } from "@ethersproject/providers"
import { FetchSignerResult } from "@wagmi/core"
import {ORIGIN_STORY_DROP} from "constants/addresses";

export async function init() {
  const { signer, provider } = useLayoutStore()
  const hausCatalogueContract = HausCatalogue__factory.connect(
      ORIGIN_STORY_DROP as string,
    (signer as FetchSignerResult) ?? (provider as Provider)
  )

  /*

 merkleRoot

 */
  useSWR(
    hausCatalogueContract ? `merkleRoot` : null,
    async () => {
      return await hausCatalogueContract?.merkleRoot()
    },
    { revalidateOnFocus: false }
  )

  /*
    
      owner
    
     */
  useSWR(
    hausCatalogueContract ? `owner` : null,
    async () => {
      return hausCatalogueContract?.owner()
    },
    { revalidateOnFocus: false }
  )

  // const { data: ownerOf } = useSWR(
  //     release?.tokenId && hausCatalogueContract ? ["ownerOf", release?.tokenId] : null,
  //     async () => await hausCatalogueContract?.ownerOf(release?.tokenId as string),
  //     { revalidateOnFocus: false }
  // )

  /*

        isOwner

       */
  useSWR(
    hausCatalogueContract ? `isOwner` : null,
    async () => {
      //@ts-ignore
      return ethers.utils.getAddress(await hausCatalogueContract?.owner()) === ethers.utils.getAddress(signer?._address)
    },
    { revalidateOnFocus: false }
  )

  /*
    
         isApprovedForAll
    
      */
  useSWR(
    hausCatalogueContract ? `isApprovedForAll` : null,
    async () => {
      return hausCatalogueContract?.isApprovedForAll(
        // @ts-ignore
        signer._address, // NFT owner address
        ZORA_ADDRESSES.ERC721TransferHelper
      )
    },
    { revalidateOnFocus: true }
  )
}
