import React from "react"
import { usePlayerStore } from "stores/usePlayerStore"
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs"
import AnimatedModal from "../Modal/Modal"
import ReservedMint from "../Home/ReversedMint"

const Player = () => {
  const audioRef = React.useRef(null)
  const {
    addToQueue,
    queuedMusic,
    media,
    setCurrentMedia,
    isPlaying,
    setIsPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
  } = usePlayerStore((state: any) => state)
  type queueItem = {
    audio: object
    artist: string
    title: string
  }

  const { queue, setQueue, currentPosition, setCurrentPosition } = usePlayerStore((state: any) => state)

  interface Media {
    readyState: number
    duration: number
    currentTime: number
    currentSrc: string
    buffered: object
    controlsList: object
    ended: boolean
    error: object
    networkState: number
    seekable: object
    seeking: boolean
    textTracks: object
    volume: number
    muted: boolean
    paused: boolean
    addEventListener: (type: string, event: object) => void
    play: () => void
    pause: () => void
  }

  // /* handle add to queue */
  const handleAddToQueue = React.useMemo(() => {
    return queuedMusic.reduce((acc = [], cv: any) => {
      const artist = cv.artist
      const image = cv.image

      return cv.songs.reduce((acc = [], cv: any) => {
        // @ts-ignore
        acc.push({ ...cv, artist, image })

        return acc
      }, [])
    }, [])
  }, [queuedMusic])

  React.useEffect(() => {
    if (!!queue[currentPosition]?.artist) {
      setQueue([...queue, ...handleAddToQueue])
    } else {
      setQueue([...handleAddToQueue])
    }
  }, [handleAddToQueue])

  const loadMedia = React.useCallback(() => {
    const media: Media = audioRef.current || {
      readyState: 0,
      duration: 0,
      currentTime: 0,
      currentSrc: "",
      buffered: {},
      controlsList: {},
      ended: false,
      error: {},
      networkState: 0,
      seekable: {},
      seeking: false,
      textTracks: {},
      volume: 0,
      muted: false,
      paused: false,
      addEventListener: () => {},
      play: () => {},
      pause: () => {},
    }
    setCurrentMedia(media)
  }, [])


  React.useEffect(() => {
    loadMedia()
  }, [queue, currentPosition])


  const handlePlay = async () => {
    media.play()
  }

  const handlePause = async () => {
    media.pause()
  }

  const handleNext = async () => {
    media.pause()
    setIsPlaying(false)
    setCurrentPosition(queue.length - 1 > currentPosition ? currentPosition + 1 : 0)
    // media.play()
    // setIsPlaying(true)
  }

  const handlePrev = async () => {
    media.pause()
    setIsPlaying(false)
    setCurrentPosition(currentPosition > 1 ? currentPosition - 1 : queue.length - 1)
    // media.play()
    // setIsPlaying(true)
  }

  React.useEffect(() => {
    if (queue.length > 0 && !!media) {
      let playAttempt = setInterval(() => {
        media
          .play()
          .then(() => {
            clearInterval(playAttempt)
          })
          .catch((error: any) => {
            console.log("Unable to play the video, User has not interacted yet.", error)
          })
      }, 3000)
    }
  }, [queue, media])

  return (
    <div className="fixed bottom-2 z-40 flex flex w-full items-center justify-between px-4">
      <div className="flex items-center gap-4 ">
        <div>
          <div className="inline-flex h-10 items-center gap-2 self-start rounded border bg-black p-2 shadow">
            {/*<button type="button" onClick={queue.length > 0 ? () => handlePrev() : () => {}}>*/}
            {/*  <BiSkipPrevious size={28} />*/}
            {/*</button>*/}
            {(isPlaying && (
              <button type="button" onClick={queue.length > 0 ? () => handlePause() : () => {}}>
                <BsFillPauseFill size={22} color={"#fff"} />
              </button>
            )) || (
              <button type="button" onClick={queue.length > 0 ? () => handlePlay() : () => {}}>
                <BsFillPlayFill size={22} color={"#fff"} />
              </button>
            )}

            {/*<button type="button" onClick={queue.length > 0 ? () => handleNext() : () => {}}>*/}
            {/*  <BiSkipNext size={28} />*/}
            {/*</button>*/}
          </div>
          <audio crossOrigin="anonymous" preload={"auto"} src={queue[currentPosition]?.audio} ref={audioRef} />
        </div>
        {media.currentSrc.length > 0 ? (
          <div className="inline-flex h-10 items-center gap-2 self-start rounded border bg-black p-2 text-white shadow">
            <div>
              <AnimatedModal trigger={<button className={"hover:underline"}>Mint</button>} size={"auto"}>
                <ReservedMint />
              </AnimatedModal>
              {/*<Link href={`/${slugify(queue[currentPosition]?.artist)}/${slugify(queue[currentPosition]?.title)}`}>*/}
              {/*  /!*{queue[currentPosition]?.title}*!/*/}
              {/*</Link>*/}
            </div>
            {/*<div className="text-[#081C15]">*/}
            {/*  {" "}*/}
            {/*  <Link href={`/${slugify(queue[currentPosition]?.artist)}`}>{queue[currentPosition]?.artist}</Link>*/}
            {/*</div>*/}
          </div>
        ) : null}
      </div>

      <div className="hidden items-center gap-4 sm:visible sm:flex ">
        {/*{currentTime && duration && (*/}
        {/*  <div>*/}
        {/*    <div className="inline-flex h-10 items-center gap-2 self-start rounded border bg-white p-2 shadow">*/}
        {/*      {currentTime} / {duration}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  )
}

export default Player
