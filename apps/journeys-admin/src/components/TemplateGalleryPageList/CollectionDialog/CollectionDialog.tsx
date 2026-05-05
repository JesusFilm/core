import { ApolloError } from '@apollo/client'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import RemoveIcon from '@mui/icons-material/Remove'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form, Formik, FormikHelpers } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { array, object, string } from 'yup'

import { StrategySection } from '@core/journeys/ui/StrategySection'
import { Dialog } from '@core/shared/ui/Dialog'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Play3Icon from '@core/shared/ui/icons/Play3'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

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

// Matches the Figma "Editor / Subtitle/2" type token on section headers.
const SECTION_HEADER = {
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: '24px',
  color: '#444451'
} as const

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
  // Collapsed by default in both create and edit, matching Figma's
  // "+" affordance.
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false)
  // Mirror the editor's image picker: side drawer on md+, bottom sheet
  // on smaller. Matches breakpoint and feel of `Editor/.../Drawer`.
  const pickerMdUp = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  )

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
      }) => {
        // Selected journeys, ordered by the user's pick order, used for the
        // carousel preview on the left pane.
        const selectedJourneysOrdered = values.journeyIds
          .map((id) => availableJourneys.find((j) => j.id === id))
          .filter((j): j is Journey => j != null)
        return (
        <>
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          dialogTitle={{
            title: t('Template Gallery Page'),
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
              {/* Preview pane (left) */}
              <Box
                sx={{
                  bgcolor: '#efefef',
                  // 32px x-padding on each side + 287px card + 32px = 351,
                  // round to 352 for an even pane width.
                  flex: { md: '0 0 352px' },
                  px: 4,
                  py: 2,
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  // Pane never scrolls; the card itself (below) hosts the
                  // single Y scrollbar when description + carousel exceed
                  // the mobile frame.
                  overflow: 'hidden',
                  minHeight: 0
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow:
                      '0 6px 10px rgba(0,0,0,0.14), 0 1px 18px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.2)',
                    // Width fixed (mobile-ish frame); height fills the pane
                    // minus its py:2 padding so the card never overflows
                    // its parent and the only scrollbar is inside the card.
                    width: 287,
                    height: '100%',
                    flexShrink: 0,
                    p: 2.5,
                    // Card hosts the single Y scrollbar. Horizontal stays
                    // clipped — the template carousel child manages its
                    // own X scroll.
                    overflowX: 'hidden',
                    overflowY: 'auto'
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 600,
                        fontSize: 20,
                        lineHeight: 1.2,
                        color: '#444451'
                      }}
                    >
                      {values.title !== ''
                        ? values.title
                        : t('Untitled collection')}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'Open Sans, sans-serif',
                        fontSize: 14,
                        lineHeight: 1.43,
                        color: '#444451',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {values.description !== ''
                        ? values.description
                        : t(
                            'A short description of your collection will appear here.'
                          )}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={
                          values.creatorImageSrc !== ''
                            ? values.creatorImageSrc
                            : undefined
                        }
                        alt={values.creatorImageAlt}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography
                        sx={{
                          fontFamily: 'Open Sans, sans-serif',
                          fontSize: 14,
                          color: '#6d6d7d'
                        }}
                      >
                        {values.creatorName !== ''
                          ? values.creatorName
                          : t('Creator name')}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      mt: 2.5,
                      // Horizontal scroll for the carousel of selected
                      // templates — mirrors the public gallery page layout.
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      mx: -2.5, // bleed past the card padding so cards can
                      px: 2.5,  // start flush with the card text above
                      pb: 2.5   // breathing room below cards so the
                                // horizontal scrollbar doesn't sit on the
                                // Use/Play buttons

                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ width: 'fit-content' }}
                    >
                      {selectedJourneysOrdered.length === 0
                        ? [0, 1].map((idx) => (
                            <Box
                              key={`placeholder-${idx}`}
                              sx={{
                                width: 160,
                                height: 280,
                                borderRadius: 1.5,
                                bgcolor: 'action.hover',
                                flexShrink: 0,
                                opacity: 0.6
                              }}
                            />
                          ))
                        : selectedJourneysOrdered.map((journey) => (
                            <Stack
                              key={journey.id}
                              spacing={0.75}
                              sx={{ width: 160, flexShrink: 0 }}
                            >
                              <Box
                                sx={{
                                  width: '100%',
                                  height: 240,
                                  borderRadius: 1.5,
                                  overflow: 'hidden',
                                  position: 'relative',
                                  bgcolor: 'action.hover',
                                  ...(journey.primaryImageBlock?.src != null && {
                                    backgroundImage: `url(${journey.primaryImageBlock.src})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  })
                                }}
                              >
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    p: 1,
                                    background:
                                      'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0) 90%)'
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontFamily: 'Montserrat, sans-serif',
                                      fontWeight: 600,
                                      fontSize: 13,
                                      lineHeight: 1.25,
                                      color: 'white',
                                      overflow: 'hidden',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical'
                                    }}
                                  >
                                    {journey.title}
                                  </Typography>
                                </Box>
                              </Box>
                              {/* Use + Play buttons mirror the public gallery
                                  card. They're decorative here — clicks no-op,
                                  but hover styles stay so the preview
                                  represents the live experience. */}
                              <Stack direction="row" spacing={0.75}>
                                <Button
                                  variant="outlined"
                                  onClick={() => undefined}
                                  sx={{
                                    flex: '0 0 auto',
                                    width: 96,
                                    height: 32,
                                    borderRadius: 1,
                                    px: 0,
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    textTransform: 'none',
                                    color: '#444451',
                                    borderColor: '#444451',
                                    opacity: 0.6,
                                    '&:hover': {
                                      borderColor: '#444451',
                                      opacity: 1
                                    }
                                  }}
                                >
                                  {t('Use')}
                                </Button>
                                <IconButton
                                  aria-label={t('Play')}
                                  onClick={() => undefined}
                                  sx={{
                                    flex: 1,
                                    height: 32,
                                    borderRadius: 1,
                                    bgcolor: '#26262E',
                                    color: 'common.white',
                                    opacity: 0.6,
                                    '&:hover': {
                                      bgcolor: '#26262E',
                                      opacity: 1
                                    }
                                  }}
                                >
                                  <Play3Icon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Stack>
                            </Stack>
                          ))}
                    </Stack>
                  </Box>
                  {/* Embedded PDF/video — same component the editor's
                      About tab uses for strategy embeds. Renders an
                      iframe for Canva/Google Slides URLs and a
                      "Case Study Preview" placeholder otherwise. */}
                  <Box
                    sx={{
                      mt: 2.5,
                      // Strip StrategySection's xs/sm bottom padding so
                      // it sits flush within the preview card layout.
                      '& > .MuiStack-root': { pb: 0 }
                    }}
                  >
                    <StrategySection
                      strategySlug={
                        values.mediaUrl !== '' ? values.mediaUrl : null
                      }
                      variant="placeholder"
                    />
                  </Box>
                </Box>
              </Box>

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
                      options={availableJourneys.slice()}
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
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      onClick={() => setMoreDetailsOpen((v) => !v)}
                      sx={{ cursor: 'pointer', py: 0.5 }}
                      role="button"
                      aria-expanded={moreDetailsOpen}
                    >
                      <Typography sx={SECTION_HEADER}>
                        {t('More details')}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label={
                          moreDetailsOpen
                            ? t('Collapse more details')
                            : t('Expand more details')
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          setMoreDetailsOpen((v) => !v)
                        }}
                      >
                        {moreDetailsOpen ? <RemoveIcon /> : <Plus2Icon />}
                      </IconButton>
                    </Stack>

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
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Form>
        </Dialog>
        <Drawer
          anchor={pickerMdUp ? 'right' : 'bottom'}
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          data-testid="CollectionCreatorImagePicker"
          // Render above the parent CollectionDialog (modal z-index 1300).
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
          PaperProps={{
            sx: {
              // Match the editor's settings drawer dimensions and chrome.
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              width: { xs: 'auto', md: 328 },
              left: { xs: 0, md: 'auto' },
              top: { xs: 0, md: 32 },
              right: { xs: 0, md: 32 },
              bottom: 0,
              height: 'calc(100% - 20px)',
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: 1,
              borderColor: 'divider',
              flexShrink: 0
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('Choose creator image')}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setImagePickerOpen(false)}
              aria-label={t('Close')}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
        </Drawer>
        </>
        )
      }}
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
