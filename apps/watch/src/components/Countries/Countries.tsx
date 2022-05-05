import React from 'react'
import dynamic from 'next/dynamic'

interface CountriesProps {
  coordinates?: [float, float]
  zoom?: number
}

export function Countries({
  coordinates = [20, 0],
  zoom = 3
}: CountriesProps): React.ReactElement {
  const Mapped = React.useMemo(
    () =>
      dynamic(
        async () =>
          await import(
            /* webpackChunkName: "Map" */
            './Map'
          ),
        {
          loading: () => <p>A map is loading</p>,
          ssr: false // This line is important. It's what prevents server-side render
        }
      ),
    [
      /* list variables which should trigger a re-render here */
    ]
  )
  return <Mapped coordinates={coordinates} zoom={zoom} />
}
