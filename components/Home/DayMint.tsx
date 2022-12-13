import React from "react"
import { useLayoutStore } from "stores/useLayoutStore"
import { useAccount, useContract, useNetwork } from "wagmi"
import dropABI from "ABI/Drop.json"
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"

const DayMint = () => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { openChainModal } = useChainModal()
  const { signer, provider } = useLayoutStore()
  const contract = useContract({
    address: "0x18dea78dd27cb57b94274cb20e9a46e286a21f65",
    abi: dropABI,
    signerOrProvider: signer ?? provider,
  })

  const handleMint = React.useCallback(async () => {
    if (!signer) {
      //todo prompt connect

      return
    }

    const { wait } = await contract?.purchase(1) //todo: make this not hard coded
    await wait()
    console.log("purchased")
  }, [signer, contract])

  return (
    <div>
      <div>
        <div className={"mb-4 text-3xl hover:text-black"}>
          Day Brièrre -{" "}
          <a
            href={"https://www.instagram.com/biomorphia/"}
            target={"_blank"}
            className={"hover:text-black hover:underline"}
          >
            @biomorphia
          </a>
        </div>
        <div className={"pb-6"}>
          Growing up in Haiti, digital artist Day Brièrre was exposed to powerful visual languages; whether the striking
          symbolism from folklore intrinsic to the culture or the iconography of Catholicism, the Haitian surrealist
          painters like Hector Hyppolite, or the stylings of Ghanaian barber shop signage. She blends and borrows from
          all of this in her mystical, wickedly playful and color-saturated scenes.
        </div>
        <div>
          babyfang is honored to have worked with Day on all our album artwork and are pleased to offer you a free mint
          of her artwork for our soon to be released single 'Goan Go'.
        </div>
        <div className={"p-12"}>
          <img src={"https://arweave.net/K3wTV9-T_PW7UcqF4YyhVAR6jFBYbn0mjI5tQxbsLyI"} />
        </div>
        <button
          className="mt-4 flex w-full items-center justify-center rounded-xl border bg-black py-3 text-xl text-white hover:bg-white hover:text-black"
          onClick={address === null ? openConnectModal : chain?.unsupported ? openChainModal : handleMint}
        >
          Free Mint
        </button>
      </div>
    </div>
  )
}

export default DayMint
