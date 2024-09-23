import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { VideoBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { useAlgoliaLocalVideos } from '../utils/useAlgoliaLocalVideos'
import { VideoList } from '../VideoList'
import { VideoSearch } from '../VideoSearch'

interface VideoFromLocalProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromLocal({
  onSelect
}: VideoFromLocalProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [searchQuery, setSearchQuery] = useState<string>('')
  const { loading, isLastPage, items, showMore } = useAlgoliaLocalVideos()

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
          loading={loading}
          videos={items}
          fetchMore={handleFetchMore}
          hasMore={!isLastPage}
        />
      </Box>
    </>
  )
}
