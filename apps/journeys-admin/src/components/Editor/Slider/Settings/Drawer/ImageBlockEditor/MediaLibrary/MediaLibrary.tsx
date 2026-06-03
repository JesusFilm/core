import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import {
  GetMyCloudflareImages_getMyCloudflareImages as CloudflareImage,
  GetMyCloudflareImages,
  GetMyCloudflareImagesVariables
} from '../../../../../../../../__generated__/GetMyCloudflareImages'
import { ImageBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { sendImageSelectEvent } from '../../../../../../../libs/sendMediaSelectEvent'
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
  isAi: boolean
  uploading?: boolean
}

const PAGE_SIZE = 10
const PEEK_LIMIT = PAGE_SIZE + 1

function toRenderedImages(
  images: readonly CloudflareImage[]
): MediaLibraryListImage[] {
  return images.flatMap((image) =>
    image.url == null
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
  const [pagesFetched, setPagesFetched] = useState(1)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImages,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { offset: 0, limit: PEEK_LIMIT, isAi },
    notifyOnNetworkStatusChange: true
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const allImages = toRenderedImages(data?.getMyCloudflareImages ?? [])
  const images = allImages.slice(0, pagesFetched * PAGE_SIZE)

  const hasMore = allImages.length > pagesFetched * PAGE_SIZE

  const isEmpty =
    !loading && error == null && uploading !== true && images.length === 0
  if (isEmpty) return null

  function handleSelect(img: MediaLibraryListImage): void {
    sendImageSelectEvent({ imageId: img.id, isAi })
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
      variables: {
        offset: pagesFetched * PAGE_SIZE,
        limit: PEEK_LIMIT,
        isAi
      }
    }).catch(() => null)
    if (result == null) return
    setPagesFetched((prev) => prev + 1)
  }

  return (
    <Stack sx={{ p: 6, gap: 2 }} data-testid="MediaLibrary">
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
      />
      <LoadMoreButton
        hasMore={hasMore}
        loading={loading || isFetchingMore}
        onClick={handleLoadMore}
      />
    </Stack>
  )
}
