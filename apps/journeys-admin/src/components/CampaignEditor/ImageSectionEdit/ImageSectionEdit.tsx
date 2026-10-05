import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import { useCampaignImageBlockUpdateMutation } from '../../../libs/useCampaignImageBlockUpdateMutation'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ImagePicker } from '../Pickers/ImagePicker'
import {
  previousOf,
  useCampaignStyleCommand
} from '../utils/useCampaignStyleCommand'

/** PRD §15: alt text is at most 500 characters. */
export const IMAGE_ALT_MAX_LENGTH = 500

interface ImageSectionEditProps {
  block: CampaignImageBlock
  onClose?: () => void
}

/**
 * An Image section's Edit: the picture (upload or paste through the image
 * picker; Remove image clears it) and its default-language alt text, which
 * commits on blur. Each change is one Command through
 * `campaignImageBlockUpdate`; the server measures a new picture.
 */
export function ImageSectionEdit({
  block,
  onClose
}: ImageSectionEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addStyle, error } = useCampaignStyleCommand()
  const writeMedia = useCampaignImageBlockUpdateMutation()
  const [replacing, setReplacing] = useState(false)
  const [alt, setAlt] = useState(block.alt ?? '')

  useEffect(() => {
    setAlt(block.alt ?? '')
  }, [block.alt])

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

  function handleAltBlur(): void {
    const trimmed = alt.trim()
    if (trimmed === (block.alt ?? '') || trimmed.length > IMAGE_ALT_MAX_LENGTH)
      return
    write({ alt: trimmed === '' ? null : trimmed })
  }

  const altTooLong = alt.trim().length > IMAGE_ALT_MAX_LENGTH

  return (
    <Stack
      spacing={4}
      sx={{ p: 6, width: 360 }}
      data-testid="CampaignImageSectionEdit"
      data-block-id={block.id}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{t('Edit')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {blockLabel(t, block.__typename)}
          </Typography>
        </Box>
        {onClose != null && (
          <IconButton aria-label={t('Close')} onClick={onClose}>
            <X2Icon />
          </IconButton>
        )}
      </Stack>
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
            alt={block.alt ?? ''}
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
