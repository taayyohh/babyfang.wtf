import React from "react"
import { ethers } from "ethers"
import { useLayoutStore } from "../../stores/useLayoutStore"
import { useAccount, useContract, useNetwork } from "wagmi"
import { ORIGIN_STORY_DROP } from "../../constants/addresses"
import dropABI from "../../ABI/Drop.json"
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"

const ReservedMint = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { openChainModal } = useChainModal()
  const { signer, provider } = useLayoutStore()
  const contract = useContract({
    address: "0xe44540c653558070d4acc0a4dc75de883f5e9df4",
    abi: dropABI,
    signerOrProvider: signer ?? provider,
  })

  const handleMint = React.useCallback(async () => {
    if (!signer) {
      //todo prompt connect

      return
    }

    const { wait } = await contract?.purchase(1, { value: ethers.utils.parseEther(".01") }) //todo: make this not hard coded
    await wait()
    console.log("purchased")
  }, [signer, contract])

  return (
    <div>
      <div>
        <div className={"mb-4 text-3xl hover:text-black"}>desrever flip 12.12.23</div>
        <div className={"pb-6"}>Enjoying the sounds in the background. Mint :)</div>
        <div className={"text-6xl font-bold"}>ITFO</div>
        <div className={"p-12"}>
          <img src={"https://zora-storage.imgix.net/bafybeicfkxtx4vxgaznggthgsb3hlmnjdhywuga3mot5rixdkiqod53zci"} />
        </div>
        <button
          className="mt-4 flex w-full items-center justify-center rounded-xl border bg-black py-3 text-xl text-white hover:bg-white hover:text-black"
          onClick={address === null ? openConnectModal : chain?.unsupported ? openChainModal : handleMint}
        >
          Mint .01 ETH
        </button>
      </div>
    </div>
  )
}

export default ReservedMint
