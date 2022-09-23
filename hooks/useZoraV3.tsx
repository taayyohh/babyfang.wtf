import ZORA_ADDRESSES from "@zoralabs/v3/dist/addresses/5.json"
import ReserveAuctionCoreEth from "@zoralabs/v3/dist/artifacts/ReserveAuctionCoreEth.sol/ReserveAuctionCoreEth.json"
import ZoraModuleManager from "@zoralabs/v3/dist/artifacts/ZoraModuleManager.sol/ZoraModuleManager.json"
import AsksV1_1ABI from "@zoralabs/v3/dist/artifacts/AsksV1_1.sol/AsksV1_1.json"
import ERC721TransferHelperABI from "@zoralabs/v3/dist/artifacts/ERC721TransferHelper.sol/ERC721TransferHelper.json"
import { useSigner } from "wagmi"
import React from "react"
import useSWR from "swr"
import { BigNumberish, ethers } from "ethers"
import { PromiseOrValue } from "@typechain/ethers-v5/static/common"

const useZoraV3 = () => {
  const { data: signer } = useSigner()
  const [zoraContracts, setZoraContracts] = React.useState<any>()

  React.useMemo(() => {
    if (!signer) return
    // const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL)

    setZoraContracts({
      ReserveAuctionCoreEth: new ethers.Contract(
        ZORA_ADDRESSES.ReserveAuctionCoreEth,
        ReserveAuctionCoreEth.abi,
        signer
      ),
      AsksV1_1: new ethers.Contract(ZORA_ADDRESSES.AsksV1_1, AsksV1_1ABI.abi, signer),
      ZoraModuleManager: new ethers.Contract(ZORA_ADDRESSES.ZoraModuleManager, ZoraModuleManager.abi, signer),
      ERC721TransferHelper: new ethers.Contract(
        ZORA_ADDRESSES.ERC721TransferHelper,
        ERC721TransferHelperABI.abi,
        signer
      ),
    })
  }, [
    signer,
    ZORA_ADDRESSES.ReserveAuctionCoreEth,
    ZORA_ADDRESSES.AsksV1_1,
    ZORA_ADDRESSES.ZoraModuleManager,
    ZORA_ADDRESSES.ERC721TransferHelper,
  ])

  /*

      Create Auction

     */
  const createAuction = React.useCallback(
    async (
      _tokenContract: PromiseOrValue<string>,
      _tokenId: PromiseOrValue<BigNumberish>,
      _duration: PromiseOrValue<BigNumberish>,
      _reservePrice: PromiseOrValue<BigNumberish>,
      _sellerFundsRecipient: PromiseOrValue<string>,
      _startTime: PromiseOrValue<BigNumberish>
    ) => {
      await zoraContracts?.ReserveAuctionCoreEth?.createAuction(
        _tokenContract,
        _tokenId,
        _duration,
        _reservePrice,
        _sellerFundsRecipient,
        _startTime
      )
    },
    [zoraContracts?.ReserveAuctionCoreEth]
  )

  /*

      Settle Auction

     */
  const settleAuction = React.useCallback(
    async (_tokenContract: PromiseOrValue<string>, _tokenId: PromiseOrValue<BigNumberish>) => {
      await zoraContracts?.ReserveAuctionCoreEth.settleAuction(_tokenContract, _tokenId)
    },
    [zoraContracts?.ReserveAuctionCoreEth]
  )

  /*

    Settle Auction

   */
  const cancelAuction = React.useCallback(
    async (_tokenContract: PromiseOrValue<string>, _tokenId: PromiseOrValue<BigNumberish>) => {
      await zoraContracts?.ReserveAuctionCoreEth.cancelAuction(_tokenContract, _tokenId)
    },
    [zoraContracts?.ReserveAuctionCoreEth]
  )

  /*

        isModuleApproved

     */
  const { data: isModuleApproved } = useSWR(
    zoraContracts?.ZoraModuleManager ? `has-approved-zora-module-manager` : null,
    async () => {
      return zoraContracts?.ZoraModuleManager?.isModuleApproved(
        // @ts-ignore
        signer._address, // NFT owner address
        ZORA_ADDRESSES.ReserveAuctionCoreEth
      )
    },
    { revalidateOnFocus: true }
  )

  const handleApprovalManager = React.useCallback(async () => {
    await zoraContracts?.ZoraModuleManager.setApprovalForModule(ZORA_ADDRESSES.ReserveAuctionCoreEth, true)
  }, [zoraContracts?.ZoraModuleManager])

  return {
    zoraContracts,
    ReserveAuctionCoreEth: zoraContracts?.ReserveAuctionCoreEth,
    AsksV1_1: zoraContracts?.AsksV1_1,
    ZoraModuleManager: zoraContracts?.ZoraModuleManager,
    ERC721TransferHelper: zoraContracts?.ERC721TransferHelper,
    isModuleApproved,
    handleApprovalManager,
    createAuction,
    settleAuction,
    cancelAuction,
  }
}

export default useZoraV3
