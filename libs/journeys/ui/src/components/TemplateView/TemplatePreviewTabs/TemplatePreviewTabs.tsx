import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, SyntheticEvent, useMemo, useState } from 'react'

import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { TreeBlock } from '../../../libs/block/TreeBlock'
import { useJourney } from '../../../libs/JourneyProvider'
import { transformer } from '../../../libs/transformer'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../libs/useJourneyQuery/__generated__/GetJourney'

import { TemplateCardPreview } from './TemplateCardPreview/TemplateCardPreview'
import { TemplateVideoPreview } from './TemplateVideoPreview'

interface TemplatePreviewTabsProps {
  authUser?: User
}

export function TemplatePreviewTabs({
  authUser
}: TemplatePreviewTabsProps): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const { t } = useTranslation('libs-journeys-ui')

  const { journey } = useJourney()

  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined

  const videos = useMemo(() => {
    // filter background videos from interactive videos
    const videoBlocks = journey?.blocks?.filter(
      (block) => block.__typename === 'VideoBlock'
    ) as Array<TreeBlock<VideoBlock>>

    const cardBlocksWithVideos = journey?.blocks?.filter(
      (block) => block.__typename === 'CardBlock' && block.coverBlockId != null
    ) as Array<TreeBlock<CardBlock>>

    const cardBlockCoverIds = cardBlocksWithVideos?.map(
      (block) => block.coverBlockId
    )

    return videoBlocks?.filter(({ id }) => !cardBlockCoverIds?.includes(id))
  }, [journey?.blocks])

  const handleTabChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ pb: { sm: 5 } }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 3, sm: 7 } }}
      >
        <Tab
          suppressHydrationWarning
          label={
            steps != null ? (
              t('{{count}} Cards', { count: steps.length })
            ) : (
              <Skeleton width={72} height="100%" />
            )
          }
          {...tabA11yProps('cards-preview-tab', 0)}
          sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { sm: 200 } }}
        />
        <Tab
          suppressHydrationWarning
          disabled={videos?.length === 0 || videos == null}
          label={
            videos != null ? (
              t('{{count}} Videos', { count: videos.length })
            ) : (
              <Skeleton width={72} height="100%" />
            )
          }
          {...tabA11yProps('videos-preview-tab', 1)}
          sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: { sm: 200 } }}
        />
      </Tabs>
      <TabPanel name="cards-preview-tab" value={tabValue} index={0}>
        <TemplateCardPreview steps={steps} authUser={authUser} />
      </TabPanel>
      <TabPanel name="videos-preview-tab" value={tabValue} index={1}>
        <TemplateVideoPreview videoBlocks={videos} />
      </TabPanel>
    </Box>
  )
}
