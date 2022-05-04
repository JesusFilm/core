import React from 'react'
import dynamic from 'next/dynamic'


export function Countries(): React.ReactElement {
  const Mapped = React.useMemo(() => dynamic(
    async () => await import(
      /* webpackChunkName: "Map" */
      './Map'),
    { 
      loading: () => <p>A map is loading</p>,
      ssr: false // This line is important. It's what prevents server-side render
    }
  ), [/* list variables which should trigger a re-render here */])
  return <Mapped coordinates={[51.505, -0.09]} zoom={13} />
}

