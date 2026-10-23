import { MockedProvider } from '@apollo/client/testing/react'
import Paper from '@mui/material/Paper'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement, useState } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CampaignEditorProvider } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { LEFT_PANEL_WIDTH } from '../LeftPanel'
import { TranslationRunContext } from '../TranslationRunProvider'
import type { TranslationRun } from '../TranslationRunProvider'

import { LocalizePanel } from '.'
import type { LocalizeTab } from '.'

interface LocalizePanelStoryProps {
  initialTab?: LocalizeTab
  initialPromotionNotice?: boolean
  /** A machine-translation run in flight, as the background run reports it. */
  run?: TranslationRun
}

/** The Localize panel in its 300 px column. */
function LocalizePanelStory({
  initialTab = 'languages',
  initialPromotionNotice = false,
  run
}: LocalizePanelStoryProps): ReactElement {
  const [tab, setTab] = useState<LocalizeTab>(initialTab)
  const [promotionNotice, setPromotionNotice] = useState(initialPromotionNotice)
  return (
    <MockedProvider>
      <CommandProvider>
        <CampaignEditorProvider campaign={campaign}>
          <TranslationRunContext.Provider
            value={{
              run,
              start: () => undefined,
              cancel: () => undefined
            }}
          >
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
          </TranslationRunContext.Provider>
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

const runningTranslation: TranslationRun = {
  campaignId: campaign.id,
  languageId: '496',
  mode: 'missing',
  languageName: 'Français',
  progress: 45,
  message: 'Translated 2 of 5 parts',
  translatedCount: 7
}

/** A machine-translation run in flight on the Translations tab: the progress bar and Cancel. */
export const TranslationsRunning: Story = {
  args: { initialTab: 'translations', run: runningTranslation }
}

/** The same run seen from the Languages tab. */
export const LanguagesRunning: Story = {
  args: { run: runningTranslation }
}

export default LocalizePanelMeta
