import React from "react"
import { ethers } from "ethers"
import { useLayoutStore } from "../../stores/useLayoutStore"
import { useContract } from "wagmi"
import { ORIGIN_STORY_DROP } from "../../constants/addresses"
import dropABI from "../../ABI/Drop.json"

const DayMint = () => {
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
          <div onClick={() => handleMint()}>Mint</div>
      </div>
  )
}

export default DayMint
