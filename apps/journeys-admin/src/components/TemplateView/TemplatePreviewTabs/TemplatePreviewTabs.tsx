import 'swiper/swiper.min.css'
import 'swiper/components/scrollbar/scrollbar.min.css'

import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SwiperCore, { A11y, Mousewheel, Scrollbar } from 'swiper'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'

import { TemplateCardPreview } from './TemplateCardPreview/TemplateCardPreview'

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
          sx={{ width: smUp ? 200 : undefined, pointerEvents: 'none' }}
        />
      </Tabs>
      <TabPanel name="cards-preview-tab" value={tabValue} index={0}>
        <TemplateCardPreview steps={steps} />
      </TabPanel>
    </>
  )
}
