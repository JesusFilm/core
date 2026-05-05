import { ApolloError } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { array, object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../__generated__/BlockFields'
import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import {
  ImageBlockUpdateInput,
  TemplateGalleryPageCreateInput,
  TemplateGalleryPageStatus,
  TemplateGalleryPageUpdateInput
} from '../../../../__generated__/globalTypes'
import { ImageBlockEditor } from '../../Editor/Slider/Settings/Drawer/ImageBlockEditor'
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
  creatorImageSrc: string
  creatorImageAlt: string
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

  // Published collections allow metadata edits but lock the membership list —
  // matches the DnD published-guard. Unpublish first to add or remove
  // templates.
  const isPublished =
    collection?.status === TemplateGalleryPageStatus.published

  const initialValues: FormValues = {
    title: collection?.title ?? '',
    description: collection?.description ?? '',
    creatorName: collection?.creatorName ?? '',
    creatorImageSrc: collection?.creatorImageSrc ?? '',
    creatorImageAlt: collection?.creatorImageAlt ?? '',
    mediaUrl: collection?.mediaUrl ?? '',
    slug: collection?.slug ?? '',
    journeyIds: collection?.templates.map((tpl) => tpl.id) ?? []
  }

  const [imagePickerOpen, setImagePickerOpen] = useState(false)

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
          creatorImageSrc:
            values.creatorImageSrc === '' ? null : values.creatorImageSrc,
          creatorImageAlt:
            values.creatorImageAlt === '' ? null : values.creatorImageAlt,
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
        if (values.creatorImageSrc !== (collection.creatorImageSrc ?? '')) {
          input.creatorImageSrc =
            values.creatorImageSrc === '' ? null : values.creatorImageSrc
        }
        if (values.creatorImageAlt !== (collection.creatorImageAlt ?? '')) {
          input.creatorImageAlt =
            values.creatorImageAlt === '' ? null : values.creatorImageAlt
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
        <>
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
                disabled={isPublished}
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
                    helperText={
                      isPublished
                        ? t('Unpublish to change templates in this collection.')
                        : t(
                            'Templates included in this collection. Drag-and-drop in the gallery view also updates this list.'
                          )
                    }
                  />
                )}
              />
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  {t('Creator image')}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  {values.creatorImageSrc !== '' ? (
                    <Box
                      component="img"
                      src={values.creatorImageSrc}
                      alt={values.creatorImageAlt}
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 1,
                        backgroundColor: 'action.hover',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexGrow: 1, justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setImagePickerOpen(true)}
                    >
                      {values.creatorImageSrc !== ''
                        ? t('Replace')
                        : t('Add image')}
                    </Button>
                    {values.creatorImageSrc !== '' && (
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => {
                          void setFieldValue('creatorImageSrc', '')
                          void setFieldValue('creatorImageAlt', '')
                        }}
                      >
                        {t('Remove')}
                      </Button>
                    )}
                  </Stack>
                </Stack>
                {values.creatorImageSrc !== '' && (
                  <TextField
                    id="creatorImageAlt"
                    name="creatorImageAlt"
                    label={t('Image description (alt text)')}
                    fullWidth
                    variant="filled"
                    size="small"
                    value={values.creatorImageAlt}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    helperText={t(
                      'Used by screen readers and shown if the image fails to load.'
                    )}
                    inputProps={{ maxLength: 200 }}
                  />
                )}
              </Stack>
            </Stack>
          </Form>
        </Dialog>
        <Dialog
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          dialogTitle={{
            title: t('Choose creator image'),
            closeButton: true
          }}
          testId="CollectionCreatorImagePicker"
          divider
          fullscreen
        >
            <Box sx={{ minHeight: 480 }}>
              <ImageBlockEditor
                selectedBlock={
                  values.creatorImageSrc !== ''
                    ? buildSyntheticImageBlock(
                        values.creatorImageSrc,
                        values.creatorImageAlt
                      )
                    : null
                }
                onChange={async (input: ImageBlockUpdateInput) => {
                  if (input.src != null && input.src !== '') {
                    void setFieldValue('creatorImageSrc', input.src)
                    void setFieldValue('creatorImageAlt', input.alt ?? '')
                    setImagePickerOpen(false)
                  }
                }}
                onDelete={async () => {
                  void setFieldValue('creatorImageSrc', '')
                  void setFieldValue('creatorImageAlt', '')
                  setImagePickerOpen(false)
                }}
              showAdd
            />
          </Box>
        </Dialog>
        </>
      )}
    </Formik>
  )
}

// Synthetic ImageBlock so we can hand the existing ImageBlockEditor a value
// for its `selectedBlock` prop. The picker only reads `src` / `alt`; the
// other fields are required by the type but unused here.
function buildSyntheticImageBlock(src: string, alt: string): ImageBlock {
  return {
    __typename: 'ImageBlock',
    id: 'collection-creator-image',
    parentBlockId: null,
    parentOrder: null,
    src,
    alt,
    width: 0,
    height: 0,
    blurhash: '',
    scale: null,
    focalTop: null,
    focalLeft: null,
    customizable: null
  }
}
