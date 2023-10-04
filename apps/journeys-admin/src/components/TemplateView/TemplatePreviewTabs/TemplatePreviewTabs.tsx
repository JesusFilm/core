import 'swiper/swiper.min.css'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Swiper, SwiperSlide } from 'swiper/react'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { NextImage } from '@core/shared/ui/NextImage'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { CardPreview } from '../../CardPreview'

export function TemplatePreviewTabs(): ReactElement {
  const [tabValue, setTabValue] = useState(0)
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey } = useJourney()

  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined

  const videoBlocks = journey?.blocks?.filter(
    (block) => block.__typename === 'VideoBlock'
  ) as Array<TreeBlock<VideoBlock>>

  const handleTabChange = (_event, newValue): void => {
    setTabValue(newValue)
  }

  return (
    <Stack>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
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
        <Stack sx={{ pt: 6 }}>
          Card Preview - yet to be implemented, this is just a placeholder, for
          more information contact support@nextstep.is
          <CardPreview steps={steps} />
        </Stack>
      </TabPanel>
      <TabPanel name="videos-preview-tab" value={tabValue} index={1}>
        <Swiper
          grabCursor
          freeMode
          slidesPerView="auto"
          spaceBetween={24}
          slidesOffsetAfter={64}
          style={{
            paddingTop: '20px',
            // width: '130%',
            marginLeft: smUp ? '-32px' : '-24px',
            marginRight: smUp ? '-32px' : '-24px'
          }}
        >
          {videoBlocks?.map((block) => (
            <SwiperSlide key={block.id} style={{ width: 423 }}>
              <NextImage
                width={423}
                height={239}
                key={block.id}
                sx={{ borderRadius: 4, objectFit: 'cover' }}
                src={(block.image as string) ?? block.video?.image}
              />
            </SwiperSlide>
          ))}
          <Box slot="wrapper-start" sx={{ pl: 8 }} />
          <Box slot="wrapper-end" sx={{ pr: 8 }} />
        </Swiper>
      </TabPanel>
    </Stack>
  )
}
