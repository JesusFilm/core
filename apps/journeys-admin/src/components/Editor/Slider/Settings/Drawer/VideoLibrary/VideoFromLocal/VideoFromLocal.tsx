import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import { VideoList } from '../VideoList'
import { VideoListProps } from '../VideoList/VideoList'
import { VideoSearch } from '../VideoSearch'

interface VideoFromLocalProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromLocal({
  onSelect
}: VideoFromLocalProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [searchQuery, setSearchQuery] = useState<string>('')

  const { status } = useInstantSearch()
  const { hits, showMore, isLastPage } = useInfiniteHits({})

  function transformItems(items): VideoListProps['videos'] {
    return items.map((videoVariant) => ({
      id: videoVariant.videoId,
      title: videoVariant.titles[0],
      description: videoVariant.description[0],
      image: videoVariant.image,
      duration: videoVariant.duration,
      source: VideoBlockSource.internal
    }))
  }

  const transformedHits = transformItems(hits)

  async function handleFetchMore(): Promise<void> {
    showMore()
  }

  return (
    <>
      <VideoSearch
        variant="internal"
        value={searchQuery}
        onChange={setSearchQuery}
        icon="search"
      />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {searchQuery === '' && (
          <Box sx={{ pb: 4, px: 6 }}>
            <Typography variant="overline" color="primary">
              {t('Jesus Film Library')}
            </Typography>
            <Typography variant="h6">{t('Featured Videos')}</Typography>
          </Box>
        )}
        <VideoList
          onSelect={onSelect}
          loading={status === 'loading' || status === 'stalled'}
          videos={transformedHits}
          fetchMore={handleFetchMore}
          hasMore={!isLastPage}
        />
      </Box>
    </>
  )
}
