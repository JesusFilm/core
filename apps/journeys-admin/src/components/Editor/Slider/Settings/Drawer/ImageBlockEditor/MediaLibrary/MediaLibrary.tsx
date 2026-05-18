import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import {
  GetMyCloudflareImages,
  GetMyCloudflareImagesVariables,
  GetMyCloudflareImages_getMyCloudflareImages as CloudflareImage
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
  isAi: boolean
  localImages?: MediaLibraryListImage[]
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
  localImages,
  uploading
}: MediaLibraryProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [pagesFetched, setPagesFetched] = useState(1)
  const [serverHasMore, setServerHasMore] = useState<boolean | null>(null)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImages,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    variables: { offset: 0, limit: PEEK_LIMIT, isAi },
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    if (data == null || serverHasMore !== null) return
    setServerHasMore(data.getMyCloudflareImages.length === PEEK_LIMIT)
  }, [data, serverHasMore])

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const serverImages = toRenderedImages(data?.getMyCloudflareImages ?? [])
  const localIds = new Set((localImages ?? []).map((image) => image.id))
  const dedupedServer = serverImages.filter((image) => !localIds.has(image.id))
  const visibleServer = dedupedServer.slice(0, pagesFetched * PAGE_SIZE)
  const images = [...(localImages ?? []), ...visibleServer]

  const hasMore = serverHasMore === true

  const isEmpty =
    !loading && error == null && uploading !== true && images.length === 0
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
      variables: {
        offset: pagesFetched * PAGE_SIZE,
        limit: PEEK_LIMIT,
        isAi
      }
    })
    const fetched = result.data?.getMyCloudflareImages.length ?? 0
    setPagesFetched((prev) => prev + 1)
    setServerHasMore(fetched === PEEK_LIMIT)
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
        onClick={() => void handleLoadMore()}
      />
    </Stack>
  )
}
