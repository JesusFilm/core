import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { VideoBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { VideoList } from '../VideoList'
import { VideoSearch } from '../VideoSearch'

import { useVideoSearch } from './utils/useVideoSearch/useVideoSearch'

interface VideoFromLocalProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromLocal({
  onSelect
}: VideoFromLocalProps): ReactElement {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const { t } = useTranslation('apps-journeys-admin')

  const { handleLoadMore, loading, isEnd, algoliaVideos } =
    useVideoSearch(searchQuery)

  return (
    <>
      <VideoSearch
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
          videos={algoliaVideos}
          fetchMore={async () => await handleLoadMore()}
          hasMore={!isEnd}
        />
      </Box>
    </>
  )
}
