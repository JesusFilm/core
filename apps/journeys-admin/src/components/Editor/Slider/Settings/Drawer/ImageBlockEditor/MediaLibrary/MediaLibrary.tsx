import { NetworkStatus, gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useRef, useState } from 'react'

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
  query GetMyCloudflareImages(
    $offset: Int
    $limit: Int
    $isAi: Boolean
    $teamId: ID
  ) {
    getMyCloudflareImages(
      offset: $offset
      limit: $limit
      isAi: $isAi
      teamId: $teamId
    ) {
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
  /**
   * When set, the grid merges the caller's own uploads with assets shared by
   * this team. When null/undefined the query falls back to personal-only.
   */
  teamId?: string | null
  /**
   * Called when the team-scoped query is rejected with FORBIDDEN (e.g. the user
   * was removed from the team mid-session) so the caller can refresh the active
   * team and fall back to personal-only.
   */
  onForbidden?: () => void
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
  uploading,
  teamId,
  onForbidden
}: MediaLibraryProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [pagesFetched, setPagesFetched] = useState(1)

  const { data, loading, error, fetchMore, networkStatus } = useQuery<
    GetMyCloudflareImages,
    GetMyCloudflareImagesVariables
  >(GET_MY_CLOUDFLARE_IMAGES, {
    // Omit teamId entirely when there is no active team so the query (and its
    // cache entry) falls back to personal-only.
    variables: { offset: 0, limit: PEEK_LIMIT, isAi, teamId: teamId ?? undefined },
    notifyOnNetworkStatusChange: true
  })

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore

  const isForbidden =
    error?.graphQLErrors.some(
      (graphQLError) => graphQLError.extensions?.code === 'FORBIDDEN'
    ) ?? false

  // Recover gracefully when the team-scoped query is rejected (e.g. the user was
  // removed from the team mid-session): ask the caller to refresh the active
  // team, which drops teamId back to personal-only and refetches.
  const onForbiddenRef = useRef(onForbidden)
  onForbiddenRef.current = onForbidden
  useEffect(() => {
    if (isForbidden) onForbiddenRef.current?.()
  }, [isForbidden])

  const allImages = toRenderedImages(data?.getMyCloudflareImages ?? [])
  const images = allImages.slice(0, pagesFetched * PAGE_SIZE)

  const hasMore = allImages.length > pagesFetched * PAGE_SIZE

  const isEmpty =
    !loading && error == null && uploading !== true && images.length === 0
  if (isEmpty) return null

  function handleSelect(img: MediaLibraryListImage): void {
    sendImageSelectEvent({ isAi })
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
        isAi,
        teamId: teamId ?? undefined
      }
    }).catch(() => null)
    if (result == null) return
    setPagesFetched((prev) => prev + 1)
  }

  return (
    <Stack sx={{ p: 6, gap: 2 }} data-testid="MediaLibrary">
      <Typography variant="overline">{title}</Typography>
      {error != null && !isForbidden && (
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
