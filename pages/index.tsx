import React from "react"
import { BsArrowDown } from "react-icons/bs"
import { AnimatePresence, motion } from "framer-motion"
import useSWR, { SWRConfig } from "swr"
import { getDiscography } from "utils/getDiscographyNullMetadata"
import Image from "next/image"
import { useAccount, useContract, useNetwork } from "wagmi"
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
import { ORIGIN_STORY_DROP } from "../constants/addresses"
import DayMint from "../components/Home/DayMint"
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { useEnsData } from "../hooks/useEnsData"
import CollectionInfo from "../components/Home/CollectionInfo"
import Head from "next/head"

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
    address: ORIGIN_STORY_DROP,
    abi: dropABI,
    signerOrProvider: signer ?? provider,
  })

  const { data: contractInfo } = useSWR(
    contract ? "total-supply" : null,
    async () => {
      if (contract === null) return

      const totalSupply = Number(await contract.totalSupply())
      const address = await contract?.address
      const uri = await contract?.contractURI()
      const info = await axios(uri.replace("ipfs://", "https://ipfs.io/ipfs/"))

      return { totalSupply, address, info: info.data }
    },
    { revalidateIfStale: true }
  )

  const { data: originStory, mutate } = useSWR("origin-story", async () => {
    return await collectionQuery()
  })

  const handleMint = React.useCallback(async () => {
    if (!signer) {
      //todo prompt connect

      return
    }

    const { wait } = await contract?.purchase(1, { value: ethers.utils.parseEther((0.01).toString()) }) //todo: make this not hard coded
    await wait()
    mutate()
    console.log("purchased")
  }, [signer, contract])

  const { address } = useAccount()
  const { chain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { openChainModal } = useChainModal()

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
        title={"In The Face Of out now"}
        type={"music.song"}
        image="https://arweave.net/4tDopLmLLT0m1Y8nacBy3hfnyG8oOA-F6Pe1hHGmOr4"
        slug={"/"}
        musician={"babyfang"}
        description={'babyfang releases ‘In The Face Of’, ur fav new rock album<3"'}
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
                    <em>&lsquo;In The Face Of&rsquo;</em>, our debut album
                  </div>
                  <div className="text-3xl text-rose-700 sm:text-4xl md:text-5xl">out now!</div>
                  {/*<AnimatedModal*/}
                  {/*  trigger={*/}
                  {/*    <button className="flex items-center justify-center rounded-xl border py-3 text-xl hover:bg-white hover:text-black">*/}
                  {/*      Mint Day Brièrre Cover Art (Free)*/}
                  {/*    </button>*/}
                  {/*  }*/}
                  {/*  size={"auto"}*/}
                  {/*>*/}
                  {/*  <DayMint />*/}
                  {/*</AnimatedModal>*/}
                  <div className={"sm:text-md mt-4 flex justify-center gap-2 text-lg underline sm:mt-0"}>
                    <a href={"https://webabyfang.bandcamp.com/album/in-the-face-of?label=1183943989&tab=music"} target="_blank">
                      Bandcamp
                    </a>
                    <a href={"https://tidal.com/album/273207658"} target="_blank">
                      Tidal
                    </a>
                    <a href={"https://music.apple.com/us/album/in-the-face-of/1667647307"} target="_blank">
                      Apple Music
                    </a>
                    <a href={"https://open.spotify.com/album/2yCoxxEOntKBrNFF6mixhc"} target="_blank">
                      Spotify
                    </a>
                  </div>
                </div>
                <div className={"flex flex-col"}>
                  <div
                    className={`sm-h-32 w-h-32 relative h-72 w-72 overflow-hidden sm:h-96 sm:min-h-[330px] sm:w-96 sm:min-w-[330px]`}
                  >
                    <a href={"https://www.lucid.haus/babyfang/"} target={"_blank"}>
                      <Image
                        className={`h-full w-full`}
                        src="https://arweave.net/4tDopLmLLT0m1Y8nacBy3hfnyG8oOA-F6Pe1hHGmOr4"
                        layout="fill"
                        // layout={'fill'}
                      />
                    </a>
                  </div>
                  <div className={"pt-2 text-xs text-white"}>
                    <a href={"https://www.instagram.com/biomorphia/"} target={"_blank"}>
                      Art by @biomorphia
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="fixed bottom-5 animate-bounce">
            <BsArrowDown size={24} color={"#fff"} />
          </div>
        </div>

        <div className={"relative z-20 bg-black pb-20"}>
          {contractInfo && <CollectionInfo contractInfo={contractInfo} />}
          <div className={" mx-auto flex w-full flex-wrap justify-center gap-1"}>
            <button
              onClick={address === null ? openConnectModal : chain?.unsupported ? openChainModal : handleMint}
              className={"h-[32vw] w-[32vw] object-cover sm:h-[14vw] sm:w-[14vw]"}
            >
              <div className={"relative flex h-full w-full items-center justify-center overflow-hidden border"}>
                <Image
                  objectFit={"cover"}
                  sizes="(max-width: 768px) 32vw, 14vw"
                  layout={"fill"}
                  src={"https://arweave.net/U8IpqldK67bXrYqrons1hem3pt9yEVKWQw2K96DEvrU"}
                  className={"absolute top-0 left-0 h-full w-full blur"}
                />
                <div className={"absolute text-white"}>Mint to collect</div>
              </div>
            </button>

            {originStory &&
              originStory?.map((mint: { token: { metadata: { image: string } } }) => (
                <>
                  {mint?.token?.metadata?.image && (
                    <div
                      className={
                        "relative flex h-[32vw] w-[32vw] items-center justify-center overflow-hidden bg-[#0000] object-cover sm:h-[14vw] sm:w-[14vw]"
                      }
                    >
                      <Image
                        objectFit={"cover"}
                        sizes="(max-width: 768px) 32vw, 14vw"
                        layout={"fill"}
                        src={mint?.token?.metadata?.image?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                      />
                    </div>
                  )}
                </>
              ))}

            <div className={"mt-32 flex items-center justify-center"}>
              <iframe
                id="embed"
                width="500px"
                height="400px"
                className="w-full sm:w-[500px]"
                src="https://create.zora.co/editions/0x29565870c5527b993a722dd20d23a1c0c378d73a/frame?padding=20px&mediaPadding=20px&showDetails=false&theme=dark&showMedia=true&showCollectors=false&showMintingUI=true"
              />
            </div>
          </div>
          <div className={"mt-32 flex items-center justify-center"}>
            <iframe
              id="embed"
              width="500px"
              height="400px"
              className="w-full sm:w-[500px]"
              src="https://create.zora.co/editions/0xc6e06d747e1b9131d70e7b76df2c34b6cc35ab0c/frame?padding=20px&mediaPadding=20px&showDetails=false&theme=dark&showMedia=true&showCollectors=false&showMintingUI=true"
            />
          </div>
        </div>
        <div className={"pr-5"}>
          <ZoraTag link={"https://docs.zora.co/docs/smart-contracts/creator-tools/ERC721Drop"} />
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
