import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

export interface CollectionDialogFooterProps {
  mode: 'create' | 'edit' | 'publish'
  /** True when the underlying collection is published. Only meaningful
   *  in edit mode — toggles the Unpublish button on. */
  isPublished: boolean
  /** False when the active team has a `routeAllTeamJourneys` custom
   *  domain. Gates the Publish button + drives its tooltip in publish
   *  mode. */
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
  /** True while Formik's submitForm is in flight (Save, Save Draft,
   *  Publish, Create). */
  isSubmitting: boolean
  /** True while the unpublish mutation is in flight. Disjoint from
   *  isSubmitting because Unpublish bypasses Formik. */
  isUnpublishing: boolean
  /** Called for Cancel. The dialog's guardedClose() — handles
   *  dirty-state confirmation + in-flight blocks. */
  onCancel: () => void
  /** Called for Create (create mode). Typically Formik submitForm. */
  onCreate: () => void
  /** Called for Save (edit modes). Typically Formik submitForm. */
  onSave: () => void
  /** Called for Save Draft (publish mode). Caller should setSubmitIntent('draft')
   *  before invoking. */
  onSaveDraft: () => void
  /** Called for Publish (publish mode). Caller should setSubmitIntent('publish')
   *  before invoking. */
  onPublish: () => void
  /** Called for Unpublish (edit + isPublished). Bypasses Formik. */
  onUnpublish: () => void
}

/**
 * Footer-button layout for CollectionDialog. One of four
 * configurations renders based on (mode, isPublished):
 *
 *  - create               → Cancel | Create
 *  - edit (draft)         → Cancel | Save
 *  - edit (published)     → Cancel | Unpublish | Save
 *  - publish              → Cancel | Save Draft | Publish
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
  onSaveDraft,
  onPublish,
  onUnpublish
}: CollectionDialogFooterProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const busy = isSubmitting || isUnpublishing

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
          disabled={busy}
        >
          {t('Create')}
        </Button>
      </>
    )
  }

  if (mode === 'publish') {
    // Publish is gated by (a) custom-domain teams that can't host
    // gallery pages and (b) an empty selection — moved here from the
    // card menu so the menu item can always open the dialog (the user
    // may want to fill in metadata before adding templates). Save
    // Draft stays enabled either way.
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
        <Button onClick={onSaveDraft} disabled={busy}>
          {t('Save Draft')}
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
              variant="contained"
              color="primary"
              onClick={onPublish}
              loading={isSubmitting}
              disabled={publishBlocked || busy}
            >
              {t('Publish')}
            </Button>
          </Box>
        </Tooltip>
      </>
    )
  }

  // mode === 'edit'
  if (isPublished) {
    // Unpublish lives inside the dialog so the card menu has a single
    // state-aware entry. Skips Formik on purpose — any pending field
    // edits are discarded, because "unpublish" is a deliberate status
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
          disabled={busy}
        >
          {t('Save')}
        </Button>
      </>
    )
  }

  // edit, draft — the default Cancel | Save pair, preserved for
  // consistency with the other modes so the dialog only needs one
  // footer-rendering branch.
  return (
    <>
      <Button onClick={onCancel} disabled={busy}>
        {t('Cancel')}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        loading={isSubmitting}
        disabled={busy}
      >
        {t('Save')}
      </Button>
    </>
  )
}
