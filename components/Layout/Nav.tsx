import { ConnectButton } from "@rainbow-me/rainbowkit"
import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"

const Nav = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const variants = {
    initial: {
      height: 0,
    },
    animate: {
      height: "auto",
    },
  }

  return (
    <>
      <div className="fixed z-30 hidden h-16 w-full items-center justify-end  p-4 sm:flex">
        <button className="absolute top-5 left-6 z-30 w-16">
          <Link href={"/"}>
            <img src="https://arweave.net/S5HTVWZkumbfr9tPPPRQCEwQLVUFYmmB30u1PvnAq3E" alt={"babyfang Logo"} />
          </Link>
        </button>
        <div id="connect">
          <ConnectButton showBalance={true} label={"Connect"} accountStatus={"address"} />
        </div>
      </div>
      <div className="fixed z-30 flex h-16 w-full items-center justify-between p-4 sm:hidden">
        <button className="w-16">
          <Link href={"/"}>
            <img src="https://arweave.net/S5HTVWZkumbfr9tPPPRQCEwQLVUFYmmB30u1PvnAq3E" alt={"babyfang Logo"} />
          </Link>
        </button>
        <div className={"ml-4"} onClick={() => setIsOpen(flag => !flag)}>
          <HamburgerMenuIcon width={"24px"} height={"24px"} color={"#fff"} />
        </div>

        <motion.div
          variants={variants}
          className={`absolute right-0 top-16 left-[5%] flex flex w-full w-full w-[90%] flex-col items-center overflow-hidden bg-black text-white`}
          initial={"initial"}
          animate={isOpen ? "animate" : "initial"}
        >
          <div id="connect">
            <ConnectButton showBalance={true} label={"Connect"} chainStatus={"none"} accountStatus={"address"} />
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default Nav
