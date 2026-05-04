import { ApolloError } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { array, object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageCreateInput,
  TemplateGalleryPageUpdateInput
} from '../../../../__generated__/globalTypes'
import { useTemplateGalleryPageCreateMutation } from '../../../libs/useTemplateGalleryPageCreateMutation'
import { useTemplateGalleryPageUpdateMutation } from '../../../libs/useTemplateGalleryPageUpdateMutation'

export interface CollectionDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  teamId: string
  collection?: TemplateGalleryPage
  availableJourneys: readonly Journey[]
  onClose: () => void
}

interface FormValues {
  title: string
  description: string
  creatorName: string
  mediaUrl: string
  slug: string
  journeyIds: string[]
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function CollectionDialog({
  open,
  mode,
  teamId,
  collection,
  availableJourneys,
  onClose
}: CollectionDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [templateGalleryPageCreate] = useTemplateGalleryPageCreateMutation()
  const [templateGalleryPageUpdate] = useTemplateGalleryPageUpdateMutation()

  const initialValues: FormValues = {
    title: collection?.title ?? '',
    description: collection?.description ?? '',
    creatorName: collection?.creatorName ?? '',
    mediaUrl: collection?.mediaUrl ?? '',
    slug: collection?.slug ?? '',
    journeyIds: collection?.templates.map((tpl) => tpl.id) ?? []
  }

  const schema = object({
    title: string()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters')),
    description: string().max(500, t('Max 500 characters')),
    creatorName: string()
      .required(t('Creator name is required'))
      .max(100, t('Max 100 characters')),
    mediaUrl: string()
      .max(2048, t('URL too long'))
      .test('https-only', t('Must be an https URL'), (value) => {
        if (value == null || value === '') return true
        try {
          return new URL(value).protocol === 'https:'
        } catch {
          return false
        }
      }),
    slug: string()
      .max(200, t('Max 200 characters'))
      .matches(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        t('Use lowercase letters, numbers, and hyphens only')
      ),
    journeyIds: array().of(string().required())
  })

  async function handleSubmit(
    values: FormValues,
    helpers: FormikHelpers<FormValues>
  ): Promise<void> {
    try {
      if (mode === 'create') {
        const input: TemplateGalleryPageCreateInput = {
          teamId,
          title: values.title,
          creatorName: values.creatorName,
          description: values.description === '' ? null : values.description,
          mediaUrl: values.mediaUrl === '' ? null : values.mediaUrl,
          journeyIds: values.journeyIds
        }
        await templateGalleryPageCreate({ variables: { input } })
        enqueueSnackbar(t('Collection created'), {
          variant: 'success',
          preventDuplicate: true
        })
      } else if (collection != null) {
        const input: TemplateGalleryPageUpdateInput = {}
        if (values.title !== collection.title) input.title = values.title
        if (values.description !== (collection.description ?? '')) {
          input.description = values.description === '' ? null : values.description
        }
        if (values.creatorName !== collection.creatorName) {
          input.creatorName = values.creatorName
        }
        if (values.mediaUrl !== (collection.mediaUrl ?? '')) {
          input.mediaUrl = values.mediaUrl === '' ? null : values.mediaUrl
        }
        if (values.slug !== collection.slug) input.slug = values.slug
        const initialIds = collection.templates.map((tpl) => tpl.id)
        if (!sameIds(initialIds, values.journeyIds)) {
          input.journeyIds = values.journeyIds
        }
        await templateGalleryPageUpdate({
          variables: { id: collection.id, input }
        })
        enqueueSnackbar(t('Collection updated'), {
          variant: 'success',
          preventDuplicate: true
        })
      }
      onClose()
    } catch (error) {
      if (error instanceof ApolloError) {
        // Map field-scoped errors back to Formik fields when possible.
        const fieldError = error.graphQLErrors?.[0]?.extensions?.field as
          | string
          | undefined
        if (
          fieldError != null &&
          (fieldError === 'slug' ||
            fieldError === 'mediaUrl' ||
            fieldError === 'creatorImageSrc' ||
            fieldError === 'title')
        ) {
          helpers.setFieldError(fieldError, error.message)
          return
        }
      }
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched
      }) => (
        <Dialog
          open={open}
          onClose={onClose}
          dialogTitle={{
            title:
              mode === 'create'
                ? t('Create Collection')
                : t('Edit Collection'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: t('Cancel'),
            submitLabel: mode === 'create' ? t('Create') : t('Save')
          }}
          testId="CollectionDialog"
        >
          <Form>
            <Stack spacing={3}>
              <TextField
                id="title"
                name="title"
                label={t('Title')}
                fullWidth
                variant="filled"
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title === true && Boolean(errors.title)}
                helperText={touched.title === true && errors.title}
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                id="description"
                name="description"
                label={t('Description')}
                fullWidth
                multiline
                rows={3}
                variant="filled"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.description === true && Boolean(errors.description)
                }
                helperText={
                  touched.description === true && errors.description
                }
              />
              <TextField
                id="creatorName"
                name="creatorName"
                label={t('Creator name')}
                fullWidth
                variant="filled"
                value={values.creatorName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.creatorName === true && Boolean(errors.creatorName)
                }
                helperText={
                  touched.creatorName === true && errors.creatorName
                }
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                id="mediaUrl"
                name="mediaUrl"
                label={t('Media URL')}
                placeholder="https://"
                fullWidth
                variant="filled"
                value={values.mediaUrl}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.mediaUrl === true && Boolean(errors.mediaUrl)}
                helperText={
                  (touched.mediaUrl === true && errors.mediaUrl) ||
                  t('Must be an https URL')
                }
              />
              {mode === 'edit' && (
                <TextField
                  id="slug"
                  name="slug"
                  label={t('Slug')}
                  fullWidth
                  variant="filled"
                  value={values.slug}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.slug === true && Boolean(errors.slug)}
                  helperText={
                    (touched.slug === true && errors.slug) ||
                    t(
                      'Changing the slug breaks existing public links to this collection.'
                    )
                  }
                />
              )}
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={availableJourneys.slice()}
                getOptionLabel={(option) => option.title}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={availableJourneys.filter((j) =>
                  values.journeyIds.includes(j.id)
                )}
                onChange={(_event, selected) => {
                  void setFieldValue(
                    'journeyIds',
                    selected.map((j) => j.id)
                  )
                  void setFieldTouched('journeyIds', true, false)
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        label={option.title}
                        size="small"
                        {...tagProps}
                      />
                    )
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('Templates')}
                    placeholder={
                      values.journeyIds.length === 0
                        ? t('Select templates to include')
                        : undefined
                    }
                    variant="filled"
                    helperText={t(
                      'Templates included in this collection. Drag-and-drop in the gallery view also updates this list.'
                    )}
                  />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                {t(
                  'Creator image picker — coming soon. The creator image is optional.'
                )}
              </Typography>
            </Stack>
          </Form>
        </Dialog>
      )}
    </Formik>
  )
}
