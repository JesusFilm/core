import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik } from 'formik'
import { useTranslations } from 'next-intl'
import React from 'react'
import { boolean, object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

interface CreateVariantDialogProps {
  open?: boolean
  handleClose?: () => void
}

export function CreateVariantDialog({
  open = false,
  handleClose
}: CreateVariantDialogProps) {
  const t = useTranslations()

  const validationSchema = object().shape({
    videoId: string().required(t('Video Id is required')),
    edition: string().required(t('Edition is required')),
    languageId: string().required(t('Language Id is required')),
    slug: string().required(t('Slug is required')),
    downloadable: boolean().required(t('Downloadable is required'))
  })

  function handleCreateVaraint() {
    console.log('created variant')
  }

  // const initialValues: VideoVariantCreateInput = {}

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{ title: t('Create Variant') }}
      dialogAction={{
        onSubmit: () => alert('Variant created'),
        submitLabel: t('Create'),
        closeLabel: t('Cancel')
      }}
    >
      <Formik
        initialValues={{
          edition: '',
          videoId: '',
          hls: null,
          dash: '',
          share: '',
          duration: null,
          languageId: '',
          slug: '',
          downloadable: false
        }}
        onSubmit={() => {
          handleCreateVaraint()
          handleClose?.()
        }}
        validationSchema={validationSchema}
        enableReinitialize
      >
        {({ handleChange, values, errors }) => (
          <Form>
            <Stack spacing={2}>
              <TextField
                id="videoId"
                name="videoId"
                label={t('Video Id')}
                variant="outlined"
                fullWidth
                value={values.videoId}
                onChange={handleChange}
                error={Boolean(errors.videoId)}
                helperText={errors.videoId as string}
                disabled
              />
              <TextField
                id="edition"
                name="edition"
                label={t('Edition')}
                variant="outlined"
                fullWidth
                value={values.edition}
                onChange={handleChange}
                error={Boolean(errors.edition)}
                helperText={errors.edition as string}
              />
              <TextField
                id="hls"
                name="hls"
                label={t('HLS')}
                variant="outlined"
                fullWidth
                value={values.hls}
                onChange={handleChange}
                error={Boolean(errors.hls)}
                helperText={errors.hls as string}
              />
              <TextField
                id="dash"
                name="dash"
                label={t('Dash')}
                variant="outlined"
                fullWidth
                value={values.dash}
                onChange={handleChange}
                error={Boolean(errors.dash)}
                helperText={errors.dash as string}
              />
              <TextField
                id="share"
                name="share"
                label={t('Share')}
                variant="outlined"
                fullWidth
                value={values.share}
                onChange={handleChange}
                error={Boolean(errors.share)}
                helperText={errors.share as string}
              />
              <TextField
                id="duration"
                name="duration"
                label={t('Duration')}
                // type="number"
                variant="outlined"
                fullWidth
                value={values.duration}
                onChange={handleChange}
                error={Boolean(errors.duration)}
                helperText={errors.duration as string}
              />
              <TextField
                id="languageId"
                name="languageId"
                label={t('Language Id')}
                variant="outlined"
                fullWidth
                value={values.languageId}
                onChange={handleChange}
                error={Boolean(errors.languageId)}
                helperText={errors.languageId as string}
              />
              <TextField
                id="slug"
                name="slug"
                label={t('Slug')}
                variant="outlined"
                fullWidth
                value={values.slug}
                onChange={handleChange}
                error={Boolean(errors.slug)}
                helperText={errors.slug as string}
              />
              <FormControl error={Boolean(errors.downloadable)}>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="downloadable"
                      name="downloadable"
                      checked={values.downloadable}
                      onChange={handleChange}
                    />
                  }
                  label={t('Downloadable')}
                />
                <FormHelperText>{errors.downloadable}</FormHelperText>
              </FormControl>
            </Stack>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}
