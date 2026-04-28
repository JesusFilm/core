import { gql, useQuery } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'

export const GET_MY_CLOUDFLARE_IMAGES = gql`
  query GetMyCloudflareImages($offset: Int, $limit: Int) {
    getMyCloudflareImages(offset: $offset, limit: $limit) {
      id
      url
      blurhash
    }
  }
`

interface CloudflareImage {
  id: string
  url: string | null
  blurhash: string | null
}

interface GetMyCloudflareImagesData {
  getMyCloudflareImages: CloudflareImage[]
}

interface GetMyCloudflareImagesVariables {
  offset?: number
  limit?: number
}

interface MyCloudflareImagesGridProps {
  title: string
  selectedSrc?: string | null
  onSelect: (input: ImageBlockUpdateInput) => void
}

export function MyCloudflareImagesGrid({
  title,
  selectedSrc,
  onSelect
}: MyCloudflareImagesGridProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  const { data, loading, error } = useQuery<
    GetMyCloudflareImagesData,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { limit: 60 },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  })

  const images = (data?.getMyCloudflareImages ?? []).filter(
    (img) => img.url != null
  )

  if (!loading && error == null && images.length === 0) return null

  const handleClick = (img: CloudflareImage): void => {
    if (img.url == null) return
    onSelect({
      src: img.url,
      blurhash: img.blurhash,
      scale: 100,
      focalLeft: 50,
      focalTop: 50,
      customizable: null
    })
  }

  return (
    <Stack sx={{ pb: 4 }} data-testid="MyCloudflareImagesGrid">
      <Typography variant="overline" color="primary" sx={{ pb: 1 }}>
        {title}
      </Typography>
      {error != null && (
        <Typography color="error" variant="body2">
          {t('Could not load your images.')}
        </Typography>
      )}
      <ImageList gap={8} cols={3} sx={{ overflowY: 'visible', m: 0 }}>
        {images.map((img) => (
          <ImageListItem
            key={img.id}
            data-testid={`my-cloudflare-image-${img.id}`}
            sx={{
              background: (theme) => theme.palette.divider,
              outline: '2px solid',
              transition: (theme) => theme.transitions.create('outline-color'),
              outlineColor: (theme) =>
                selectedSrc === img.url
                  ? theme.palette.primary.main
                  : 'transparent',
              borderRadius: 2,
              outlineOffset: 2,
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <ButtonBase onClick={() => handleClick(img)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url ?? undefined}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  transition: 'opacity 0.5s'
                }}
                onLoad={(event) => {
                  event.currentTarget.style.opacity = '1'
                }}
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            </ButtonBase>
          </ImageListItem>
        ))}
      </ImageList>
    </Stack>
  )
}
