import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo } from 'react'

import {
  createCampaignTheme,
  transformCampaignBlocks
} from '@core/journeys/ui/Campaign'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { Hotkeys } from '../Hotkeys'

import { CanvasSection } from './CanvasSection'

export type CanvasView = 'desktop' | 'phone'

/** Phone view: the frame is 390 px wide so the campaign's breakpoints follow the canvas width. */
export const PHONE_FRAME_WIDTH = 390

interface CanvasProps {
  campaign: Campaign
  pageKind: CampaignPageKind
  view: CanvasView
}

/**
 * The campaign canvas: the chosen page rendered inside a FramePortal iframe
 * with the editor's own section components under the campaign's theme, in
 * the Preview Language the top bar chose (its text direction follows that
 * language's bcp47). Desktop/Phone is a view toggle held by the shell, never
 * a Command. The frame carries its own Hotkeys, since its key events never
 * leave it, and a click on the empty frame returns to the campaign row.
 */
export function Canvas({
  campaign,
  pageKind,
  view
}: CanvasProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    selectBlock,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
  const pageId = page?.id
  const sections = useMemo(
    () =>
      transformCampaignBlocks(
        campaign.blocks.filter((block) => block.pageId === pageId)
      ),
    [campaign.blocks, pageId]
  )
  const language = campaign.languages.find(
    (candidate) => candidate.languageId === previewLanguageId
  )
  const rtl = getLocaleRTL(language?.language.bcp47 ?? '')
  const theme = useMemo(
    () => createCampaignTheme(campaign.theme, rtl),
    [campaign.theme, rtl]
  )
  const fontFamilies = useMemo(
    () => ({
      headerFont: campaign.theme.headerFont ?? '',
      bodyFont: campaign.theme.bodyFont ?? '',
      labelFont: campaign.theme.labelFont ?? ''
    }),
    [campaign.theme]
  )

  return (
    <Box
      data-testid="CampaignCanvas"
      sx={{
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        px: 4,
        py: 3
      }}
    >
      <Box
        sx={{
          width: view === 'phone' ? PHONE_FRAME_WIDTH : '100%',
          maxWidth: '100%',
          height: '100%',
          bgcolor: 'background.paper',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 2
        }}
      >
        <FramePortal
          width={view === 'phone' ? PHONE_FRAME_WIDTH : '100%'}
          height="100%"
          dir={rtl ? 'rtl' : 'ltr'}
          fontFamilies={fontFamilies}
          title={t('Campaign preview')}
          data-testid="CampaignCanvasFrame"
        >
          {({ document }) => (
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Hotkeys document={document} />
              <Box
                data-testid="CampaignCanvasPage"
                onClick={() => selectBlock(undefined)}
                sx={{
                  height: '100%',
                  overflowY: 'auto',
                  bgcolor: 'background.default',
                  color: 'text.primary'
                }}
              >
                {sections.map((section) => (
                  <CanvasSection
                    key={section.id}
                    block={section}
                    theme={campaign.theme}
                  />
                ))}
              </Box>
            </ThemeProvider>
          )}
        </FramePortal>
      </Box>
    </Box>
  )
}
