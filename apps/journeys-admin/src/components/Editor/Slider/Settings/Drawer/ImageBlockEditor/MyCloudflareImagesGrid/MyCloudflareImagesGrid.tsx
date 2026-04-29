import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import ImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'

export const GET_MY_CLOUDFLARE_IMAGES = gql`
  query GetMyCloudflareImages($first: Int, $after: String, $isAi: Boolean) {
    getMyCloudflareImages(first: $first, after: $after, isAi: $isAi) {
      edges {
        cursor
        node {
          id
          url
          blurhash
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

interface CloudflareImage {
  id: string
  url: string | null
  blurhash: string | null
}

interface CloudflareImageEdge {
  cursor: string
  node: CloudflareImage | null
}

interface GetMyCloudflareImagesData {
  getMyCloudflareImages: {
    edges: (CloudflareImageEdge | null)[] | null
    pageInfo: {
      endCursor: string | null
      hasNextPage: boolean
    }
  } | null
}

interface GetMyCloudflareImagesVariables {
  first?: number
  after?: string | null
  isAi?: boolean
}

interface MyCloudflareImagesGridProps {
  title: string
  selectedSrc?: string | null
  onSelect: (input: ImageBlockUpdateInput) => void
  isAi?: boolean
  uploading?: boolean
}

const PAGE_SIZE = 9

export function MyCloudflareImagesGrid({
  title,
  selectedSrc,
  onSelect,
  isAi,
  uploading
}: MyCloudflareImagesGridProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImagesData,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { first: PAGE_SIZE, isAi },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true
  })

  const edges = data?.getMyCloudflareImages?.edges ?? []
  const hasMore = data?.getMyCloudflareImages?.pageInfo?.hasNextPage === true
  const endCursor = data?.getMyCloudflareImages?.pageInfo?.endCursor ?? null
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const images = edges
    .map((edge) => edge?.node)
    .filter(
      (node): node is CloudflareImage => node != null && node.url != null
    )
    .map((node) => ({
      ...node,
      src: `${node.url as string}/public`
    }))

  if (
    !loading &&
    error == null &&
    images.length === 0 &&
    uploading !== true
  )
    return null

  const handleClick = (img: { src: string; blurhash: string | null }): void => {
    onSelect({
      src: img.src,
      blurhash: img.blurhash,
      scale: 100,
      focalLeft: 50,
      focalTop: 50,
      customizable: null
    })
  }

  return (
    <Stack sx={{ px: 6, pb: 4, pt: 2 }} data-testid="MyCloudflareImagesGrid">
      <Typography variant="overline" color="primary" sx={{ pb: 1 }}>
        {title}
      </Typography>
      {error != null && (
        <Typography color="error" variant="body2">
          {t('Could not load your images.')}
        </Typography>
      )}
      <ImageList gap={8} cols={3} sx={{ overflowY: 'visible', m: 0 }}>
        {uploading === true && (
          <ImageListItem
            data-testid="my-cloudflare-image-uploading"
            sx={{
              background: (theme) => theme.palette.divider,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                aspectRatio: '1/1',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          </ImageListItem>
        )}
        {images.map((img) => (
          <ImageListItem
            key={img.id}
            data-testid={`my-cloudflare-image-${img.id}`}
            sx={{
              background: (theme) => theme.palette.divider,
              outline: '2px solid',
              transition: (theme) => theme.transitions.create('outline-color'),
              outlineColor: (theme) =>
                selectedSrc === img.src
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
                src={img.src}
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
              />
            </ButtonBase>
          </ImageListItem>
        ))}
      </ImageList>
      {hasMore && (
        <Button
          variant="outlined"
          onClick={() =>
            void fetchMore({
              variables: { first: PAGE_SIZE, after: endCursor }
            })
          }
          loading={isFetchingMore}
          disabled={isFetchingMore}
          startIcon={<Plus2Icon />}
          size="medium"
          sx={{ mt: 4 }}
        >
          {isFetchingMore ? t('Loading...') : t('Load More')}
        </Button>
      )}
    </Stack>
  )
}
