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
import {
  ReactElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { sendCollectionMoreDetailsClickEvent } from '../../../libs/sendCollectionEvent'
import {
  MuxVideoUploadProvider,
  useMuxVideoUpload
} from '../../MuxVideoUploadProvider'

import { CollectionDialogFooter } from './CollectionDialogFooter'
import { CollectionPreviewPane } from './CollectionPreviewPane'
import { CreatorImagePickerDrawer } from './CreatorImagePickerDrawer'
import { DiscardConfirmDialog } from './DiscardConfirmDialog'
import { JourneyPickerField } from './JourneyPickerField'
import { MEDIA_BOX_HEIGHT, MEDIA_BOX_WIDTH } from './MediaPreview'
import { MediaSection } from './MediaSection'
import { useCollectionForm } from './useCollectionForm'

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
  /**
   * False when the active team has a `routeAllTeamJourneys` custom
   * domain. Disables the footer's Publish button and the "Open in new
   * tab" preview button on the preview pane (NES-1644). Defaults to
   * true.
   */
  canPublish?: boolean
  /** Tooltip copy for the disabled Publish / preview buttons. */
  publishBlockedReason?: string | null
  onClose: () => void
  /** Fired after the footer's Publish succeeds (edit mode, drafts). */
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

function CollectionDialogContent({
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
  const { getUploadStatus, cancelUploadForBlock } = useMuxVideoUpload()
  // Stable upload key shared by the media field and this dialog's upload
  // controls. Lifted out of MediaSection so the dialog can read the in-flight
  // status (to lock the toggle + Save) and abort the upload from discard.
  const uploadKey = useId()

  // Backstop: abort any in-flight upload if the dialog unmounts WITHOUT going
  // through the discard flow (e.g. a parent route change or re-render drops it)
  // — otherwise the upchunk request keeps running detached. The discard path
  // already cancels explicitly; a second cancel here is a no-op (the provider
  // ignores an absent/finished task), and Save is blocked while an upload is in
  // flight, so this never aborts a just-saved upload. A ref keeps the latest
  // canceller so the unmount-only effect can't capture a stale closure.
  const cancelUploadRef = useRef(cancelUploadForBlock)
  cancelUploadRef.current = cancelUploadForBlock
  useEffect(() => {
    return () => {
      cancelUploadRef.current({ id: uploadKey })
    }
  }, [uploadKey])

  const {
    initialValues,
    schema,
    isPublished,
    handleSubmit,
    setSubmitIntent,
    handleUnpublishAction,
    isUnpublishing,
    nonMediaDirty,
    mediaDirty
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

  // True only while a Mux upload is genuinely in flight (uploading bytes or
  // processing). An empty mux slot is no longer blocking — under the
  // retained-both-slots model it simply renders nothing, so a never-started or
  // failed upload is a valid (empty) state the user can Save or switch away
  // from. Saving mid-upload would drop the in-flight video, so that one case
  // still blocks every submit path.
  function isMediaBlocked(): boolean {
    const task = getUploadStatus(uploadKey)
    return task?.status === 'uploading' || task?.status === 'processing'
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      // Guard the Enter-key path: the footer buttons disable on mediaBlocked,
      // but a keyboard form submit bypasses them — without this, Enter during
      // a replacement upload (which passes schema validation thanks to the
      // prior playbackId) would save mid-upload and close the dialog,
      // silently dropping the new video.
      onSubmit={async (vals, helpers) => {
        if (isMediaBlocked()) return
        await handleSubmit(vals, helpers)
      }}
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
        // A Mux upload is genuinely in flight (uploading bytes, or Mux is
        // processing). Reliable signal from the provider — unlike the form
        // value it also catches a *replacement* upload, which still carries the
        // prior video's playbackId.
        const uploadTask = getUploadStatus(uploadKey)
        const uploadInFlight =
          uploadTask?.status === 'uploading' ||
          uploadTask?.status === 'processing'
        // Unsaved changes = dialog-saved fields (nonMediaDirty) plus any
        // media that hasn't reached the server — an edited link, a completed
        // upload, a removal (all covered by mediaDirty; every media value
        // saves with the Save button) — and an in-flight upload, so Cancel
        // routes through discard (which aborts it).
        const hasUnsavedChanges =
          nonMediaDirty(values) || mediaDirty(values) || uploadInFlight
        // Block close paths while a mutation is in flight so the user
        // can't dismiss the dialog mid-mutation (which would orphan the
        // post-await side effects). Covers Formik submit (isSubmitting) and
        // the out-of-band unpublish action (isUnpublishing). Submit succeeds
        // → onClose() runs explicitly. Also intercepts close paths when
        // there are unsaved changes: opens the "discard changes?"
        // confirmation instead of closing immediately.
        const guardedClose = (): void => {
          if (isSubmitting || isUnpublishing) return
          if (hasUnsavedChanges) {
            setDiscardConfirmOpen(true)
            return
          }
          onClose()
        }
        // Named handlers wired into the footer. Save + Publish share
        // Formik's submitForm and disambiguate via the intent ref
        // (which defaults to — and resets to — 'save'); Unpublish
        // bypasses Formik (see useCollectionForm).
        const handleCreateClick = (): void => {
          handleSubmit()
        }
        const handleSaveClick = (): void => {
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
        // Blocks every submit path (footer buttons here; the Enter-key path
        // is guarded in Formik's onSubmit above with the same predicate).
        const mediaBlocked = isMediaBlocked()
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
                    : t('Edit Collection'),
                closeButton: true
              }}
              // Footer is always rendered via dialogActionChildren so
              // CollectionDialogFooter owns the mode-based branching in
              // one place — see that component for the three button
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
                          onClick={() => {
                            if (!moreDetailsOpen && collection != null) {
                              sendCollectionMoreDetailsClickEvent({
                                collectionId: collection.id
                              })
                            }
                            setMoreDetailsOpen((v) => !v)
                          }}
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
                                      'Used in the public URL. Must be unique across all collections — changing it breaks existing links.'
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
                                spacing={2}
                                alignItems="flex-start"
                              >
                                {/* Square image box matching the media field's
                                    preview box so the two sections line up. */}
                                <ButtonBase
                                  onClick={() => setImagePickerOpen(true)}
                                  sx={{
                                    bgcolor: '#efefef',
                                    borderRadius: 2,
                                    // 8px inset (theme spacing unit is 4px).
                                    p: 2,
                                    width: MEDIA_BOX_WIDTH,
                                    height: MEDIA_BOX_HEIGHT,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexShrink: 0
                                  }}
                                  aria-label={t('Choose creator image')}
                                >
                                  {/* Image fills the padded area's height and
                                      stretches up to the edit icon's lane, so
                                      the grey border is even on the left/top/
                                      bottom — mirroring the media field's
                                      frame. */}
                                  {values.creatorImageSrc !== '' ? (
                                    <Box
                                      component="img"
                                      src={values.creatorImageSrc}
                                      alt={values.creatorImageAlt}
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
                                    sx={{
                                      fontSize: 24,
                                      color: 'primary.main',
                                      flexShrink: 0
                                    }}
                                  />
                                </ButtonBase>
                                {/* Right column: Remove sits directly under
                                    the name field (natural flow, no bottom
                                    pinning). Always rendered — disabled when
                                    there's no image — so toggling the image
                                    never shifts the layout. */}
                                <Stack
                                  spacing={1}
                                  sx={{ flex: 1, minWidth: 0 }}
                                >
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
                                  <Button
                                    variant="text"
                                    size="small"
                                    color="error"
                                    disabled={values.creatorImageSrc === ''}
                                    onClick={() => {
                                      void setFieldValue('creatorImageSrc', '')
                                      void setFieldValue('creatorImageAlt', '')
                                    }}
                                    sx={{ alignSelf: 'flex-start' }}
                                  >
                                    {t('Remove image')}
                                  </Button>
                                </Stack>
                              </Stack>
                            </Stack>

                            <MediaSection
                              media={values.media}
                              uploadKey={uploadKey}
                              disableModeSwitch={uploadInFlight}
                              saving={isSubmitting}
                              error={
                                Boolean(touched.media) &&
                                typeof errors.media === 'string'
                                  ? errors.media
                                  : undefined
                              }
                              // Every media edit — link or upload — is form
                              // state, persisted by the dialog's Save.
                              onChange={(next) => {
                                void setFieldValue('media', next)
                              }}
                              headerSx={SECTION_HEADER}
                            />
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
                setImagePickerOpen(false)
              }}
            />
            <DiscardConfirmDialog
              open={discardConfirmOpen}
              onCancel={() => setDiscardConfirmOpen(false)}
              onConfirm={() => {
                // Discarding aborts any in-flight upload (upchunk + polling).
                // The provider's unmount cleanup only clears polling, never the
                // upload itself, so cancel it explicitly. No-op when idle.
                cancelUploadForBlock({ id: uploadKey })
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

export function CollectionDialog(props: CollectionDialogProps): ReactElement {
  // Provider wraps the whole dialog so the media field, the toggle, AND the
  // dialog's action/close logic share one upload context — switching media
  // type mid-upload never unmounts it, and the discard flow can abort it.
  return (
    <MuxVideoUploadProvider>
      <CollectionDialogContent {...props} />
    </MuxVideoUploadProvider>
  )
}
