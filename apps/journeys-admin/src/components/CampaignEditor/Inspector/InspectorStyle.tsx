import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { isCampaignStyledBlock } from '../../../libs/useCampaignSectionStyleMutation'
import { blockLabel } from '../blockLabel'
import { ButtonControls } from '../ButtonControls'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { StylePanel } from '../StylePanel'
import { TextControls } from '../TextControls'
import { ThemePanel } from '../ThemePanel'

import { ColumnsRatio } from './ColumnsRatio'

/**
 * The Inspector's Style tab, switched on the selection: the campaign Theme
 * when nothing is selected, Background and Colours for a section, chrome
 * block or column child (a Columns section adds its Ratio), the text controls for a text Extra and the button
 * controls for a button Extra. A column slot, carousel card, journey card or
 * region card is styled by its section and links to it.
 */
export function InspectorStyle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { selection, selectBlock } = useCampaignEditor()
  const { block, host } = selection

  switch (selection.kind) {
    case 'campaign':
      return <ThemePanel />
    case 'section':
    case 'chrome':
    case 'column':
      return host != null && isCampaignStyledBlock(host) ? (
        <Stack spacing={4}>
          {selection.kind === 'section' &&
            host.__typename === 'CampaignColumnsBlock' && (
              <ColumnsRatio block={host} />
            )}
          <StylePanel block={host} />
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('Nothing to style on this block.')}
        </Typography>
      )
    case 'text':
      return block?.__typename === 'CampaignTypographyBlock' ? (
        <TextControls block={block} />
      ) : (
        <></>
      )
    case 'button':
      return block?.__typename === 'CampaignButtonBlock' ? (
        <ButtonControls block={block} />
      ) : (
        <></>
      )
    case 'slot':
    case 'card':
    case 'journey':
    case 'region':
      return (
        <Stack spacing={1} data-testid="InspectorStyledBySection">
          <Typography variant="body2" color="text.secondary">
            {t('Styled by its section')}
          </Typography>
          {host != null && (
            <Link
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              onClick={() => selectBlock(host.id)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('Select {{section}}', {
                section: blockLabel(t, host.__typename)
              })}
            </Link>
          )}
        </Stack>
      )
  }
}
