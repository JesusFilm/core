import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { CampaignTextField } from '../../../../__generated__/globalTypes'
import { translationValue } from '../../../libs/useCampaignBlockTextMutation'
import { CampaignVideoBlock } from '../../../libs/useCampaignVideoBlockCreateMutation'
import {
  CampaignVideoTextInput,
  useCampaignVideoBlockUpdateMutation
} from '../../../libs/useCampaignVideoBlockUpdateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CanvasMedia } from '../Canvas/CanvasMedia'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'
import { useCampaignTranslationCommand } from '../utils/useCampaignTranslationCommand'

/** The API's caps on a Campaign Video's overrides (PRD §15). */
const TITLE_MAX = 200
const DESCRIPTION_MAX = 1000

type VideoTextField = keyof CampaignVideoTextInput

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
  const { addStyle, error } = useCampaignStyleCommand()
  const writeText = useCampaignVideoBlockUpdateMutation()
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
    addStyle<CampaignVideoBlock, CampaignVideoTextInput>({
      block,
      input: { [field]: next },
      previous: { [field]: block[field] },
      run: writeText
    })
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
        helperText={`${values.title.length} / ${TITLE_MAX}`}
        slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
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
        helperText={`${values.description.length} / ${DESCRIPTION_MAX}`}
        slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX } }}
        size="small"
        multiline
        minRows={3}
        fullWidth
      />
    </Stack>
  )
}
