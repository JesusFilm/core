import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

export interface CollectionDialogFooterProps {
  mode: 'create' | 'edit'
  /** True when the underlying collection is published. Only meaningful
   *  in edit mode — picks the contextual status button (Publish for a
   *  draft, Unpublish for a published collection). */
  isPublished: boolean
  /** False when the active team has a `routeAllTeamJourneys` custom
   *  domain. Gates the Publish button + drives its tooltip. */
  canPublish: boolean
  /** Tooltip copy shown on the disabled Publish button when canPublish
   *  is false. When null, no tooltip is shown — `useCanPublishCollection`
   *  always provides a reason today, so a null reason here just leaves
   *  the button silently disabled. Callers gating Publish should pass a
   *  non-null string. */
  publishBlockedReason: string | null
  /** Number of templates currently selected — Publish stays disabled
   *  while this is zero, with a tooltip prompting the user to add at
   *  least one. */
  journeyCount: number
  /** True while Formik's submitForm is in flight (Save, Publish,
   *  Create). */
  isSubmitting: boolean
  /** True while the unpublish mutation is in flight. Disjoint from
   *  isSubmitting because Unpublish bypasses Formik. */
  isUnpublishing: boolean
  /** Called for Cancel. The dialog's guardedClose() — handles
   *  dirty-state confirmation + in-flight blocks. */
  onCancel: () => void
  /** Called for Create (create mode). Typically Formik submitForm. */
  onCreate: () => void
  /** Called for Save (edit mode). Typically Formik submitForm. */
  onSave: () => void
  /** Called for Publish (edit + draft). Caller should
   *  setSubmitIntent('publish') before invoking. */
  onPublish: () => void
  /** Called for Unpublish (edit + isPublished). Bypasses Formik. */
  onUnpublish: () => void
  /** True when a media upload is in flight or incomplete — gates every
   *  submit path (Create / Save / Publish) so the form can't be saved
   *  with an unfinished Mux upload. Cancel/Unpublish are exempt. */
  submitBlocked?: boolean
}

/**
 * Footer-button layout for CollectionDialog. One of three
 * configurations renders based on (mode, isPublished). Save is always
 * the primary action in edit mode; the middle button is the contextual
 * status toggle:
 *
 *  - create               → Cancel | Create
 *  - edit (draft)         → Cancel | Publish | Save
 *  - edit (published)     → Cancel | Unpublish | Save
 *
 * Extracted out of CollectionDialog to keep the dialog's render
 * tree readable — the previous IIFE-in-prop pattern stacked two
 * unusual idioms (self-invoked arrow + JSX-as-prop-value) and
 * pushed the testId/sx props ~90 lines below the prop it was on.
 */
export function CollectionDialogFooter({
  mode,
  isPublished,
  canPublish,
  publishBlockedReason,
  journeyCount,
  isSubmitting,
  isUnpublishing,
  onCancel,
  onCreate,
  onSave,
  onPublish,
  onUnpublish,
  submitBlocked = false
}: CollectionDialogFooterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const busy = isSubmitting || isUnpublishing
  // Submit paths are also blocked while a media upload is incomplete.
  const submitDisabled = busy || submitBlocked

  if (mode === 'create') {
    return (
      <>
        <Button onClick={onCancel} disabled={busy}>
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onCreate}
          loading={isSubmitting}
          disabled={submitDisabled}
        >
          {t('Create')}
        </Button>
      </>
    )
  }

  // mode === 'edit'
  if (isPublished) {
    // Unpublish lives inside the dialog so the card menu has a single
    // "Edit" entry. Skips Formik on purpose — any pending field edits
    // are discarded, because "unpublish" is a deliberate status
    // change, not a save path.
    return (
      <>
        <Button onClick={onCancel} disabled={busy}>
          {t('Cancel')}
        </Button>
        <Button
          color="error"
          onClick={onUnpublish}
          loading={isUnpublishing}
          disabled={busy}
        >
          {t('Unpublish')}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          loading={isSubmitting}
          disabled={submitDisabled}
        >
          {t('Save')}
        </Button>
      </>
    )
  }

  // edit, draft — Publish sits in the contextual middle slot (the same
  // spot Unpublish occupies for a published collection) so Save stays
  // anchored as the primary action. Publish is gated by (a)
  // custom-domain teams that can't host gallery pages and (b) an empty
  // selection — the card menu's Edit always opens the dialog (the user
  // may want to fill in metadata before adding templates); this button
  // is what gates publishing.
  const publishBlocked = !canPublish || journeyCount === 0
  const publishTooltip = !canPublish
    ? (publishBlockedReason ?? '')
    : journeyCount === 0
      ? t('Add at least one template before publishing')
      : ''
  return (
    <>
      <Button onClick={onCancel} disabled={busy}>
        {t('Cancel')}
      </Button>
      <Tooltip
        title={publishTooltip}
        placement="top"
        disableHoverListener={!publishBlocked}
        disableFocusListener={!publishBlocked}
      >
        {/* MUI requires a non-disabled wrapper so the Tooltip can
            attach pointer events even when the Button is disabled.
            Using Box with component="span" keeps the inline flow
            while satisfying the apps "MUI over raw HTML" rule. */}
        <Box component="span">
          <Button
            onClick={onPublish}
            loading={isSubmitting}
            disabled={publishBlocked || submitDisabled}
          >
            {t('Publish')}
          </Button>
        </Box>
      </Tooltip>
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        loading={isSubmitting}
        disabled={submitDisabled}
      >
        {t('Save')}
      </Button>
    </>
  )
}
