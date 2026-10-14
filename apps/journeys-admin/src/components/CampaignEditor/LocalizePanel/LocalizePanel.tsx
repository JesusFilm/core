import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { useCampaignEditor } from '../CampaignEditorProvider'
import { LanguagesPanel } from '../LanguagesPanel'
import { TranslationsView } from '../TranslationsView'

/** The Localize panel's tabs. */
export type LocalizeTab = 'languages' | 'translations'

interface LocalizePanelProps {
  tab: LocalizeTab
  onTabChange: (tab: LocalizeTab) => void
  /** Shown once on Translations after the default language changed. */
  promotionNotice: boolean
  onPromotionNoticeClose: () => void
}

/**
 * The Localize panel: a Languages tab (the campaign's languages with Remove,
 * and the autocomplete to add one) and a Translations tab (review and edit
 * translated text). Adding and removing languages go straight to the API and
 * writing a translation is its own save; none of it is a Command.
 */
export function LocalizePanel({
  tab,
  onTabChange,
  promotionNotice,
  onPromotionNoticeClose
}: LocalizePanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    state: { previewLanguageId }
  } = useCampaignEditor()

  return (
    <Stack
      data-testid="CampaignLocalizePanel"
      sx={{ flexGrow: 1, minHeight: 0 }}
    >
      <Tabs
        value={tab}
        onChange={(_event, next: LocalizeTab) => onTabChange(next)}
        variant="fullWidth"
        aria-label={t('Localize')}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="languages"
          label={t('Languages')}
          id="localize-tab-languages"
          aria-controls="localize-panel"
        />
        <Tab
          value="translations"
          label={t('Translations')}
          id="localize-tab-translations"
          aria-controls="localize-panel"
        />
      </Tabs>
      <Box
        role="tabpanel"
        id="localize-panel"
        aria-labelledby={`localize-tab-${tab}`}
        sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', p: 4 }}
      >
        {tab === 'languages' ? (
          <LanguagesPanel campaign={campaign} />
        ) : (
          <TranslationsView
            campaign={campaign}
            initialLanguageId={previewLanguageId}
            showPromotionNotice={promotionNotice}
            onPromotionNoticeClose={onPromotionNoticeClose}
          />
        )}
      </Box>
    </Stack>
  )
}
