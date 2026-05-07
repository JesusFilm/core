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

import { CollectionPreviewPane } from './CollectionPreviewPane'
import { CreatorImagePickerDrawer } from './CreatorImagePickerDrawer'
import { DiscardConfirmDialog } from './DiscardConfirmDialog'
import { JourneyPickerField } from './JourneyPickerField'
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
   * domain. Disables the "Open in new tab" preview button on the
   * preview pane (NES-1644). Defaults to true.
   */
  canPublish?: boolean
  /** Tooltip copy for the disabled preview button. */
  publishBlockedReason?: string | null
  onClose: () => void
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
  onClose
}: CollectionDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { initialValues, schema, isPublished, handleSubmit } =
    useCollectionForm({ mode, teamId, collection, parentBusy, onClose })

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
        // Block close paths while a submit is in flight so the user can't
        // dismiss the dialog mid-mutation (which would orphan the post-await
        // side effects). Submit succeeds → onClose() runs explicitly.
        // Also intercepts close paths when the form is dirty: opens the
        // "discard changes?" confirmation instead of closing immediately.
        const guardedClose = (): void => {
          if (isSubmitting) return
          if (dirty) {
            setDiscardConfirmOpen(true)
            return
          }
          onClose()
        }
        // Selected journeys, ordered by the user's pick order, used for the
        // carousel preview on the left pane.
        const selectedJourneysOrdered = values.journeyIds
          .map((id) => journeysById.get(id))
          .filter((j): j is Journey => j != null)
        return (
          <>
            <Dialog
              open={open}
              onClose={guardedClose}
              maxWidth="md"
              // Disable the submit + close buttons while the mutation is in
              // flight. Formik's submitForm has no internal double-click guard
              // — without this, a fast second click before React re-renders
              // would fire a second create/update mutation.
              loading={isSubmitting}
              dialogTitle={{
                title:
                  mode === 'create'
                    ? t('New Collection')
                    : t('Edit Collection'),
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
                                inputProps={{
                                  'aria-label': t(
                                    'PDF or video URL with instructions'
                                  )
                                }}
                                value={values.mediaUrl}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={
                                  touched.mediaUrl === true &&
                                  Boolean(errors.mediaUrl)
                                }
                                helperText={
                                  (touched.mediaUrl === true &&
                                    errors.mediaUrl) ||
                                  t('Paste a Canva or Google Slides link')
                                }
                              />
                            </Stack>

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
                                error={
                                  touched.slug === true && Boolean(errors.slug)
                                }
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
