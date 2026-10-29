import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { textLength } from '@core/journeys/ui/Campaign/libs/translatedField'

import { CampaignVideoBlock } from '../../../libs/useCampaignVideoBlockCreateMutation'
import { CanvasMedia } from '../Canvas/CanvasMedia'
import { useTranslatedField } from '../utils/useTranslatedField'

interface CardTextFieldProps {
  block: CampaignVideoBlock
  field: 'title' | 'description'
  label: string
  multiline?: boolean
}

/** One of the card's overrides, committed on blur in the Preview Language. */
function CardTextField({
  block,
  field,
  label,
  multiline = false
}: CardTextFieldProps): ReactElement {
  const text = useTranslatedField({ block, field })
  const length = textLength(text.value)

  return (
    <TextField
      label={label}
      value={text.value}
      onChange={(event) => text.onChange(event.target.value)}
      onBlur={text.onBlur}
      placeholder={text.translating ? text.fallback : undefined}
      error={text.error != null || length > text.max}
      helperText={text.error ?? `${length} / ${text.max}`}
      slotProps={{
        formHelperText: text.error != null ? { role: 'alert' } : undefined
      }}
      size="small"
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      fullWidth
    />
  )
}

interface CarouselCardSettingsProps {
  block: CampaignVideoBlock
}

/**
 * The Settings of a carousel card: the video it shows and its title and
 * description overrides. Each field is written when it loses focus, as one
 * Command; an empty field falls back to the video's own text. While
 * previewing a non-default language each field is that language's
 * translation, written through `campaignTranslationSet` instead
 * (`useTranslatedField`).
 */
export function CarouselCardSettings({
  block
}: CarouselCardSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack
      spacing={4}
      data-testid="CampaignCarouselCardEdit"
      data-block-id={block.id}
    >
      <CanvasMedia media={block} />
      <CardTextField block={block} field="title" label={t('Title')} />
      <CardTextField
        block={block}
        field="description"
        label={t('Description')}
        multiline
      />
    </Stack>
  )
}
