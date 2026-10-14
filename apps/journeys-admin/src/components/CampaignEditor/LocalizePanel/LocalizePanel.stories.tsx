import { MockedProvider } from '@apollo/client/testing/react'
import Paper from '@mui/material/Paper'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement, useState } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CampaignEditorProvider } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { LEFT_PANEL_WIDTH } from '../LeftPanel'

import { LocalizePanel } from '.'
import type { LocalizeTab } from '.'

interface LocalizePanelStoryProps {
  initialTab?: LocalizeTab
  initialPromotionNotice?: boolean
}

/** The Localize panel in its 300 px column. */
function LocalizePanelStory({
  initialTab = 'languages',
  initialPromotionNotice = false
}: LocalizePanelStoryProps): ReactElement {
  const [tab, setTab] = useState<LocalizeTab>(initialTab)
  const [promotionNotice, setPromotionNotice] = useState(initialPromotionNotice)
  return (
    <MockedProvider>
      <CommandProvider>
        <CampaignEditorProvider campaign={campaign}>
          <Paper
            square
            sx={{
              width: LEFT_PANEL_WIDTH,
              height: 560,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <LocalizePanel
              tab={tab}
              onTabChange={setTab}
              promotionNotice={promotionNotice}
              onPromotionNoticeClose={() => setPromotionNotice(false)}
            />
          </Paper>
        </CampaignEditorProvider>
      </CommandProvider>
    </MockedProvider>
  )
}

const LocalizePanelMeta: Meta<typeof LocalizePanelStory> = {
  ...journeysAdminConfig,
  component: LocalizePanelStory,
  title: 'Journeys-Admin/CampaignEditor/LocalizePanel',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof LocalizePanelStory>

/** The Languages tab: the campaign's languages and the autocomplete to add one. */
export const Languages: Story = {}

/** The Translations tab. */
export const Translations: Story = { args: { initialTab: 'translations' } }

/** Translations with the default-language promotion notice, as after a swap. */
export const TranslationsWithPromotionNotice: Story = {
  args: { initialTab: 'translations', initialPromotionNotice: true }
}

export default LocalizePanelMeta
