import RemoveIcon from '@mui/icons-material/Remove'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik } from 'formik'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { MuxVideoUploadProvider } from '../../MuxVideoUploadProvider'

import { CollectionDialogFooter } from './CollectionDialogFooter'
import { CollectionPreviewPane } from './CollectionPreviewPane'
import { CreatorImagePickerDrawer } from './CreatorImagePickerDrawer'
import { DiscardConfirmDialog } from './DiscardConfirmDialog'
import { JourneyPickerField } from './JourneyPickerField'
import { MediaSection } from './MediaSection'
import { useCollectionForm } from './useCollectionForm'

export interface CollectionDialogProps {
  open: boolean
  mode: 'create' | 'edit' | 'publish'
  teamId: string
  collection?: TemplateGalleryPage
  availableJourneys: readonly Journey[]
  /**
   * True when a sibling DnD mutation is in flight. Submit is blocked
   * while this is true to keep dialog and DnD mutations from
   * interleaving on the same Apollo cache.
   */
  parentBusy?: boolean
  /**
   * False when the active team has a `routeAllTeamJourneys` custom
   * domain. Disables the "Open in new tab" preview button on the
   * preview pane (NES-1644). Defaults to true.
   */
  canPublish?: boolean
  /** Tooltip copy for the disabled preview button. */
  publishBlockedReason?: string | null
  onClose: () => void
  /** Forwarded to useCollectionForm in publish mode. */
  onPublished?: (collection: TemplateGalleryPage) => void
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
  parentBusy = false,
  canPublish = true,
  publishBlockedReason = null,
  onClose,
  onPublished
}: CollectionDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const {
    initialValues,
    schema,
    isPublished,
    handleSubmit,
    setSubmitIntent,
    handleUnpublishAction,
    isUnpublishing
  } = useCollectionForm({
    mode,
    teamId,
    collection,
    parentBusy,
    onClose,
    onPublished
  })

  // O(1) lookup so the preview pane can resolve the user-pick-ordered
  // journey list per Formik render without an O(M) scan.
  const journeysById = useMemo(
    () => new Map(availableJourneys.map((j) => [j.id, j])),
    [availableJourneys]
  )

  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  // Collapsed by default in both create and edit, matching Figma's
  // "+" affordance.
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false)
  // Open when the user attempts to close the dialog with a dirty form,
  // closed (and the dialog stays open) on Cancel, closed + onClose() on
  // Discard.
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

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
        dirty,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
        setValues,
        isSubmitting
      }) => {
        // Block close paths while a mutation is in flight so the user
        // can't dismiss the dialog mid-mutation (which would orphan the
        // post-await side effects). Covers Formik submit (isSubmitting)
        // and the out-of-band unpublish action (isUnpublishing). Submit
        // succeeds → onClose() runs explicitly. Also intercepts close
        // paths when the form is dirty: opens the "discard changes?"
        // confirmation instead of closing immediately.
        const guardedClose = (): void => {
          if (isSubmitting || isUnpublishing) return
          if (dirty) {
            setDiscardConfirmOpen(true)
            return
          }
          onClose()
        }
        // Named handlers wired into the footer. Save Draft + Publish
        // share Formik's submitForm and disambiguate via the intent
        // ref; Unpublish bypasses Formik (see useCollectionForm).
        const handleCreateClick = (): void => {
          handleSubmit()
        }
        const handleSaveClick = (): void => {
          handleSubmit()
        }
        const handleSaveDraftClick = (): void => {
          setSubmitIntent('draft')
          handleSubmit()
        }
        const handlePublishClick = (): void => {
          setSubmitIntent('publish')
          handleSubmit()
        }
        const handleUnpublishClick = (): void => {
          void handleUnpublishAction()
        }
        // Selected journeys, ordered by the user's pick order, used for the
        // carousel preview on the left pane.
        const selectedJourneysOrdered = values.journeyIds
          .map((id) => journeysById.get(id))
          .filter((j): j is Journey => j != null)
        // Block every submit path while a Mux upload is pending: the form
        // carries a `mux` media with no durable id yet (muxVideoId is set by
        // the provider's onComplete, muxPlaybackId only exists on a saved
        // row). There is no `readyToStream` task field to read.
        const mediaBlocked =
          values.media.type === 'mux' &&
          values.media.muxVideoId === '' &&
          (values.media.muxPlaybackId == null ||
            values.media.muxPlaybackId === '')
        return (
          <>
            <Dialog
              open={open}
              onClose={guardedClose}
              maxWidth="md"
              // Disable the submit + close buttons while any mutation
              // is in flight. Covers Formik's submitForm (isSubmitting)
              // and the out-of-band unpublish action (isUnpublishing).
              // Without this, a fast second click before React
              // re-renders would fire a duplicate mutation.
              loading={isSubmitting || isUnpublishing}
              dialogTitle={{
                title:
                  mode === 'create'
                    ? t('New Collection')
                    : mode === 'publish'
                      ? t('Publish Collection')
                      : t('Edit Collection'),
                closeButton: true
              }}
              // Footer is always rendered via dialogActionChildren so
              // CollectionDialogFooter owns the mode-based branching in
              // one place — see that component for the four button
              // configurations.
              dialogActionChildren={
                <CollectionDialogFooter
                  mode={mode}
                  isPublished={isPublished}
                  canPublish={canPublish}
                  publishBlockedReason={publishBlockedReason}
                  journeyCount={values.journeyIds.length}
                  isSubmitting={isSubmitting}
                  isUnpublishing={isUnpublishing}
                  onCancel={guardedClose}
                  onCreate={handleCreateClick}
                  onSave={handleSaveClick}
                  onSaveDraft={handleSaveDraftClick}
                  onPublish={handlePublishClick}
                  onUnpublish={handleUnpublishClick}
                  submitBlocked={mediaBlocked}
                />
              }
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
                {/* Provider wraps the whole dialog body — above the media
                    type-toggle AND the preview pane — so switching media type
                    mid-upload does not unmount it and abort the upload. */}
                <MuxVideoUploadProvider>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems="stretch"
                  sx={{ height: { md: 537 }, minHeight: 0 }}
                >
                  <CollectionPreviewPane
                    values={values}
                    selectedJourneysOrdered={selectedJourneysOrdered}
                    publicUrl={
                      values.slug !== ''
                        ? `${
                            process.env.NEXT_PUBLIC_JOURNEYS_URL ||
                            'https://your.nextstep.is'
                          }/template-gallery/${encodeURIComponent(values.slug)}`
                        : null
                    }
                    slug={values.slug !== '' ? values.slug : null}
                    canPublish={canPublish}
                    publishBlockedReason={publishBlockedReason}
                  />
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
                          error={
                            touched.title === true && Boolean(errors.title)
                          }
                          helperText={touched.title === true && errors.title}
                          inputProps={{
                            'aria-label': t('Page title'),
                            maxLength: 100
                          }}
                        />
                      </Stack>

                      <JourneyPickerField
                        availableJourneys={availableJourneys}
                        journeyIds={values.journeyIds}
                        disabled={isPublished}
                        // `void` discards the Promise that setFieldValue
                        // returns — Formik resolves it after the next
                        // render with the validation result, which we
                        // don't await here because validation runs on
                        // submit and the picker callback is fire-and-
                        // forget. Same pattern below for setFieldTouched.
                        onChange={(next) => {
                          void setFieldValue('journeyIds', next)
                        }}
                        onTouch={() => {
                          void setFieldTouched('journeyIds', true, false)
                        }}
                      />

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
                                inputProps={{
                                  'aria-label': t(
                                    'Page description / instructions'
                                  )
                                }}
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                  touched.description === true &&
                                  Boolean(errors.description)
                                }
                                helperText={
                                  touched.description === true &&
                                  errors.description
                                }
                              />
                            </Stack>

                            {mode !== 'create' && (
                              <Stack spacing={1}>
                                <Typography sx={SECTION_HEADER}>
                                  {t('Slug')}
                                </Typography>
                                <TextField
                                  id="slug"
                                  name="slug"
                                  placeholder={t('Type here')}
                                  fullWidth
                                  variant="filled"
                                  hiddenLabel
                                  value={values.slug}
                                  inputProps={{
                                    'aria-label': t('Slug')
                                  }}
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
                                    // Strip trailing dashes on blur so the
                                    // value satisfies SLUG_PATTERN once the
                                    // user moves on; mid-typing dashes stay
                                    // so "foo-" doesn't immediately surface
                                    // a validation error.
                                    const trimmed = values.slug.replace(
                                      /-+$/,
                                      ''
                                    )
                                    if (trimmed !== values.slug) {
                                      await setFieldValue('slug', trimmed)
                                    }
                                    handleBlur(event)
                                  }}
                                  error={
                                    touched.slug === true &&
                                    Boolean(errors.slug)
                                  }
                                  helperText={
                                    (touched.slug === true && errors.slug) ||
                                    t(
                                      'Used in the public URL. Must be unique across your collections — changing it breaks existing links.'
                                    )
                                  }
                                />
                              </Stack>
                            )}

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
                                  inputProps={{
                                    'aria-label': t('Creator name'),
                                    maxLength: 100
                                  }}
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

                            <MediaSection
                              media={values.media}
                              error={
                                Boolean(touched.media) &&
                                typeof errors.media === 'string'
                                  ? errors.media
                                  : undefined
                              }
                              onChange={(next) => {
                                void setFieldValue('media', next)
                              }}
                              onBlur={() => {
                                void setFieldTouched('media', true, false)
                              }}
                              headerSx={SECTION_HEADER}
                            />
                          </Stack>
                        </Collapse>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
                </MuxVideoUploadProvider>
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
                setImagePickerOpen(false)
              }}
            />
            <DiscardConfirmDialog
              open={discardConfirmOpen}
              onCancel={() => setDiscardConfirmOpen(false)}
              onConfirm={() => {
                setDiscardConfirmOpen(false)
                onClose()
              }}
            />
          </>
        )
      }}
    </Formik>
  )
}
