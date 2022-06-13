import React from 'react'
import Bundlr from "@bundlr-network/client";
import {useLayoutStore} from "../../stores/useLayoutStore";
import {Formik} from 'formik';
import {ethers} from "ethers";

const Upload = () => {
    const provider = useLayoutStore((state: any) => state.provider)

    /* initialize bundler */
    const bundlr = React.useMemo(async () => {
        if (!provider) return
        return new Bundlr("https://node1.bundlr.network", "matic", provider)
    }, [provider])

    /*  manage state */
    const [instance, setInstance] = React.useState(null)
    const [walletBalance, setWalletBalance] = React.useState(0)
    const [buffer, setBuffer] = React.useState(null)
    const [txId, setTxId] = React.useState(null)
    const [priceOfUpload, setPriceOfUpload] = React.useState(0)
    const [file, setFile] = React.useState(null)
    const [localUrl, setLocalUrl] = React.useState(null)


    const getBalance = React.useMemo(async () => {
        if (!instance) return

        const balance = await instance.getLoadedBalance()
        setWalletBalance(parseFloat(ethers.utils.formatEther(balance.toString())))
    }, [instance])

    const handleSubmit = (values: { file: {}; }) => {
        createBundlrTx(values.file, values.file.type)
    }

    const getPrice = React.useCallback(async (files) => {
        try {
            const price = await instance.getPrice(files[0]?.size)
            setPriceOfUpload(parseFloat(ethers.utils.formatEther(price.toString())))
        } catch (err) {
            console.log('err', err)
        }

    }, [instance])

    const getBuffer = React.useCallback(async (file) => {
        const tags = [{name: "Content-Type", value: file.type}]
        const blob = new Blob([file], {type: file.type})

        let reader = new FileReader()
        reader.onload = async function (evt) {
            console.log(evt.target.result);
            setBuffer(evt.target.result)
        }
        reader.readAsArrayBuffer(blob)

    }, [instance])

    const createBundlrTx = async (data, value: string) => {
        try {
            await provider._ready()
            const tags = [{name: "Content-Type", value}]

            const ex = await execute(await instance, tags)
            setTxId(ex)

        } catch (err) {
            console.log('err', err)
        }
    }

    const execute = React.useCallback(async (instance: any, tags: any) => {
        if (!buffer) return

        const tx = instance.createTransaction(buffer, {tags: tags});
        await tx.sign();
        await tx.upload()
        return (await tx.upload()).data.id

    }, [buffer])

    const handleFund = React.useCallback(async (price) => {
        const amount = ethers.utils.parseEther(price.toString()).toString()
        const fund = await instance.fund(amount, 1.1)
        await getBalance

    }, [instance])

    /* styles */
    const button = "inline-flex self-start p-4 bg-rose-400 text-white font-bold shadow-xl rounded-xl hover:bg-rose-500 flex hover:cursor-pointer items-center justify-center mx-auto my-2 w-full"
    const infoSection = "flex flex-col items-center bg-rose-100 p-4 rounded-xl shadow-inner mb-2"
    const infoSectionHeading = "text-lg font-bold"


    return (
        <div className="mt-8 flex flex-col max-w-xl mx-auto bg-rose-200 p-8 rounded-xl">
            <div className="flex center items-center justify-center text-2xl mb-4">
                <div className="flex ml-2">
                    <div className="flex overflow-hidden h-8 w-8 mr-2 rounded-full">
                        <img src="https://docs.bundlr.network/img/logo.svg"/>
                    </div>
                    <a className="text-xl" href={'https://bundlr.network/'}>Bundlr Uploader</a>
                </div>

            </div>
            {(!!instance && (
                <>
                    <div>
                        <div className={infoSection}>
                            <div className={infoSectionHeading}>Bundlr Wallet Balance</div>
                            <div>{walletBalance} MATIC</div>
                        </div>
                        <div className={infoSection}>
                            <div className={infoSectionHeading}>Price of Upload</div>
                            <div>{priceOfUpload} MATIC</div>
                        </div>
                        {priceOfUpload - walletBalance > 0
                            ? <div className={`${infoSection} border border-rose-500`}>
                                <div className={infoSectionHeading}>Funding Needed</div>
                                <div className="font-bold">{priceOfUpload - walletBalance}</div>
                            </div> : null}
                    </div>
                    {priceOfUpload - walletBalance > 0 ?
                        <div className="flex items-center">
                            <button className={button} type="button" onClick={() => handleFund(priceOfUpload)}>
                                Fund
                            </button>
                        </div> : null}
                    <div className="flex flex-col">
                        <Formik
                            initialValues={{file: {}}}
                            onSubmit={(values) => handleSubmit(values)}
                        >
                            {props => (
                                <form onSubmit={props.handleSubmit} className="flex flex-col">
                                    <>
                                        {priceOfUpload && walletBalance && (priceOfUpload - walletBalance <= 0) ? (
                                            <button type="submit" className={button}>Submit</button>
                                        ) : null}

                                        <label htmlFor="file-upload" className={`${button} bg-rose-300`}>
                                            Select File
                                        </label>
                                        <input
                                            className="hidden"
                                            id="file-upload"
                                            name="file"
                                            type="file"
                                            onChange={(event) => {
                                                props.setFieldValue("file", event.currentTarget.files[0]);
                                                setFile(event.currentTarget.files[0])
                                                setLocalUrl(URL.createObjectURL(event.currentTarget.files[0]))
                                                getPrice(event.currentTarget.files)
                                                getBuffer(event.currentTarget.files[0])
                                            }}
                                        />
                                    </>
                                </form>
                            )}
                        </Formik>
                    </div>
                </>
            )) || (
                <div className="flex justify-center">
                    <button
                        type="button"
                        className={button}
                        onClick={async () => {
                            const instance = await bundlr
                            if (!!instance) {
                                await instance.ready()
                                await setInstance(instance)
                            }
                        }}
                    >
                        Connect to Bundlr
                    </button>
                </div>
            )}
            {file && (
                <div className={infoSection}>
                    <div className={infoSectionHeading}>File to Upload:</div>
                    <div className="flex flex-col items-center w-full justify-center pt-2 pb-4">
                        <div><span className="font-bold">name:</span> {file.name}</div>
                        <div><span className="font-bold">type:</span> {file.type}</div>
                    </div>
                    {localUrl && file.type.includes("image") && (
                        <div className="flex overflow-hidden h-32 w-32">
                            <img src={localUrl}/>
                        </div>
                    )}
                    {localUrl && file.type.includes("audio") && (
                        <audio controls>
                            <source src={localUrl} type="audio/ogg"/>
                        </audio>
                    )}
                </div>
            )}


            {!!txId && (
                <div className={infoSection}>
                    <div className={infoSectionHeading}>Uploaded File URL:</div>
                    <a className="text-sm" href={`https://arweave.net/${txId}`} target="_blank">
                        {`https://arweave.net/${txId}`}
                    </a>
                </div>
            )}
            <div className="text-xs flex justify-end mt-4">
                built by {" "}<a href={"https://github.com/taayyohh"} className="ml-1">taayohh</a>
            </div>

        </div>
    )

}

export default Upload
