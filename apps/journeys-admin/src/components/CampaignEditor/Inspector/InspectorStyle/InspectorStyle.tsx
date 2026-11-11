import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { isCampaignStyledBlock } from '../../../../libs/useCampaignBlockUpdateMutation'
import { ButtonControls } from '../../ButtonControls'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { StylePanel } from '../../StylePanel'
import { TextControls } from '../../TextControls'
import { blockLabel } from '../../utils/blockLabel'
import { ColumnsRatio } from '../ColumnsRatio'

/**
 * The Style tab of a section, chrome block or column child: Background and
 * Colours of the block hosting the selection; a Columns section adds its
 * Ratio.
 */
export function SectionStyle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { selection } = useCampaignEditor()
  const { host } = selection

  if (host == null || !isCampaignStyledBlock(host))
    return (
      <Typography variant="body2" color="text.secondary">
        {t('Nothing to style on this block.')}
      </Typography>
    )

  return (
    <Stack spacing={4}>
      {selection.kind === 'section' &&
        host.__typename === 'CampaignColumnsBlock' && (
          <ColumnsRatio block={host} />
        )}
      <StylePanel block={host} />
    </Stack>
  )
}

/** The Style tab of a text Extra: its text controls. */
export function TextStyle(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  if (block?.__typename !== 'CampaignTypographyBlock') return <></>
  return <TextControls block={block} />
}

/** The Style tab of a button Extra: its button controls. */
export function ButtonStyle(): ReactElement {
  const {
    selection: { block }
  } = useCampaignEditor()
  if (block?.__typename !== 'CampaignButtonBlock') return <></>
  return <ButtonControls block={block} />
}

/** The Style tab of a column slot, carousel card, journey card or region card: styled by its section, with a link that selects it. */
export function StyledBySection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    selection: { host },
    selectBlock
  } = useCampaignEditor()

  function handleSelectHost(): void {
    if (host != null) selectBlock(host.id)
  }

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
          onClick={handleSelectHost}
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
