import { CombinedGraphQLErrors } from '@apollo/client'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import { getLocaleRTL } from '@core/shared/ui/rtl'

import {
  CampaignTranslations,
  CampaignTranslationsVariables,
  CampaignTranslations_campaignTranslations as TranslationRow
} from '../../../../__generated__/CampaignTranslations'
import {
  CampaignTextField,
  CampaignTextSource
} from '../../../../__generated__/globalTypes'
import { useCampaignTranslationSetMutation } from '../../../libs/useCampaignTranslationSetMutation'
import { CAMPAIGN_TRANSLATIONS } from '../../../libs/useCampaignTranslationsQuery'
import { blockLabel } from '../blockLabel'

import {
  rowKey,
  targetId,
  targetInput,
  withWrittenTranslation
} from './translationRows'

const MULTILINE_FIELDS: CampaignTextField[] = [
  CampaignTextField.description,
  CampaignTextField.bullets,
  CampaignTextField.content,
  CampaignTextField.intro,
  CampaignTextField.description
]

interface TranslationRowProps {
  row: TranslationRow
  languageId: string
  /** The language's bcp47 code, so the field reads in its own direction. */
  bcp47: string
  /** The variables of the query that lists the rows, so a write can update it in place. */
  queryVariables: CampaignTranslationsVariables
  /** The editor's selection is where this text lives: the line is marked. */
  selected?: boolean
  /** Show the text's place on the canvas. */
  onReveal?: () => void
}

function messageOf(error: unknown): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : String(error)
}

/** What a row is: the section or element the text sits in, then the field. */
export function useRowLabel(): (row: TranslationRow) => string {
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
      case 'CampaignFeaturedMediaBlock':
        return t('Featured media')
      case 'CampaignRichTextBlock':
        return t('Rich text')
      case 'CampaignImageBlock':
        return t('Image')
      case 'CampaignVideoBlock':
        return t('Video')
      case 'CampaignJourneyBlock':
        return t('Journey')
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
 * `campaignTranslationSet` (an emptied field clears it), shown at once, and
 * updates this list and the editor's own copy of the text so the row flips to
 * Edited without a refetch. Laid out as a small "where it is from" line with
 * the target button always at the right edge, the default-language text
 * large, the status on its own line, then the field. The target button
 * selects the text's place on the canvas, and the line is marked while that
 * place is selected.
 */
export function TranslationRowItem({
  row,
  languageId,
  bcp47,
  queryVariables,
  selected = false,
  onReveal
}: TranslationRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const rowLabel = useRowLabel()
  const [translationSet] = useCampaignTranslationSetMutation()
  const [draft, setDraft] = useState(row.value ?? '')
  const [error, setError] = useState<string>()
  const key = rowKey(row)

  useEffect(() => {
    setDraft(row.value ?? '')
  }, [row.value, languageId])

  async function handleBlur(): Promise<void> {
    const value = draft.trim()
    if (value === (row.value ?? '')) {
      setDraft(row.value ?? '')
      return
    }
    setError(undefined)
    const column = `${row.field}Translations`
    const optimistic =
      value === ''
        ? []
        : [
            {
              __typename: 'TranslatedValue' as const,
              languageId,
              value,
              source: CampaignTextSource.human
            }
          ]
    try {
      await translationSet({
        variables: {
          input: {
            target: targetInput(row.target),
            field: row.field,
            languageId,
            value
          }
        },
        optimisticResponse: { campaignTranslationSet: optimistic },
        update(cache, { data }) {
          if (data == null) return
          cache.modify({
            id: cache.identify({
              __typename: row.target.typename,
              id: targetId(row.target)
            }),
            fields: { [column]: () => data.campaignTranslationSet }
          })
          cache.updateQuery<
            CampaignTranslations,
            CampaignTranslationsVariables
          >(
            { query: CAMPAIGN_TRANSLATIONS, variables: queryVariables },
            (current) =>
              current == null
                ? undefined
                : {
                    ...current,
                    campaignTranslations: withWrittenTranslation(
                      current.campaignTranslations,
                      row,
                      languageId,
                      data.campaignTranslationSet
                    )
                  }
          )
        }
      })
    } catch (writeError) {
      setError(messageOf(writeError))
      setDraft(row.value ?? '')
    }
  }

  const statusLabel =
    row.source === CampaignTextSource.machine
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
        py: 2,
        px: 1,
        mx: -1,
        borderRadius: 1,
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
        color={
          row.source === CampaignTextSource.machine ? 'warning' : 'default'
        }
        variant={row.source == null ? 'outlined' : 'filled'}
        sx={{ alignSelf: 'flex-start' }}
      />
      <TextField
        size="small"
        fullWidth
        multiline={MULTILINE_FIELDS.includes(row.field)}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleBlur}
        error={error != null || draft.length > row.maxLength}
        helperText={error ?? `${draft.length} / ${row.maxLength}`}
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
