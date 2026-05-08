import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import {
  GetMyCloudflareImages,
  GetMyCloudflareImagesVariables
} from '../../../../../../../../__generated__/GetMyCloudflareImages'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'

export const GET_MY_CLOUDFLARE_IMAGES = gql`
  query GetMyCloudflareImages($offset: Int, $limit: Int, $isAi: Boolean) {
    getMyCloudflareImages(offset: $offset, limit: $limit, isAi: $isAi) {
      id
      url
      blurhash
    }
  }
`

interface MediaLibraryImagesGridProps {
  title: string
  selectedSrc?: string | null
  onSelect: (input: ImageBlockUpdateInput) => void
  isAi?: boolean
  uploading?: boolean
}

interface RenderedImage {
  id: string
  src: string
  blurhash: string | null
}

const PAGE_SIZE = 10
const PEEK_LIMIT = PAGE_SIZE + 1

export function MediaLibraryImagesGrid({
  title,
  selectedSrc,
  onSelect,
  isAi,
  uploading
}: MediaLibraryImagesGridProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [displayCount, setDisplayCount] = useState<number | null>(null)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImages,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { offset: 0, limit: PEEK_LIMIT, isAi },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const allImages: RenderedImage[] = (
    data?.getMyCloudflareImages ?? []
  ).flatMap((image) =>
    image?.url == null
      ? []
      : [
          {
            id: image.id,
            src: `${image.url}/public`,
            blurhash: image.blurhash
          }
        ]
  )

  const effectiveDisplayCount =
    displayCount ?? Math.min(allImages.length, PAGE_SIZE)
  const images = allImages.slice(0, effectiveDisplayCount)
  const hasMore = allImages.length > effectiveDisplayCount

  if (!loading && error == null && images.length === 0 && uploading !== true)
    return null

  const handleClick = (img: RenderedImage): void => {
    onSelect({
      src: img.src,
      blurhash: img.blurhash,
      scale: 100,
      focalLeft: 50,
      focalTop: 50,
      customizable: null
    })
  }

  const handleLoadMore = async (): Promise<void> => {
    const result = await fetchMore({
      variables: { offset: effectiveDisplayCount, limit: PEEK_LIMIT, isAi }
    })
    const newItems = (result.data?.getMyCloudflareImages ?? []).length
    setDisplayCount(effectiveDisplayCount + Math.min(newItems, PAGE_SIZE))
  }

  return (
    <Stack
      sx={{
        px: 6,
        pb: 4,
        pt: 2,
        flex: 1,
        minHeight: 0
      }}
      data-testid="MediaLibraryImagesGrid"
    >
      <Typography
        sx={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          color: '#6D6D7D',
          textTransform: 'uppercase',
          letterSpacing: '0.27em',
          lineHeight: '16px',
          pb: 1.25,
          px: '2px'
        }}
      >
        {title}
      </Typography>
      {error != null && (
        <Typography color="error" variant="body2" sx={{ pb: 1 }}>
          {t('Could not load your images.')}
        </Typography>
      )}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          alignContent: 'flex-start'
        }}
      >
          {uploading === true && (
            <Box
              data-testid="media-library-image-uploading"
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                background: '#EFEFEF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
          {images.map((img) => (
            <ButtonBase
              key={img.id}
              data-testid={`media-library-image-${img.id}`}
              onClick={() => handleClick(img)}
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#EFEFEF',
                cursor: 'pointer',
                display: 'block',
                width: '100%'
              }}
            >
              <img
                src={img.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  opacity: 0,
                  transition: 'opacity 0.5s'
                }}
                onLoad={(event) => {
                  event.currentTarget.style.opacity = '1'
                }}
              />
              {selectedSrc === img.src && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '8px',
                    border: '2px solid #C52D3A',
                    pointerEvents: 'none'
                  }}
                />
              )}
        </ButtonBase>
        ))}
      </Box>
      <Button
        variant="outlined"
        onClick={() => void handleLoadMore()}
        disabled={!hasMore || isFetchingMore}
        loading={isFetchingMore}
        startIcon={<Plus2Icon />}
        size="medium"
        sx={{ mt: 4 }}
      >
        {!hasMore
          ? t('No more to load')
          : isFetchingMore
            ? t('Loading...')
            : t('Load More')}
      </Button>
    </Stack>
  )
}
