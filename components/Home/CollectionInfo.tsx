import React from "react"
import { ETHERSCAN_BASE_URL } from "../../constants/etherscan"
import { useEnsData } from "../../hooks/useEnsData"
import CopyButton from "../Shared/CopyButton"
import { walletSnippet } from "../../utils/helpers"

const CollectionInfo: React.FC<{ contractInfo: any }> = ({ contractInfo }) => {
  const { displayName, ensAvatar } = useEnsData(contractInfo?.info?.seller_fee_recipient as string)
  console.log("E", ensAvatar, displayName)

  return (
    <div className={"mx-auto max-w-3xl px-4 text-white mt-24"}>
      <div className={"text-5xl font-bold sm:text-7xl text-center"}>
        babyfang <em>&lsquo;origin story&rsquo;</em> collection
      </div>
      <div className={"py-9 px-9"}>
        We present to you a collection of 420 different photos documenting the moments, as friends and as a band, that
        have led us here -- the eve of our debut album. <span className={"text-lg font-bold"}>Mint</span> one for .01
        ETH.
      </div>
      {contractInfo && (
        <div className={"mb-12 rounded border p-6"}>
          <div className={"flex flex-col"}>
            <div className={"relative mx-auto h-auto w-full overflow-hidden rounded-3xl"}>
              {/*//TODO MAKE GIF*/}
              <img
                src={contractInfo?.info?.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                // className={"w-full"}
              />
            </div>
            <div className={"px-8 pt-4"}>
              <div className={"text-4xl font-bold"}>{contractInfo?.info?.name} collection</div>
              <div className={"mb-2 text-lg italic"}>{contractInfo?.info?.description}</div>
              <div className={"flex justify-center py-9"}>
                <div className={"flex w-full flex-col items-center"}>
                  <span className={"text-xs"}>minted:</span>
                  <div>
                    <span className={"text-3xl"}>{contractInfo?.totalSupply}</span> / 420
                  </div>
                </div>
              </div>
              <div className={"mb-2 flex items-center gap-2"}>
                <span className={"border-b text-sm"}>Contract:</span>{" "}
                <a
                  href={`${ETHERSCAN_BASE_URL}/address/${contractInfo?.address}`}
                  className={"flex items-center gap-1"}
                >
                  <div> {walletSnippet(contractInfo?.address)}</div>
                  <div>
                    <CopyButton text={contractInfo?.address} />
                  </div>
                </a>
              </div>
              <div className={"flex items-center gap-1"}>
                <span className={"border-b text-sm"}>Collection Creator:</span> {displayName}{" "}
                <CopyButton text={displayName} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionInfo
