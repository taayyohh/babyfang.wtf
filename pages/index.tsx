import React from "react"
import { BsArrowDown } from "react-icons/bs"
import { AnimatePresence, motion } from "framer-motion"
import useSWR, { SWRConfig } from "swr"
import { getDiscography } from "utils/getDiscographyNullMetadata"
import Image from "next/image"
import { useContract } from "wagmi"
import dropABI from "ABI/Drop.json"
import { ethers } from "ethers"
import { useLayoutStore } from "stores/useLayoutStore"
import { collectionQuery } from "../query/Collection"
import ZoraTag from "../components/Shared/ZoraTag"
import AnimatedModal from "../components/Modal/Modal"
import { ETHERSCAN_BASE_URL } from "../constants/etherscan"
import axios from "axios"
import Meta from "components/Layout/Meta"
import { usePlayerStore } from "../stores/usePlayerStore"

export async function getServerSideProps() {
  try {
    const { fallback, discography } = await getDiscography()

    return {
      props: {
        fallback,
        discography,
      },
    }
  } catch (error: any) {
    console.log("err", error)
    return {
      notFound: true,
    }
  }
}

const Catalogue: React.FC<any> = ({ discography }) => {
  const { signer, provider } = useLayoutStore()
  const { addToQueue, queuedMusic } = usePlayerStore((state: any) => state)

  const contract = useContract({
    address: "0x0a7a9b0f77099f99fb6f566c069fbe28c49da714",
    abi: dropABI,
    signerOrProvider: signer ?? provider,
  })

  const { data: contractInfo } = useSWR(contract ? "total-supply" : null, async () => {
    if (contract === null) return

    console.log("C", contract)

    const totalSupply = Number(await contract.totalSupply())
    const address = await contract?.address
    const uri = await contract?.contractURI()
    const info = await axios(uri.replace("ipfs://", "https://ipfs.io/ipfs/"))

    return { totalSupply, address, info: info.data }
  })

  const { data: originStory, mutate } = useSWR("origin-story", async () => {
    return await collectionQuery()
  })

  const handleMint = React.useCallback(async () => {
    if (!signer) {
      //todo prompt connect

      return
    }

    const { wait } = await contract?.purchase(1, { value: ethers.utils.parseEther(".001") })
    await wait()
    mutate()
    console.log("purchased")
  }, [signer, contract])

  React.useEffect(() => {
    addToQueue([
      {
        artist: "babyfang",
        image: "https://arweave.net/K3wTV9-T_PW7UcqF4YyhVAR6jFBYbn0mjI5tQxbsLyI",
        songs: [
          {
            audio: ["https://arweave.net/F70tN_fooDq1b0_IfedlHcaPGj8D0MABA_BXIMLj7wI"],
            title: "desrever",
            trackNumber: "0",
          },
        ],
      },
    ])
    // https://arweave.net/F70tN_fooDq1b0_IfedlHcaPGj8D0MABA_BXIMLj7wI
  }, [])

  return (
    <div className="absolute top-0 left-0 m-0 mx-auto box-border h-full w-screen min-w-0">
      <Meta
        title={"Babyfang"}
        type={"music.song"}
        image="https://arweave.net/K3wTV9-T_PW7UcqF4YyhVAR6jFBYbn0mjI5tQxbsLyI"
        slug={"/"}
        musician={"babyfang"}
        description={'babyfang announces ‘Goan Go’, ur fav new rock song <3"'}
      />
      <div className="m-0 mx-auto box-border w-screen min-w-0">
        <div className="sticky top-0 z-0 grid h-screen w-screen place-items-center ">
          <div className="absolute -z-10 flex w-full max-w-screen-xl justify-center">
            <AnimatePresence exitBeforeEnter={true}>
              <motion.div
                className="relative flex flex-col items-center gap-12 md:flex-row"
                key={"key"}
                variants={{
                  closed: {
                    y: 10,
                    opacity: 0,
                  },
                  open: {
                    y: 0,
                    opacity: 1,
                  },
                }}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="mt-4 flex max-w-[320px] flex-col gap-2 pt-12 text-white sm:max-w-[400px] md:ml-8 md:mt-0 md:gap-4 md:pl-8">
                  <div className="text-3xl font-bold sm:text-4xl md:text-5xl">
                    babyfang announces <em>&lsquo;Goan Go&rsquo;</em>, ur fav new rock song {"<3"}
                  </div>
                  <div className="text-3xl text-rose-700 sm:text-4xl md:text-5xl">out Fri, Dec 20</div>
                  <AnimatedModal
                    trigger={
                      <button className="flex items-center justify-center rounded-xl border py-3 text-xl hover:bg-white hover:text-black">
                        Mint Day Brièrre Cover Art
                      </button>
                    }
                  >
                    <div>Explain mint</div>
                  </AnimatedModal>
                </div>
                <div
                  className={`sm-h-32 w-h-32 relative h-72 w-72 overflow-hidden sm:h-96 sm:min-h-[330px] sm:w-96 sm:min-w-[330px]`}
                >
                  <Image
                    className={`h-full w-full`}
                    src="https://arweave.net/K3wTV9-T_PW7UcqF4YyhVAR6jFBYbn0mjI5tQxbsLyI"
                    layout="fill"
                    // layout={'fill'}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="fixed bottom-5 animate-bounce">
            <BsArrowDown size={24} color={"#fff"} />
          </div>
        </div>

        <div className={"relative z-20 bg-black pb-20"}>
          <div className={"mx-auto max-w-3xl px-4 text-white"}>
            <div className={"text-8xl font-bold sm:text-9xl"}>
              babyfang <em>&lsquo;origin story&rsquo;</em> collection
            </div>
            <div className={"py-9"}>
              We present to you a collection of 1000 different photos documenting the moments, as friends and as a band,
              that have led us here -- the eve of our debut album; releasing February 3, 2023 via{" "}
              <a href={"https://lucid.haus"} className={"text-rose-600 hover:text-rose-700"} target={"_blank"}>
                LucidHaus
              </a>
              . <span className={"text-lg font-bold"}>Mint</span> one for .01 ETH.
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
                  <div className={"text-4xl font-bold"}>{contractInfo?.info?.name}</div>
                  <div className={"mb-2 text-lg"}>{contractInfo?.info?.description}</div>
                  <div>
                    Contract:{" "}
                    <a href={`${ETHERSCAN_BASE_URL}/address/${contractInfo?.address}`}>{contractInfo?.address}</a>
                  </div>
                  <div>Minted: {contractInfo?.totalSupply}</div>

                  <div>Seller Fee Recipient: {contractInfo?.info?.seller_fee_recipient}</div>
                </div>
              </div>
            )}
          </div>

          <div className={" mx-auto flex w-full flex-wrap justify-center gap-1"}>
            <button
              onClick={() => handleMint()}
              className={"h-[32vw] w-[32vw] bg-sky-400 object-cover sm:h-[14vw] sm:w-[14vw]"}
            >
              Mint to reveal
            </button>
            {originStory &&
              originStory?.map((mint: { token: { metadata: { image: string } } }) => (
                <>
                  <div
                    className={
                      "flex h-[32vw] w-[32vw] items-center justify-center bg-[#0000] object-cover sm:h-[14vw] sm:w-[14vw]"
                    }
                  >
                    <img src={mint?.token?.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")} />
                  </div>
                </>
              ))}
          </div>
          <div className={"pr-5"}>
            <ZoraTag link={"https://docs.zora.co/docs/smart-contracts/creator-tools/ERC721Drop"} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CataloguePage({ fallback, discography }: any) {
  // SWR hooks inside the `SWRConfig` boundary will use those values.
  return (
    <SWRConfig value={{ fallback }}>
      <Catalogue discography={discography} />
    </SWRConfig>
  )
}
