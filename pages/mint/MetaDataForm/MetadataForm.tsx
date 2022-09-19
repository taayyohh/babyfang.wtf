import React from "react"
import Form from "components/Fields/Form"
import { metadataFields, metadataInitialValues } from "components/Fields/fields/metadataFields"
import { NFTStorage } from "nft.storage"
import { useLayoutStore } from "stores/useLayoutStore"
import { ethers, Contract } from "ethers"
import CID from "cids"

const MetadataForm: React.FC<{ merkle: any; contract: Contract }> = ({ merkle, contract }) => {
  const client = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN ? process.env.NFT_STORAGE_TOKEN : "" })
  const { signerAddress } = useLayoutStore()

  const submitCallBack = React.useCallback(
    async (values: any) => {
      if (!signerAddress) return
      /*
    
         sanitize values for Metadata Upload
     
     */
      values.title = values.name
      values.project.title = values.title
      values.project.description = values.description
      values.attributes.artist = values.artist
      const metadata = await client.store(values)
      const tokenData = {
        metadataURI: metadata.url,
        creator: signerAddress,
        royaltyPayout: signerAddress,
        royaltyBPS: 10000,
      }

      const cid = new CID(values.cid).toV0()
      const hash = cid.toString(cid.multibaseName)
      const contentHash = ethers.utils.base58.decode(hash).slice(2)
      const contentData = {
        contentURI: values.losslessAudio,
        contentHash,
      }

      const leaf = merkle.leaf(signerAddress)
      const proof = merkle.proof(leaf)

      contract.mint(tokenData, contentData, proof)
    },
    [signerAddress, merkle, contract]
  )

  return (
    <div>
      <div className={"mb-8 text-3xl"}>Mint to LucidHaus Catalogue</div>
      <div className={"mb-24"}>
        <Form fields={metadataFields} initialValues={metadataInitialValues} submitCallback={submitCallBack} />
      </div>
    </div>
  )
}

export default MetadataForm
