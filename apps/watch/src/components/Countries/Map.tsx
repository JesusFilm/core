import React, { ReactElement } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useRouter } from 'next/router'

import 'leaflet/dist/leaflet.css'
import { useQuery } from '@apollo/client'
import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { GetCountries } from '../../../__generated__/GetCountries'
import { GET_COUNTRIES } from '../../libs/countries/countries.graphql'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
})

L.Marker.prototype.options.icon = DefaultIcon

export default function Map({ coordinates, zoom }): ReactElement {
  const router = useRouter()
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
              <Stack direction="row" spacing={2}>
                <div>
                  <Typography variant="subtitle1">
                    {country.name[0]?.value}
                  </Typography>
                  <Typography variant="subtitle2">
                    {country.population.toLocaleString(
                      router.locale ?? router.defaultLocale
                    )}
                  </Typography>
                </div>
                <div style={{ width: 100 }}>
                  {country.image != null && (
                    <Image
                      src={country.image}
                      alt={country.name[0]?.value}
                      width={100}
                      height={51}
                    />
                  )}
                </div>
              </Stack>
              <Stack justifyContent="center">
                <Link href={`/countries/${country.slug[0]?.value}`} passHref>
                  <Button color="primary">View</Button>
                </Link>
              </Stack>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
