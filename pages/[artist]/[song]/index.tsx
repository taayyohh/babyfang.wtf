import React from "react"
import { GetServerSideProps } from "next"
import { slugify } from "utils/helpers"
import useSWR, { SWRConfig } from "swr"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeftIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/router"
import { getDiscography } from "utils/getDiscographyNullMetadata"
import { useAuction } from "hooks/useAuction"
import useHausCatalogue from "hooks/useHausCatalogue"
import AnimatedModal from "components/Modal/Modal"
import CreateBid from "components/Album/CreateBid"
import { useCountdown } from "hooks/useCountdown"
import { useEnsAvatar, useEnsName } from "wagmi"
import { ethers } from "ethers"
import { activeAuctionQuery } from "query/activeAuction"
import { BsFillPlayFill } from "react-icons/bs"
import { usePlayerStore } from "stores/usePlayerStore"
import Meta from "../../../components/Layout/Meta"
import { HAUS_CATALOGUE_PROXY } from "../../../constants/addresses"
import bid from "../../../components/Album/Bid"
import { ETHERSCAN_BASE_URL } from "../../../constants/etherscan"
const ReactHtmlParser = require("react-html-parser").default

export const getServerSideProps: GetServerSideProps = async context => {
  const artist = context?.params?.artist as string
  const song = context?.params?.song as string
  const slug = context?.resolvedUrl

  try {
    const { fallback, discography } = await getDiscography()
    const tokens = activeAuctionQuery()

    return {
      props: {
        artist,
        song,
        slug,
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

const Song = ({ artist, song, slug }: any) => {
  const { data: release } = useSWR(`${artist}/${song}`)
  const router = useRouter()
  const { auction } = useAuction(release)
  const { royaltyInfo, royaltyPayoutAddress } = useHausCatalogue()
  const { data: _royaltyPayoutAddress } = useSWR(
    release?.tokenId ? ["royaltyPayoutAddress", release.tokenId] : null,
    async () => {
      return await royaltyPayoutAddress(Number(release?.tokenId))
    }
  )

  const { data: creatorShare } = useSWR(release?.tokenId ? ["royaltyInfo", release.tokenId] : null, async () => {
    const bps = 10000
    const royaltyBPS = await royaltyInfo(Number(release?.tokenId), bps)
    return Number(royaltyBPS?.royaltyAmount) / 100
  })

  const { countdownString } = useCountdown(auction)

  const { data: ReserveAuctionCoreEth } = useSWR("ReserveAuctionCoreEth")

  const { data: bidHistory } = useSWR(
    release?.tokenId && ReserveAuctionCoreEth ? ["AuctionBid", release.tokenId] : null,
    async () => {
      const events = await ReserveAuctionCoreEth?.queryFilter("AuctionBid" as any, 0, "latest")

      return events
        .filter(
          (event: { tokenContract: string; args: any }) =>
            ethers.utils.getAddress(event.args.tokenContract) === ethers.utils.getAddress(HAUS_CATALOGUE_PROXY) &&
            Number(event.args.tokenId) === Number(release?.tokenId)
        )
        .reverse()
    },
    { revalidateOnFocus: false }
  )

  const { data: ens } = useEnsName({
    chainId: 1,
    address: ethers.utils.getAddress(release?.owner),
  })

  const { data: avatar } = useEnsAvatar({
    addressOrName: ethers.utils.getAddress(release?.owner),
    chainId: 1,
  })

  const { addToQueue, queuedMusic } = usePlayerStore()

  return (
    <AnimatePresence exitBeforeEnter={true}>
      <motion.div
        variants={{
          closed: {
            y: 0,
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
        <Meta
          title={release?.name}
          type={"music.song"}
          image={release?.image?.url?.replace("ipfs://", "https://ipfs.io/ipfs/")}
          slug={slug}
          album={release?.metadata?.albumTitle}
          track={release?.metadata?.trackNumber}
          musician={release?.metadata?.artist}
          description={release?.metadata.artist}
        />
        <div
          className={`fixed relative top-16 flex hidden h-12 w-full items-center ${
            auction?.auctionHasStarted && !auction?.auctionHasEnded ? "border-y-2" : "border-t-2"
          }   sm:flex`}
        >
          <button onClick={() => router.back()} className={"absolute"}>
            <ChevronLeftIcon width={"28px"} height={"28px"} className={"ml-7 text-rose-100"} />
          </button>
          {(!auction?.notForAuction && (
            <div className={"mx-auto flex w-4/5 items-center justify-between"}>
              {auction?.auctionHasStarted && !auction?.auctionHasEnded && (
                <div className={"flex items-center gap-3"}>
                  <div className={"relative h-2 w-2 rounded-full"}>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-900 opacity-50"></span>
                  </div>
                  <div className={"text-sm"}>auction ends: {countdownString}</div>
                </div>
              )}
              {auction?.auctionHasEnded && auction?.auctionHasStarted && <div>{countdownString}</div>}
              {!auction?.notForAuction && !auction?.auctionHasStarted && (
                <div>Place a bid to kick off the auction!</div>
              )}

              {auction?.auctionHasStarted && !auction?.auctionHasEnded && (
                <div className={"flex items-center"}>
                  {(auction?.auctionHasStarted && !auction?.auctionHasEnded && (
                    <div className={"mr-4"}>
                      <span className={"font-bold"}>Current Bid: </span>
                      {auction?.highestBid} ETH
                    </div>
                  )) || (
                    <div className={"mr-4"}>
                      <span className={"font-bold"}>Reserve Price</span>: {auction?.reservePrice} ETH
                    </div>
                  )}
                  <AnimatedModal
                    trigger={<button className={"rounded bg-black px-2 py-1 text-white"}>Place Bid</button>}
                    size={"auto"}
                  >
                    <CreateBid release={release} />
                  </AnimatedModal>
                </div>
              )}
            </div>
          )) || (
            <div className={"mx-auto flex w-4/5 items-center justify-between"}>
              <div className={"flex items-center gap-3"}>
                <span className={"font-bold"}>collected by</span>
                <div className={"flex items-center gap-2"}>
                  {avatar && (
                    <div className={"h-8 w-8 overflow-hidden rounded-full"}>
                      <img src={avatar} />
                    </div>
                  )}
                  {ens || release?.owner}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={"mx-auto w-4/5 pt-32"}>
          <div className={"flex flex-col items-center gap-10 pt-12 sm:flex-row"}>
            <div
              className={
                "h-full w-full sm:h-[300px] sm:min-h-[300px] sm:w-[300px] sm:min-w-[300px] md:h-[400px] md:min-h-[400px] md:w-[400px] md:min-w-[400px] lg:h-[500px] lg:min-h-[500px] lg:w-[500px] lg:min-w-[500px]"
              }
            >
              <img src={release?.metadata?.project.artwork.uri.replace("ipfs://", "https://ipfs.io/ipfs/")} />
            </div>
            <div>
              <div className={"flex items-center justify-center"}>
                <div
                  className={
                    "mr-6 flex h-[80px] min-h-[80px] w-[80px] min-w-[80px] items-center justify-center rounded-full border-2 "
                  }
                >
                  <BsFillPlayFill
                    size={44}
                    color={"black"}
                    className={"cursor-pointer"}
                    onClick={() =>
                      addToQueue([
                        ...queuedMusic,
                        {
                          artist: release?.metadata?.artist,
                          image: release?.metadata?.project.artwork.uri.replace("ipfs://", "https://ipfs.io/ipfs/"),
                          songs: [
                            {
                              audio: [release?.metadata?.losslessAudio.replace("ipfs://", "https://ipfs.io/ipfs/")],
                              title: release?.metadata?.title,
                              trackNumber: release?.metadata?.trackNumber,
                            },
                          ],
                        },
                      ])
                    }
                  />
                </div>
                <div className={"flex flex-col"}>
                  <div className={"text-4xl font-bold"}>{release?.metadata?.name}</div>
                  <div className={"text-3xl"}>
                    <Link href={`/${slugify(release.metadata.artist)}`}>{release.metadata.artist}</Link>
                  </div>
                </div>
              </div>

              {/*{console.log(release)}*/}
            </div>
          </div>
        </div>
        <div className={"mx-auto w-4/5 pt-16 pb-48"}>
          <div className={"border-b-2  pb-2 text-2xl font-bold"}>Record Details</div>
          <div className={"pt-4"}>{ReactHtmlParser(release?.metadata?.description)}</div>
          <div className={"mt-6 flex gap-10"}>
            <div className={"flex flex-col text-xl"}>
              <div>Format</div>
              <div>{release?.metadata?.mimeType.replace("audio/", ".")}</div>
            </div>
            <div className={"flex flex-col text-xl"}>
              <div>Token ID</div>
              <a
                target="_blank"
                href={`https://goerli.etherscan.io/token/${release?.collectionAddress}?a=${release?.tokenId}#inventory`}
              >
                {release?.tokenId}
              </a>
            </div>
          </div>
          <div className={"mt-12 flex flex-col gap-10 sm:grid sm:grid-cols-[1fr,2fr]"}>
            <div>
              <div className={"text-2xl font-bold"}>Auction Info</div>
              <div className={"mt-2 rounded-xl border-2  p-8"}>
                <div className={"flex flex-col"}>
                  <div className={"flex flex-col"}>
                    <div>Reserve price: {auction?.reservePrice} ETH</div>
                    <div></div>
                  </div>
                  <div>Creator share: {creatorShare}%</div>
                  <div>Current owner: {release?.owner}</div>
                  <div>Royalty Recipient: {_royaltyPayoutAddress}</div>
                </div>
              </div>
            </div>
            <div>
              <div className={"text-2xl font-bold"}>Bid History</div>
              <div className={"mt-2 box-border rounded-xl border-2 p-8"}>
                {bidHistory?.map(({ transactionHash, args }: any) => {
                  return (
                    <div className={"box-border w-full pb-2"}>
                      <div>
                        Bid placed by {args?.auction?.highestBidder} for{" "}
                        {ethers.utils.formatEther(Number(args?.auction?.highestBid).toString())} ETH
                      </div>
                      <a href={`${ETHERSCAN_BASE_URL}/tx/${transactionHash}`} target={"_blank"}>
                        etherscan
                      </a>
                      {/*<div>{auction?.highestBid}</div>*/}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function SongPage({ fallback, artist, song, slug }: any) {
  // SWR hooks inside the `SWRConfig` boundary will use those values.
  return (
    <SWRConfig value={{ fallback }}>
      <Song artist={artist} song={song} sluh={slug} />
    </SWRConfig>
  )
}
