import React, { ReactElement } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@apollo/client'
import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { GetCountries } from '../../__generated__/GetCountries'
import { GET_COUNTRIES } from '../../libs/countries/countries.graphql'

export default function Map({ coordinates, zoom }): ReactElement {
  const languageContext = useLanguage()
  const { data } = useQuery<GetCountries>(GET_COUNTRIES, {
    variables: {
      languageId: languageContext?.id ?? '529'
    }
  })
  return (
    <MapContainer
      center={coordinates}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {data?.countries != null &&
        data.countries.map((country) => (
          <Marker
            position={[country.latitude, country.longitude]}
            key={country.id}
          >
            <Popup>
              <Link href={`/countries/${country.permalink[0]?.value}`}>
                {country.name[0]?.value}
              </Link>
            </Popup>
          </Marker>
        ))}
      <Marker position={coordinates}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  )
}
