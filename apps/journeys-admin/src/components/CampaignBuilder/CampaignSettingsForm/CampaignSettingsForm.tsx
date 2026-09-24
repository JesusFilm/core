import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, FocusEvent, ReactElement, useState } from 'react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { CreatorImagePickerDrawer } from '../../TemplateGalleryPageList/CollectionDialog/CreatorImagePickerDrawer'
import {
  MEDIA_BOX_HEIGHT,
  MEDIA_BOX_WIDTH
} from '../../TemplateGalleryPageList/CollectionDialog/MediaPreview'
import { MediaSection } from '../../TemplateGalleryPageList/CollectionDialog/MediaSection'
import { CampaignFormValues } from '../useCampaignForm'

// Matches the Collections dialog's "Editor / Subtitle/2" section header token.
export const SECTION_HEADER = {
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: '24px',
  color: '#444451'
} as const

interface CampaignSettingsFormProps {
  uploadKey: string
  uploadInFlight: boolean
}

function slugifyInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
}

/** Hero copy, slug, background image and hero media fields. */
export function CampaignSettingsForm({
  uploadKey,
  uploadInFlight
}: CampaignSettingsFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    isSubmitting
  } = useFormikContext<CampaignFormValues>()
  const [imagePickerOpen, setImagePickerOpen] = useState(false)

  function textField(
    name: keyof Pick<
      CampaignFormValues,
      'title' | 'eyebrow' | 'tagline' | 'description' | 'backgroundImageAlt'
    >,
    label: string,
    options: {
      required?: boolean
      multiline?: boolean
      helper?: string
      maxLength?: number
    } = {}
  ): ReactElement {
    const error = touched[name] === true && Boolean(errors[name])
    return (
      <Stack spacing={1}>
        <Typography sx={SECTION_HEADER}>
          {label}
          {options.required === true && (
            <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
              *
            </Box>
          )}
        </Typography>
        <TextField
          id={name}
          name={name}
          placeholder={t('Type here')}
          fullWidth
          variant="filled"
          hiddenLabel
          multiline={options.multiline}
          rows={options.multiline === true ? 4 : undefined}
          value={values[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isSubmitting}
          error={error}
          helperText={(error && errors[name]) || options.helper}
          slotProps={{
            htmlInput: { 'aria-label': label, maxLength: options.maxLength }
          }}
        />
      </Stack>
    )
  }

  async function handleSlugChange(
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    await setFieldValue('slug', slugifyInput(event.target.value))
  }
  async function handleSlugBlur(
    event: FocusEvent<HTMLInputElement>
  ): Promise<void> {
    const trimmed = values.slug.replace(/-+$/, '')
    if (trimmed !== values.slug) await setFieldValue('slug', trimmed)
    handleBlur(event)
  }

  return (
    <Stack spacing={4} data-testid="CampaignSettingsForm">
      {textField('title', t('Title'), { required: true, maxLength: 100 })}
      {textField('eyebrow', t('Eyebrow'), {
        maxLength: 80,
        helper: t(
          'Short kicker above the title, e.g. "World Cup 2026 · Outreach".'
        )
      })}
      {textField('tagline', t('Tagline'), {
        maxLength: 160,
        helper: t('One line shown between the eyebrow and the title.')
      })}
      {textField('description', t('Description'), { multiline: true })}

      <Stack spacing={1}>
        <Typography sx={SECTION_HEADER}>{t('Public link')}</Typography>
        <TextField
          id="slug"
          name="slug"
          fullWidth
          variant="filled"
          hiddenLabel
          value={values.slug}
          onChange={handleSlugChange}
          onBlur={handleSlugBlur}
          disabled={isSubmitting}
          error={touched.slug === true && Boolean(errors.slug)}
          helperText={
            (touched.slug === true && errors.slug) ||
            t(
              'Used in the public URL. Must be unique across all campaigns — changing it breaks existing links.'
            )
          }
          slotProps={{ htmlInput: { 'aria-label': t('Slug') } }}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography sx={SECTION_HEADER}>{t('Background image')}</Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <ButtonBase
            onClick={() => setImagePickerOpen(true)}
            aria-label={t('Choose background image')}
            disabled={isSubmitting}
            sx={{
              bgcolor: '#efefef',
              borderRadius: 2,
              p: 2,
              width: MEDIA_BOX_WIDTH,
              height: MEDIA_BOX_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0
            }}
          >
            {values.backgroundImageSrc !== '' ? (
              <Box
                component="img"
                src={values.backgroundImageSrc}
                alt={values.backgroundImageAlt}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  borderRadius: 1,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: '100%',
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.08)'
                }}
              />
            )}
            <Edit2Icon
              sx={{ fontSize: 24, color: 'primary.main', flexShrink: 0 }}
            />
          </ButtonBase>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('Shown behind the hero. Wide, dark images work best.')}
            </Typography>
            {touched.backgroundImageSrc === true &&
              errors.backgroundImageSrc != null && (
                <Typography variant="caption" sx={{ color: 'error.main' }}>
                  {errors.backgroundImageSrc}
                </Typography>
              )}
            <Button
              variant="text"
              size="small"
              color="error"
              disabled={values.backgroundImageSrc === '' || isSubmitting}
              onClick={() => {
                void setFieldValue('backgroundImageSrc', '')
                void setFieldValue('backgroundImageAlt', '')
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('Remove image')}
            </Button>
          </Stack>
        </Stack>
        <CreatorImagePickerDrawer
          open={imagePickerOpen}
          src={values.backgroundImageSrc}
          alt={values.backgroundImageAlt}
          onClose={() => setImagePickerOpen(false)}
          onChange={async (src, alt) => {
            await setFieldValue('backgroundImageSrc', src)
            await setFieldValue('backgroundImageAlt', alt)
          }}
        />
      </Stack>

      <MediaSection
        media={values.media}
        uploadKey={uploadKey}
        disableModeSwitch={uploadInFlight}
        saving={isSubmitting}
        error={
          Boolean(touched.media) && typeof errors.media === 'string'
            ? errors.media
            : undefined
        }
        onChange={(media) => {
          void setFieldValue('media', media)
        }}
        headerSx={SECTION_HEADER}
      />
    </Stack>
  )
}
