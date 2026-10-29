import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import {
  TRANSLATED_FIELDS,
  textLength
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { CampaignTextField } from '../../../../__generated__/globalTypes'
import { translationValue } from '../../../libs/useCampaignBlockTextMutation'
import { CampaignVideoBlock } from '../../../libs/useCampaignVideoBlockCreateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CanvasMedia } from '../Canvas/CanvasMedia'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'
import { useCampaignTranslationCommand } from '../utils/useCampaignTranslationCommand'

const CAPS = TRANSLATED_FIELDS.block.CampaignVideoBlock

type VideoTextField = 'title' | 'description'

interface CarouselCardEditProps {
  block: CampaignVideoBlock
}

/**
 * The Edit of a carousel card: the video it shows and its title and
 * description overrides. Each field is written when it loses focus, as one
 * Command; an empty field falls back to the video's own text. While
 * previewing a non-default language each field is that language's
 * translation, written through `campaignTranslationSet` instead.
 */
export function CarouselCardEdit({
  block
}: CarouselCardEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addFields, error } = useCampaignBlockFieldsCommand()
  const {
    campaign,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const {
    addTranslation,
    error: translationError,
    clearError: clearTranslationError
  } = useCampaignTranslationCommand()
  const translating = previewLanguageId !== campaign.defaultLanguageId
  const committed = translating
    ? {
        title: translationValue(block.titleTranslations, previewLanguageId),
        description: translationValue(
          block.descriptionTranslations,
          previewLanguageId
        )
      }
    : { title: block.title ?? '', description: block.description ?? '' }
  const [values, setValues] = useState(committed)

  const { title: committedTitle, description: committedDescription } = committed

  useEffect(() => {
    setValues({ title: committedTitle, description: committedDescription })
  }, [committedTitle, committedDescription, previewLanguageId])

  useEffect(() => {
    clearTranslationError()
  }, [previewLanguageId, clearTranslationError])

  function handleBlur(field: VideoTextField): void {
    const value = values[field].trim()
    if (textLength(value) > CAPS[field]) return
    if (translating) {
      if (value === committed[field]) return
      addTranslation({
        block,
        field: CampaignTextField[field],
        languageId: previewLanguageId,
        value,
        previous: committed[field]
      })
      return
    }
    const next = value === '' ? null : value
    if (next === (block[field] ?? null)) return
    addFields(block, { [field]: next })
  }

  return (
    <Stack
      spacing={4}
      data-testid="CampaignCarouselCardEdit"
      data-block-id={block.id}
    >
      {(error ?? translationError) != null && (
        <Alert severity="error" role="alert">
          {error ?? translationError}
        </Alert>
      )}
      <CanvasMedia media={block} />
      <TextField
        label={t('Title')}
        value={values.title}
        onChange={(event) =>
          setValues((current) => ({ ...current, title: event.target.value }))
        }
        onBlur={() => handleBlur('title')}
        placeholder={translating ? (block.title ?? '') : undefined}
        error={textLength(values.title) > CAPS.title}
        helperText={`${textLength(values.title)} / ${CAPS.title}`}
        size="small"
        fullWidth
      />
      <TextField
        label={t('Description')}
        value={values.description}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            description: event.target.value
          }))
        }
        onBlur={() => handleBlur('description')}
        placeholder={translating ? (block.description ?? '') : undefined}
        error={textLength(values.description) > CAPS.description}
        helperText={`${textLength(values.description)} / ${CAPS.description}`}
        size="small"
        multiline
        minRows={3}
        fullWidth
      />
    </Stack>
  )
}
