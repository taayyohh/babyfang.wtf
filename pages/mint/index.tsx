import React from "react"
import { ethers } from "ethers"
import HAUS_ABI from "ABI/HausCatalogue.json"
import { useLayoutStore } from "stores/useLayoutStore"
import MetadataForm from "./MetaDataForm/MetadataForm"
import { MerkleTree } from "merkletreejs"
const SHA256 = require("crypto-js/sha256")

const Mint: React.FC<{ allow: string[] }> = ({ allow }) => {
  const { signer, signerAddress } = useLayoutStore()
  const leaves = allow?.map(x => SHA256(x))
  const tree = new MerkleTree(leaves, SHA256)
  const root = tree.getHexRoot()
  const leaf = (address: string) => SHA256(address)
  const proof = (leaf: any) => tree.getHexProof(leaf)

  const [contract, setContract] = React.useState<any>()
  const [owner, setOwner] = React.useState("")
  React.useMemo(async () => {
    if (!signer) return

    try {
      const contract: any = new ethers.Contract(
        "0x3da452152183140f1eb94b55a86f1671d51d63f4" || "",
        HAUS_ABI.abi,
        signer
      )
      setContract(contract)
    } catch (err) {
      console.log("err", err)
    }
  }, [signer, HAUS_ABI])

  React.useMemo(async () => {
    if (!contract) return

    setOwner(await contract.owner())
  }, [contract])

  return (
    <div>
      <div>Mint</div>
      {owner && signerAddress && ethers.utils.getAddress(owner) === ethers.utils.getAddress(signerAddress) && (
        <div className={"mx-auto mt-28 w-1/3"}>
          <MetadataForm merkle={{ proof, leaf, root, tree, leaves }} contract={contract} />
        </div>
      )}
    </div>
  )
}

export default Mint

export async function getStaticProps() {
  const allow = process.env.MERKLE?.split(",")

  try {
    return {
      props: {
        allow,
      },
    }
  } catch (error: any) {
    return {
      props: {
        error: error.reason,
      },
    }
  }
}
