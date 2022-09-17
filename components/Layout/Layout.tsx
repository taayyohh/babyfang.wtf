import React from "react"
import Nav from "./Nav"
import { useSigner } from "wagmi"
import { useLayoutStore } from "stores/useLayoutStore"
import Player from "./Player"

type Props = {
  children: JSX.Element
}

const Layout = ({ children }: Props) => {
  const { data, isError, isLoading } = useSigner()
  const { setSigner, setProvider, setSignerAddress } = useLayoutStore()
  const signer = React.useMemo(() => {
    return data
  }, [isLoading, isError, data])

  React.useEffect(() => {
    if (!signer) return
    if (!signer.provider) return

    setSigner(signer)
    setProvider(signer.provider)
  }, [signer])

  /*

  extract signer Address

*/
  React.useMemo(async () => {
    if (!!signer) {
      /* @ts-ignore */ //TODO: handle this
      setSignerAddress(await signer._address)
    }
  }, [signer])

  return (
    <div className="min-h-screen bg-rose-50">
      <Nav />
      {children}
      <Player />
    </div>
  )
}

export default Layout
