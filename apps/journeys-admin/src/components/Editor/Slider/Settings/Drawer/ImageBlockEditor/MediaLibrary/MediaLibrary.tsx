import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useRef, useState } from 'react'

import {
  GetMyCloudflareImages,
  GetMyCloudflareImagesVariables,
  GetMyCloudflareImages_getMyCloudflareImages as CloudFlareImage
} from '../../../../../../../../__generated__/GetMyCloudflareImages'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { LoadMoreButton } from '../LoadMoreButton'
import { MediaLibraryList, MediaLibraryListImage } from './MediaLibraryList'

export const GET_MY_CLOUDFLARE_IMAGES = gql`
  query GetMyCloudflareImages($offset: Int, $limit: Int, $isAi: Boolean) {
    getMyCloudflareImages(offset: $offset, limit: $limit, isAi: $isAi) {
      id
      url
      blurhash
    }
  }
`

interface MediaLibraryProps {
  title: string
  selectedSrc?: string | null
  onSelect: (input: ImageBlockUpdateInput) => void
  isAi?: boolean
  uploading?: boolean
}

const PAGE_SIZE = 10
const PEEK_LIMIT = PAGE_SIZE + 1

function toRenderedImages(
  images: readonly CloudFlareImage[]
): MediaLibraryListImage[] {
  return images.flatMap((image) =>
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
}

export function MediaLibrary({
  title,
  selectedSrc,
  onSelect,
  isAi,
  uploading
}: MediaLibraryProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [displayCount, setDisplayCount] = useState<number | null>(null)
  const wasUploadingRef = useRef(false)

  useEffect(() => {
    if (wasUploadingRef.current && uploading !== true) {
      setDisplayCount((current) => (current ?? PAGE_SIZE) + 1)
    }
    wasUploadingRef.current = uploading === true
  }, [uploading])

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImages,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { offset: 0, limit: PEEK_LIMIT, isAi },
    notifyOnNetworkStatusChange: true
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const allImages = toRenderedImages(data?.getMyCloudflareImages ?? [])

  const effectiveDisplayCount =
    displayCount ?? Math.min(allImages.length, PAGE_SIZE)
  const images = allImages.slice(0, effectiveDisplayCount)
  const hasMore = allImages.length > effectiveDisplayCount

  const isEmpty = !loading && error == null && !uploading && images.length === 0
  if (isEmpty) return null

  function handleSelect(img: MediaLibraryListImage): void {
    onSelect({
      src: img.src,
      blurhash: img.blurhash,
      scale: 100,
      focalLeft: 50,
      focalTop: 50,
      customizable: null
    })
  }

  async function handleLoadMore(): Promise<void> {
    const result = await fetchMore({
      variables: { offset: effectiveDisplayCount, limit: PEEK_LIMIT, isAi }
    })
    const newItems = (result.data?.getMyCloudflareImages ?? []).length
    setDisplayCount(effectiveDisplayCount + Math.min(newItems, PAGE_SIZE))
  }

  return (
    <Stack
      sx={{
        p: 6,
        gap: 2
      }}
      data-testid="MediaLibrary"
    >
      <Typography variant="overline">{title}</Typography>
      {error != null && (
        <Typography color="error" variant="body2" sx={{ pb: 1 }}>
          {t('Could not load your images.')}
        </Typography>
      )}
      <MediaLibraryList
        images={images}
        selectedSrc={selectedSrc}
        handleSelect={handleSelect}
        uploading={uploading}
        hasMore={hasMore}
        loadingMore={isFetchingMore}
        onLoadMore={() => void handleLoadMore()}
      />
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <LoadMoreButton
          hasMore={hasMore}
          loading={isFetchingMore}
          onClick={() => void handleLoadMore()}
        />
      </Box>
    </Stack>
  )
}
