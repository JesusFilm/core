import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { textLength } from '@core/journeys/ui/Campaign/libs/translatedField'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import { GetCampaignTranslations_campaignTranslations as TranslationRowData } from '../../../../../__generated__/GetCampaignTranslations'
import {
  CampaignTextField,
  CampaignTextSource
} from '../../../../../__generated__/globalTypes'
import { rowKey, targetId } from '../../../../libs/useCampaignTranslationsQuery'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { blockLabel } from '../../utils/blockLabel'
import { useCampaignTranslationWrite } from '../../utils/useCampaignTranslationWrite'
import { useCommittedField } from '../../utils/useCommittedField'
import { rowTranslations, targetInput } from '../translationRows'

interface TranslationRowProps {
  row: TranslationRowData
  languageId: string
  /** The language's bcp47 code, so the field reads in its own direction. */
  bcp47: string
  /** The editor's selection is where this text lives: the line is marked. */
  selected?: boolean
  /** Show the text's place on the canvas. */
  onReveal?: () => void
}

/** What a row is: the section or element the text sits in, then the field. */
export function useRowLabel(): (row: TranslationRowData) => string {
  const { t } = useTranslation('apps-journeys-admin')

  function fieldLabel(field: CampaignTextField): string {
    switch (field) {
      case CampaignTextField.eyebrow:
        return t('Eyebrow')
      case CampaignTextField.title:
        return t('Title')
      case CampaignTextField.bullets:
        return t('Bullets')
      case CampaignTextField.content:
        return t('Text')
      case CampaignTextField.intro:
        return t('Intro')
      case CampaignTextField.label:
        return t('Label')
      case CampaignTextField.alt:
        return t('Alt text')
      case CampaignTextField.description:
        return t('Description')
      case CampaignTextField.name:
        return t('Name')
      case CampaignTextField.value:
        return t('Wording')
    }
  }

  function targetLabel(typename: string): string {
    switch (typename) {
      case 'Campaign':
        return t('Campaign')
      case 'CampaignString':
        return t('Interface phrase')
      case 'CampaignRegion':
        return t('Region')
      default:
        return blockLabel(t, typename as Parameters<typeof blockLabel>[1])
    }
  }

  return (row) =>
    `${targetLabel(row.target.typename)} · ${fieldLabel(row.field)}`
}

/**
 * One line of the Translations view: what the text is, the default-language
 * wording it translates, and an editable field holding the translation.
 * Leaving the field writes a human translation through
 * `useCampaignTranslationWrite` (an emptied field clears it), shown at once
 * merged into the field's other languages, and updates this list and the
 * editor's own copy of the text so the row flips to Edited without a
 * refetch. Laid out as a small "where it is from" line with
 * the target button always at the right edge, the default-language text
 * large, the status on its own line, then the field. The target button
 * selects the text's place on the canvas, and the line is marked while that
 * place is selected.
 */
export function TranslationRow({
  row,
  languageId,
  bcp47,
  selected = false,
  onReveal
}: TranslationRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const rowLabel = useRowLabel()
  const { campaign } = useCampaignEditor()
  const writeTranslation = useCampaignTranslationWrite()
  const key = rowKey(row)
  const draft = useCommittedField({
    committed: row.value ?? '',
    save: async (value) =>
      await writeTranslation({
        campaignId: campaign.id,
        row: { __typename: row.target.typename, id: targetId(row.target) },
        target: targetInput(row.target),
        field: row.field,
        languageId,
        value,
        translations: rowTranslations(campaign, row)
      }),
    resetKey: languageId
  })

  const statusLabel = row.needsReview
    ? t('Needs review')
    : row.source === CampaignTextSource.machine
      ? t('Machine-translated')
      : row.source === CampaignTextSource.human
        ? t('Edited')
        : t('Missing')

  return (
    <Stack
      spacing={1}
      data-testid={`TranslationRow-${key}`}
      data-row-key={key}
      data-selected={selected ? 'true' : undefined}
      sx={{
        py: 2.5,
        px: 1,
        mx: -1,
        bgcolor: selected ? 'action.selected' : undefined
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: 0 }}
        >
          {rowLabel(row)}
        </Typography>
        {onReveal != null && (
          <IconButton
            size="small"
            aria-label={t('Show on the canvas')}
            onClick={onReveal}
            sx={{ ml: 'auto', flexShrink: 0 }}
          >
            <LinkExternalIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {row.defaultValue}
      </Typography>
      <Chip
        size="small"
        label={statusLabel}
        color={row.needsReview ? 'warning' : 'default'}
        variant={row.source == null ? 'outlined' : 'filled'}
        sx={{ alignSelf: 'flex-start' }}
      />
      <TextField
        size="small"
        fullWidth
        // Every field: the canvas takes a line break in any text, so a
        // translation can mirror it.
        multiline
        value={draft.value}
        onChange={(event) => draft.onChange(event.target.value)}
        onBlur={draft.onBlur}
        error={draft.error != null || textLength(draft.value) > row.maxLength}
        helperText={
          draft.error ?? `${textLength(draft.value)} / ${row.maxLength}`
        }
        slotProps={{
          htmlInput: {
            'aria-label': rowLabel(row),
            lang: bcp47,
            dir: getLocaleRTL(bcp47) ? 'rtl' : 'ltr'
          }
        }}
      />
    </Stack>
  )
}
