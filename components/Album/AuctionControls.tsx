import React, { useRef } from "react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { ethers } from "ethers"
import useZoraV3 from "hooks/useZoraV3"
import { motion } from "framer-motion"
import { useAuction } from "hooks/useAuction"
import CreateAuction from "./CreateAuction"
import { useClickOutside } from "hooks/useClickOutside"
import useHausCatalogue from "hooks/useHausCatalogue"
import useSWR from "swr"
import AnimatedModal from "../Modal/Modal"
import Form from "../Fields/Form"
import { updateReservePriceFields } from "../Fields/fields/updateReservePrice"

const AuctionControls: React.FC<any> = ({ release }) => {
  const { cancelAuction, handleApprovalManager, isModuleApproved } = useZoraV3()
  const { handleApprovalTransferHelper, burn } = useHausCatalogue()
  const { data: isApprovedForAll } = useSWR("isApprovedForAll")
  const { data: ReserveAuctionCoreEth } = useSWR("ReserveAuctionCoreEth")

  const { auction } = useAuction(release)
  const ref = useRef(null)

  /*

    handle set auction reserve price

 */

  const handleSetAuctionReservePrice = React.useCallback(
    (values: { reservePrice: string }) => {
      if (!ReserveAuctionCoreEth || !release) return

      ReserveAuctionCoreEth.setAuctionReservePrice(
        release?.collectionAddress,
        release?.tokenId,
        ethers.utils.parseEther(values.reservePrice.toString())
      )
    },
    [ReserveAuctionCoreEth]
  )

  /*

    handle cancel auction

 */
  const handleCancelAuction = React.useCallback(async () => {
    if (!cancelAuction) return

    await cancelAuction(release?.collectionAddress, Number(release?.tokenId))
  }, [cancelAuction])

  /*

  handle burn token

*/
  const handleBurn = React.useCallback(async () => {
    if (!burn) return

    await burn(Number(release?.tokenId))
  }, [burn])

  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  useClickOutside(ref, () => setIsOpen(false))
  const dropdownVariants = {
    initial: {
      height: "0",
    },
    animate: {
      height: "auto",
      padding: 10,
      border: '1px solid #e5e7eb',
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  }
  const toggleVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: 90,
    },
  }

  return (
    <div ref={ref}>
      <motion.div
        variants={toggleVariants}
        animate={isOpen ? "animate" : "initial"}
        className={"absolute top-1 right-1 cursor-pointer rounded  p-2 shadow-xl"}
        onClick={() => setIsOpen(bool => !bool)}
      >
        <BsThreeDotsVertical size={20} color={"#fff"} />
      </motion.div>
      <motion.div
        initial={"initial"}
        variants={dropdownVariants}
        animate={isOpen ? "animate" : "initial"}
        className={"absolute top-1 left-5 top-9 box-border h-0 w-10/12 overflow-hidden rounded  shadow-2xl"}
      >
        <div className={"mb-2  text-xl  text-gray-500"}>Auction Controls</div>
        {!auction?.notForAuction ? (
          <>
            <AnimatedModal
              trigger={
                <button
                  className={"mb-2 flex w-full justify-center rounded border bg-white py-1 px-2 text-black"}
                >
                  update auction reserve price
                </button>
              }
              size={"auto"}
            >
              <Form
                fields={updateReservePriceFields}
                initialValues={{ reservePrice: auction?.reservePrice }}
                submitCallback={handleSetAuctionReservePrice}
                buttonText={"Update"}
              />
            </AnimatedModal>
            <button
              className={"mb-2 flex w-full justify-center rounded border bg-white py-1 px-2 text-black"}
              onClick={() => handleCancelAuction()}
            >
              cancel auction
            </button>
          </>
        ) : isApprovedForAll && isModuleApproved ? (
          <>
            <CreateAuction release={release} />
            <button
              className={"mb-2 flex w-full justify-center rounded border bg-white py-1 px-2 text-black"}
              onClick={() => handleBurn()}
            >
              burn token
            </button>
          </>
        ) : (
          <>
            {!isApprovedForAll && (
              <button
                className={"mb-2 flex w-full justify-center rounded border bg-white py-1 px-2 text-black"}
                onClick={() => handleApprovalTransferHelper()}
              >
                allow zora auction
              </button>
            )}
            {!isModuleApproved && (
              <button
                className={"mb-2 flex w-full justify-center rounded border bg-white py-1 px-2 text-black"}
                onClick={() => handleApprovalManager()}
              >
                allow zora manager{" "}
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

export default AuctionControls
