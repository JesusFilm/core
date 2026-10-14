import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import { CampaignTextField } from '../../../../__generated__/globalTypes'
import { translationValue } from '../../../libs/useCampaignBlockTextMutation'
import { useCampaignImageBlockUpdateMutation } from '../../../libs/useCampaignImageBlockUpdateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ImagePicker } from '../Pickers/ImagePicker'
import { messageOf } from '../utils/messageOf'
import {
  previousOf,
  useCampaignStyleCommand
} from '../utils/useCampaignStyleCommand'
import { useCampaignTranslationWrite } from '../utils/useCampaignTranslationWrite'

/** PRD §15: alt text is at most 500 characters. */
export const IMAGE_ALT_MAX_LENGTH = 500

interface ImageSectionEditProps {
  block: CampaignImageBlock
}

/**
 * An Image section's Edit: the picture (upload or paste through the image
 * picker; Remove image clears it) and its alt text, which commits on blur.
 * Each change is one Command through `campaignImageBlockUpdate`; the server
 * measures a new picture. While previewing a non-default language the alt
 * text is that language's translation and writes through
 * `campaignTranslationSet` instead.
 */
export function ImageSectionEdit({
  block
}: ImageSectionEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const { addStyle, error } = useCampaignStyleCommand()
  const writeMedia = useCampaignImageBlockUpdateMutation()
  const writeTranslation = useCampaignTranslationWrite()
  const [replacing, setReplacing] = useState(false)
  const [translationError, setTranslationError] = useState<string>()
  const translating = previewLanguageId !== campaign.defaultLanguageId
  const committedAlt = translating
    ? translationValue(block.altTranslations, previewLanguageId)
    : (block.alt ?? '')
  const [alt, setAlt] = useState(committedAlt)

  useEffect(() => {
    setAlt(committedAlt)
    setTranslationError(undefined)
  }, [committedAlt, previewLanguageId])

  function write(input: { src?: string | null; alt?: string | null }): void {
    addStyle({
      block,
      input,
      previous: previousOf(block, input),
      run: writeMedia
    })
  }

  function handlePick(src: string): void {
    setReplacing(false)
    write({ src })
  }

  async function writeAltTranslation(value: string): Promise<void> {
    setTranslationError(undefined)
    try {
      await writeTranslation({
        row: block,
        target: { blockId: block.id },
        field: CampaignTextField.alt,
        languageId: previewLanguageId,
        value,
        translations: block.altTranslations
      })
    } catch (writeError) {
      setTranslationError(messageOf(writeError))
      setAlt(committedAlt)
    }
  }

  function handleAltBlur(): void {
    const trimmed = alt.trim()
    if (trimmed === committedAlt || trimmed.length > IMAGE_ALT_MAX_LENGTH)
      return
    if (translating) {
      void writeAltTranslation(trimmed)
      return
    }
    write({ alt: trimmed === '' ? null : trimmed })
  }

  const altTooLong = alt.trim().length > IMAGE_ALT_MAX_LENGTH

  return (
    <Stack
      spacing={4}
      data-testid="CampaignImageSectionEdit"
      data-block-id={block.id}
    >
      {(error ?? translationError) != null && (
        <Alert severity="error" role="alert">
          {error ?? translationError}
        </Alert>
      )}
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Picture')}</Typography>
        {block.src != null && (
          <Box
            component="img"
            src={block.src}
            alt={committedAlt}
            data-testid="CampaignImageSectionEditPicture"
            sx={{
              width: '100%',
              maxHeight: 160,
              objectFit: 'contain',
              borderRadius: 1,
              bgcolor: 'action.hover'
            }}
          />
        )}
        {block.src != null && (
          <Stack direction="row" spacing={2}>
            {!replacing && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReplacing(true)}
              >
                {t('Replace image')}
              </Button>
            )}
            <Button
              variant="text"
              size="small"
              onClick={() => write({ src: null })}
            >
              {t('Remove image')}
            </Button>
          </Stack>
        )}
        {(block.src == null || replacing) && (
          <ImagePicker
            teamId={campaign.teamId}
            onPick={handlePick}
            testId="CampaignSectionImagePicker"
          />
        )}
      </Stack>
      <TextField
        label={t('Alt text')}
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
        onBlur={handleAltBlur}
        error={altTooLong}
        placeholder={translating ? (block.alt ?? '') : undefined}
        helperText={
          altTooLong
            ? t('Alt text must be at most 500 characters')
            : t('Read aloud by screen readers; shown when the picture fails.')
        }
        size="small"
        multiline
        minRows={2}
        fullWidth
        slotProps={{ htmlInput: { 'data-testid': 'CampaignImageAlt' } }}
      />
    </Stack>
  )
}
