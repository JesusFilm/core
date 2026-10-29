import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { textLength } from '@core/journeys/ui/Campaign/libs/translatedField'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { FocalPointControl } from '../FocalPointControl'
import { ImagePicker } from '../Pickers/ImagePicker'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'
import { useTranslatedField } from '../utils/useTranslatedField'

interface ImageSectionEditProps {
  block: CampaignImageBlock
}

/**
 * An Image section's Edit: the picture (upload or paste through the image
 * picker; Remove image clears it) and its alt text, which commits on blur.
 * Each change is one Command through `campaignImageBlockUpdate`; the server
 * measures a new picture. While previewing a non-default language the alt
 * text is that language's translation, one Command through
 * `campaignTranslationSet` instead (`useTranslatedField`).
 */
export function ImageSectionEdit({
  block
}: ImageSectionEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addFields, error } = useCampaignBlockFieldsCommand()
  const [replacing, setReplacing] = useState(false)
  const alt = useTranslatedField(
    { block, field: 'alt' },
    { tooLongMessage: altTooLongMessage }
  )

  function altTooLongMessage(max: number): string {
    return t('Alt text must be at most {{max}} characters', { max })
  }

  function write(input: { src?: string | null; alt?: string | null }): void {
    addFields(block, input)
  }

  function handlePick(src: string): void {
    setReplacing(false)
    write({ src })
  }

  // Over the cap shows as it is typed; the API's refusal once committed.
  const altError =
    alt.error ??
    (textLength(alt.value) > alt.max ? altTooLongMessage(alt.max) : undefined)

  return (
    <Stack
      spacing={4}
      data-testid="CampaignImageSectionEdit"
      data-block-id={block.id}
    >
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Picture')}</Typography>
        {block.src != null && (
          <Box
            component="img"
            src={block.src}
            alt={alt.value}
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
        {block.src != null && <FocalPointControl image={block} />}
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
        value={alt.value}
        onChange={(event) => alt.onChange(event.target.value)}
        onBlur={alt.onBlur}
        error={altError != null}
        placeholder={alt.translating ? alt.fallback : undefined}
        helperText={
          altError ?? (
            <>
              <Box component="span" sx={{ display: 'block' }}>
                {t(
                  'Read aloud by screen readers; shown when the picture fails.'
                )}
              </Box>
              <Box component="span" sx={{ display: 'block' }}>
                {`${textLength(alt.value)} / ${alt.max}`}
              </Box>
            </>
          )
        }
        size="small"
        multiline
        minRows={2}
        fullWidth
        slotProps={{
          htmlInput: { 'data-testid': 'CampaignImageAlt' },
          formHelperText: altError != null ? { role: 'alert' } : undefined
        }}
      />
    </Stack>
  )
}
