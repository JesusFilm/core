import { ApolloError } from '@apollo/client'
import RemoveIcon from '@mui/icons-material/Remove'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikHelpers } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'
import { array, object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageCreateInput,
  TemplateGalleryPageStatus,
  TemplateGalleryPageUpdateInput
} from '../../../../__generated__/globalTypes'
import { useTemplateGalleryPageCreateMutation } from '../../../libs/useTemplateGalleryPageCreateMutation'
import { useTemplateGalleryPageUpdateMutation } from '../../../libs/useTemplateGalleryPageUpdateMutation'

import { CollectionPreviewPane } from './CollectionPreviewPane'
import { CreatorImagePickerDrawer } from './CreatorImagePickerDrawer'

export interface CollectionDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  teamId: string
  collection?: TemplateGalleryPage
  availableJourneys: readonly Journey[]
  /**
   * True when a sibling DnD mutation is in flight. Submit is blocked
   * while this is true to keep dialog and DnD mutations from
   * interleaving on the same Apollo cache.
   */
  parentBusy?: boolean
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

// Matches the Figma "Editor / Subtitle/2" type token on section headers.
const SECTION_HEADER = {
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: '24px',
  color: '#444451'
} as const

export function CollectionDialog({
  open,
  mode,
  teamId,
  collection,
  availableJourneys,
  parentBusy,
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

  // Tracks whether the dialog is still mounted, so post-await side effects
  // (setFieldError / snackbar) don't fire on a torn-down Formik tree when
  // the user dismisses while a mutation is in flight.
  const mountedRef = useRef(true)
  useEffect(
    () => () => {
      mountedRef.current = false
    },
    []
  )
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  // Collapsed by default in both create and edit, matching Figma's
  // "+" affordance.
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false)

  const schema = object({
    title: string()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters')),
    description: string(),
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
    if (parentBusy === true) {
      // A DnD mutation is still in flight on the parent. Bail rather than
      // interleave a dialog mutation against the same team's cache.
      enqueueSnackbar(t('Finishing previous action…'), {
        variant: 'info',
        preventDuplicate: true
      })
      return
    }
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
        if (!mountedRef.current) return
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
        const initialIds = collection.templates.map((tpl) => tpl.id).join(',')
        const nextIds = values.journeyIds.join(',')
        if (initialIds !== nextIds) {
          input.journeyIds = values.journeyIds
        }
        await templateGalleryPageUpdate({
          variables: { id: collection.id, input }
        })
        if (!mountedRef.current) return
        enqueueSnackbar(t('Collection updated'), {
          variant: 'success',
          preventDuplicate: true
        })
      }
      onClose()
    } catch (error) {
      if (!mountedRef.current) return
      if (error instanceof ApolloError) {
        // Map field-scoped errors back to Formik fields when possible.
        const rawField = error.graphQLErrors?.[0]?.extensions?.field
        const fieldError = typeof rawField === 'string' ? rawField : undefined
        if (
          fieldError != null &&
          (fieldError === 'slug' ||
            fieldError === 'mediaUrl' ||
            fieldError === 'creatorImageSrc' ||
            fieldError === 'title')
        ) {
          // Mark the field as touched so the error renders even if the
          // user submitted without focusing it first.
          await helpers.setFieldTouched(fieldError, true, false)
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
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
        setValues,
        isSubmitting
      }) => {
        // Block close paths while a submit is in flight so the user can't
        // dismiss the dialog mid-mutation (which would orphan the post-await
        // side effects). Submit succeeds → onClose() runs explicitly.
        const guardedClose = (): void => {
          if (isSubmitting) return
          onClose()
        }
        // Selected journeys, ordered by the user's pick order, used for the
        // carousel preview on the left pane.
        const selectedJourneysOrdered = values.journeyIds
          .map((id) => availableJourneys.find((j) => j.id === id))
          .filter((j): j is Journey => j != null)
        return (
        <>
        <Dialog
          open={open}
          onClose={guardedClose}
          maxWidth="md"
          dialogTitle={{
            title:
              mode === 'create' ? t('New Collection') : t('Edit Collection'),
            closeButton: true
          }}
          dialogAction={{
            onSubmit: handleSubmit,
            closeLabel: t('Cancel'),
            submitLabel: mode === 'create' ? t('Create') : t('Save')
          }}
          testId="CollectionDialog"
          sx={{
            '& .MuiDialogContent-root': {
              p: 0,
              display: 'flex',
              flexDirection: 'column'
            },
            '& .MuiDialogActions-root': { px: 3, py: 2 }
          }}
        >
          <Form
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems="stretch"
              sx={{ height: { md: 537 }, minHeight: 0 }}
            >
              <CollectionPreviewPane
                values={values}
                selectedJourneysOrdered={selectedJourneysOrdered}
              />
              {/* Settings pane (right) */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  px: { xs: 2, md: 3 },
                  py: 2.5,
                  // Right pane scrolls vertically; horizontal stays clipped
                  // because form fields wrap.
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
              >
                <Stack spacing={3}>
                  {/* Page Title (always visible) */}
                  <Stack spacing={1}>
                    <Typography sx={SECTION_HEADER}>
                      {t('Page Title')}
                      <Box
                        component="span"
                        sx={{ color: 'error.main', ml: 0.25 }}
                      >
                        *
                      </Box>
                    </Typography>
                    <TextField
                      id="title"
                      name="title"
                      placeholder={t('Type here')}
                      fullWidth
                      variant="filled"
                      hiddenLabel
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.title === true && Boolean(errors.title)}
                      helperText={touched.title === true && errors.title}
                      inputProps={{ maxLength: 100 }}
                    />
                  </Stack>

                  {/* Templates picker (always visible) */}
                  <Stack spacing={1}>
                    <Typography sx={SECTION_HEADER}>
                      {t('Templates on the page:')}
                    </Typography>
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      disabled={isPublished}
                      options={availableJourneys as Journey[]}
                      getOptionLabel={(option) => option.title}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
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
                          placeholder={
                            values.journeyIds.length === 0
                              ? t('Select templates to include')
                              : undefined
                          }
                          variant="outlined"
                          hiddenLabel
                          helperText={
                            isPublished
                              ? t(
                                  'Unpublish to change templates in this collection.'
                                )
                              : undefined
                          }
                        />
                      )}
                    />
                  </Stack>

                  {/* More details accordion */}
                  <Stack>
                    <ButtonBase
                      onClick={() => setMoreDetailsOpen((v) => !v)}
                      aria-expanded={moreDetailsOpen}
                      aria-label={
                        moreDetailsOpen
                          ? t('Collapse more details')
                          : t('Expand more details')
                      }
                      sx={{
                        py: 0.5,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%'
                      }}
                    >
                      <Typography sx={SECTION_HEADER}>
                        {t('More details')}
                      </Typography>
                      {moreDetailsOpen ? (
                        <RemoveIcon fontSize="small" />
                      ) : (
                        <Plus2Icon fontSize="small" />
                      )}
                    </ButtonBase>

                    <Collapse in={moreDetailsOpen} mountOnEnter>
                      <Stack spacing={3} sx={{ pt: 2 }}>
                        {/* Page Description / Instructions */}
                        <Stack spacing={1}>
                          <Typography sx={SECTION_HEADER}>
                            {t('Page Description / Instructions')}
                          </Typography>
                          <TextField
                            id="description"
                            name="description"
                            fullWidth
                            multiline
                            rows={4}
                            variant="filled"
                            hiddenLabel
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.description === true &&
                              Boolean(errors.description)
                            }
                            helperText={
                              touched.description === true && errors.description
                            }
                          />
                        </Stack>

                        {/* Creator Details */}
                        <Stack spacing={1}>
                          <Typography sx={SECTION_HEADER}>
                            {t('Creator Details')}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="stretch"
                          >
                            <ButtonBase
                              onClick={() => setImagePickerOpen(true)}
                              sx={{
                                bgcolor: '#efefef',
                                borderRadius: 2,
                                p: 1,
                                height: 77,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexShrink: 0
                              }}
                              aria-label={t('Choose creator image')}
                            >
                              {values.creatorImageSrc !== '' ? (
                                <Box
                                  component="img"
                                  src={values.creatorImageSrc}
                                  alt={values.creatorImageAlt}
                                  sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 1,
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 1,
                                    bgcolor: 'rgba(0,0,0,0.08)'
                                  }}
                                />
                              )}
                              <Edit2Icon
                                sx={{ fontSize: 24, color: 'primary.main' }}
                              />
                            </ButtonBase>
                            <TextField
                              id="creatorName"
                              name="creatorName"
                              placeholder={t('Creator name')}
                              fullWidth
                              variant="filled"
                              hiddenLabel
                              value={values.creatorName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.creatorName === true &&
                                Boolean(errors.creatorName)
                              }
                              helperText={
                                touched.creatorName === true &&
                                errors.creatorName
                              }
                              inputProps={{ maxLength: 100 }}
                            />
                          </Stack>
                          {values.creatorImageSrc !== '' && (
                            <Box sx={{ pt: 0.5, alignSelf: 'flex-end' }}>
                              <Button
                                variant="text"
                                size="small"
                                color="error"
                                onClick={() => {
                                  void setFieldValue('creatorImageSrc', '')
                                  void setFieldValue('creatorImageAlt', '')
                                }}
                              >
                                {t('Remove image')}
                              </Button>
                            </Box>
                          )}
                        </Stack>

                        {/* Add PDF/Video URL */}
                        <Stack spacing={1}>
                          <Typography sx={SECTION_HEADER}>
                            {t('Add PDF/Video with instructions')}
                          </Typography>
                          <TextField
                            id="mediaUrl"
                            name="mediaUrl"
                            placeholder={t('Paste URL')}
                            fullWidth
                            variant="filled"
                            hiddenLabel
                            value={values.mediaUrl}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.mediaUrl === true &&
                              Boolean(errors.mediaUrl)
                            }
                            helperText={
                              (touched.mediaUrl === true && errors.mediaUrl) ||
                              t('Google Slides, Canva, YouTube, Loom, etc')
                            }
                          />
                        </Stack>

                        {/* Slug (edit mode only) */}
                        {mode === 'edit' && (
                          <TextField
                            id="slug"
                            name="slug"
                            label={t('Slug')}
                            fullWidth
                            variant="filled"
                            value={values.slug}
                            // Slugify on every keystroke so the input
                            // mirrors what the backend will accept: lowercase,
                            // swap whitespace + invalid chars for dashes,
                            // collapse runs, and clip leading dashes.
                            // Trailing dashes stay so the user can still
                            // type "foo-bar"; we strip them on blur.
                            onChange={async (event) => {
                              const slugified = event.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]+/g, '-')
                                .replace(/-+/g, '-')
                                .replace(/^-+/, '')
                              await setFieldValue('slug', slugified)
                            }}
                            onBlur={async (event) => {
                              // Strip trailing dashes on blur so the value
                              // satisfies SLUG_PATTERN once the user moves
                              // on; mid-typing dashes stay so "foo-" doesn't
                              // immediately surface a validation error.
                              const trimmed = values.slug.replace(/-+$/, '')
                              if (trimmed !== values.slug) {
                                await setFieldValue('slug', trimmed)
                              }
                              handleBlur(event)
                            }}
                            error={touched.slug === true && Boolean(errors.slug)}
                            helperText={
                              (touched.slug === true && errors.slug) ||
                              t(
                                'Used in the public URL. Must be unique across your collections — changing it breaks existing links.'
                              )
                            }
                          />
                        )}
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Form>
        </Dialog>
        <CreatorImagePickerDrawer
          open={imagePickerOpen}
          src={values.creatorImageSrc}
          alt={values.creatorImageAlt}
          onClose={() => setImagePickerOpen(false)}
          onChange={async (src, alt) => {
            await setValues(
              (v) => ({ ...v, creatorImageSrc: src, creatorImageAlt: alt }),
              true
            )
            if (!mountedRef.current) return
            setImagePickerOpen(false)
          }}
        />
        </>
        )
      }}
    </Formik>
  )
}

