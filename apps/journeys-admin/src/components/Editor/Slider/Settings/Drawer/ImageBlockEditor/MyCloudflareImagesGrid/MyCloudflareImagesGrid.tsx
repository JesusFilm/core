import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { keyframes } from '@mui/system'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import {
  GetMyCloudflareImages,
  GetMyCloudflareImagesVariables,
  GetMyCloudflareImages_getMyCloudflareImages as CloudflareImageNode
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

interface MyCloudflareImagesGridProps {
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

const PAGE_SIZE = 9

const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`

export function MyCloudflareImagesGrid({
  title,
  selectedSrc,
  onSelect,
  isAi,
  uploading
}: MyCloudflareImagesGridProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [hasMore, setHasMore] = useState(true)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImages,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { offset: 0, limit: PAGE_SIZE, isAi },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    onCompleted: (result) => {
      setHasMore((result.getMyCloudflareImages ?? []).length >= PAGE_SIZE)
    }
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const images: RenderedImage[] = (data?.getMyCloudflareImages ?? [])
    .filter(
      (node): node is CloudflareImageNode =>
        node != null && node.url != null
    )
    .map((node) => ({
      id: node.id,
      src: `${node.url as string}/public`,
      blurhash: node.blurhash
    }))

  if (
    !loading &&
    error == null &&
    images.length === 0 &&
    uploading !== true
  )
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
      variables: { offset: images.length, limit: PAGE_SIZE, isAi }
    })
    setHasMore((result.data?.getMyCloudflareImages ?? []).length >= PAGE_SIZE)
  }

  return (
    <Stack sx={{ px: 6, pb: 4, pt: 2 }} data-testid="MyCloudflareImagesGrid">
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
          maxHeight: { xs: 220, sm: 300 },
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.28) transparent',
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.24)',
            borderRadius: 8,
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
            minHeight: 32
          }
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}
        >
          {uploading === true && (
            <Box
              data-testid="my-cloudflare-image-uploading"
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                overflow: 'hidden',
                background:
                  'linear-gradient(90deg, #ECECF0 0%, #F6F6F9 50%, #ECECF0 100%)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 1.4s ease-in-out infinite`
              }}
            >
              <Typography
                sx={{
                  position: 'absolute',
                  bottom: 28,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: '#6D6D7D',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  zIndex: 3
                }}
              >
                {t('Processing')}
              </Typography>
              <LinearProgress
                sx={{
                  position: 'absolute',
                  left: '10%',
                  right: '10%',
                  bottom: 14,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(24,24,32,0.10)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#444451'
                  }
                }}
              />
            </Box>
          )}
          {images.map((img) => (
            <ButtonBase
              key={img.id}
              data-testid={`my-cloudflare-image-${img.id}`}
              onClick={() => handleClick(img)}
              sx={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#EFEFEF',
                cursor: 'pointer',
                transition: (theme) => theme.transitions.create('box-shadow'),
                boxShadow:
                  selectedSrc === img.src
                    ? '0 0 0 2px #C52D3A'
                    : 'none',
                display: 'block',
                width: '100%'
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            </ButtonBase>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
        <Button
          variant="outlined"
          onClick={() => void handleLoadMore()}
          disabled={!hasMore || isFetchingMore}
          sx={{
            height: 32,
            fontSize: 14,
            fontWeight: 600,
            px: '10px',
            borderRadius: '8px',
            borderColor: '#DEDFE0',
            color: '#444451',
            textTransform: 'none',
            fontFamily: 'Montserrat, sans-serif',
            '&:hover': {
              borderColor: '#C7C9D3',
              backgroundColor: 'transparent'
            }
          }}
        >
          {!hasMore
            ? t('No more to load')
            : isFetchingMore
              ? t('Loading...')
              : t('Load More')}
        </Button>
      </Box>
    </Stack>
  )
}
