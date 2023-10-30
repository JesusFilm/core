import 'swiper/swiper.min.css'
import 'swiper/components/scrollbar/scrollbar.min.css'

import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SwiperCore, { A11y, Mousewheel, Scrollbar } from 'swiper'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'

import { TemplateCardPreview } from './TemplateCardPreview/TemplateCardPreview'
import { TemplateVideoPreview } from './TemplateVideoPreview'

SwiperCore.use([Mousewheel, Scrollbar, A11y])

export function TemplatePreviewTabs(): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme?.breakpoints?.up('sm'))
  const { journey } = useJourney()

  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined

  const videoBlocks = useMemo(() => {
    return journey?.blocks?.filter(
      (block) => block.__typename === 'VideoBlock'
    ) as Array<TreeBlock<VideoBlock>>
  }, [journey])

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  return (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          disableRipple
          label={t('{{cardBlockCount}} Cards', {
            cardBlockCount: steps?.length ?? 0
          })}
          {...tabA11yProps('cards-preview-tab', 0)}
          sx={{ width: smUp ? 200 : undefined }}
        />
        <Tab
          disabled={videoBlocks?.length === 0 || videoBlocks == null}
          label={t('{{videoBlockCount}} Videos', {
            videoBlockCount: videoBlocks?.length ?? 0
          })}
          {...tabA11yProps('videos-preview-tab', 1)}
          sx={{ width: smUp ? 200 : undefined }}
        />
      </Tabs>
      <TabPanel name="cards-preview-tab" value={tabValue} index={0}>
        <TemplateCardPreview steps={steps} />
      </TabPanel>
      <TabPanel name="videos-preview-tab" value={tabValue} index={1}>
        {tabValue === 1 && videoBlocks?.length > 0 && (
          <TemplateVideoPreview videoBlocks={videoBlocks} />
        )}
      </TabPanel>
    </>
  )
}
