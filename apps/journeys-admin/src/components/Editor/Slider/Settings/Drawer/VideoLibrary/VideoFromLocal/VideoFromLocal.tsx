import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { VideoBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { VideoList } from '../VideoList'
import { VideoSearch } from '../VideoSearch'

interface VideoFromLocalProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromLocal({
  onSelect
}: VideoFromLocalProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { refine, query } = useSearchBox()
  const { loading, isLastPage, items, showMore } = useAlgoliaVideos()

  async function handleFetchMore(): Promise<void> {
    showMore()
  }

  function handleChange(value: string): void {
    refine(value)
  }

  return (
    <>
      <VideoSearch value={query} onChange={handleChange} icon="search" />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {query === '' && (
          <Box sx={{ pb: 4, px: 6 }}>
            <Typography variant="overline" color="primary">
              {'Jesus Film Library'} {/* This should not be translated as it is a corporate name, same as YouTube. */ }
            </Typography>
            <Typography variant="h6">{t('Featured Videos')}</Typography>
          </Box>
        )}
        <VideoList
          onSelect={onSelect}
          loading={loading}
          videos={items}
          fetchMore={handleFetchMore}
          hasMore={!isLastPage}
        />
      </Box>
    </>
  )
}
