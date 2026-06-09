import { ApolloError } from '@apollo/client'
import { FormikHelpers } from 'formik'
import { TFunction } from 'i18next'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useMemo, useRef, useState } from 'react'
import { ObjectSchema, array, mixed, object, string } from 'yup'

import { TEMPLATE_GALLERY_SLUG_RE } from '@core/journeys/ui/templateGallerySlug'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageCreateInput,
  TemplateGalleryPageStatus,
  TemplateGalleryPageUpdateInput
} from '../../../../../__generated__/globalTypes'
import { useTemplateGalleryPageCreateMutation } from '../../../../libs/useTemplateGalleryPageCreateMutation'
import { useTemplateGalleryPagePublishMutation } from '../../../../libs/useTemplateGalleryPagePublishMutation'
import { useTemplateGalleryPageUnpublishMutation } from '../../../../libs/useTemplateGalleryPageUnpublishMutation'
import { useTemplateGalleryPageUpdateMutation } from '../../../../libs/useTemplateGalleryPageUpdateMutation'

import {
  CollectionMediaValues,
  EMPTY_MEDIA,
  collectionMediaToFormValues,
  formMediaToInput,
  mediaDirty as mediaDiffers
} from './collectionMedia'
import { mediaErrorMessage } from './mediaErrorMessage'

export interface CollectionFormValues {
  title: string
  description: string
  creatorName: string
  creatorImageSrc: string
  creatorImageAlt: string
  media: CollectionMediaValues
  slug: string
  journeyIds: string[]
}

export interface UseCollectionFormParams {
  mode: 'create' | 'edit'
  teamId: string
  collection?: TemplateGalleryPage
  /** When true, submit is short-circuited with a snackbar — a sibling
   * DnD mutation is still in flight on the parent. */
  parentBusy?: boolean
  /** Called once on a successful create or update. */
  onClose: () => void
  /**
   * Called after a successful publish (a 'publish'-intent submit) with
   * the just-published collection so the parent can open the success
   * dialog with the live public URL.
   */
  onPublished?: (collection: TemplateGalleryPage) => void
}

export interface UseCollectionFormResult {
  initialValues: CollectionFormValues
  schema: ObjectSchema<CollectionFormValues>
  /** True when the underlying collection is published. The dialog uses
   * this to lock the membership picker. */
  isPublished: boolean
  /**
   * Formik onSubmit. Branches on mode + intent:
   *  - create → templateGalleryPageCreate, then onClose
   *  - edit (default 'save' intent) → diff vs original, send only
   *    changed fields to templateGalleryPageUpdate, then onClose
   *  - edit + intent 'publish' → diffed update (if any), then
   *    templateGalleryPagePublish, then onClose
   * On ApolloError, maps `extensions.field` back to a Formik field error
   * for slug / mediaUrl / creatorImageSrc / title; falls back to a
   * snackbar otherwise.
   */
  handleSubmit: (
    values: CollectionFormValues,
    helpers: FormikHelpers<CollectionFormValues>
  ) => Promise<void>
  /**
   * Set the next submit's intent. The edit dialog renders both Save and
   * (for drafts) Publish backed by a single Formik onSubmit — the
   * Publish button calls this synchronously before triggering
   * `submitForm` so handleSubmit reads the right branch. The intent
   * resets to 'save' after every submit, so a plain Save (or Enter)
   * never inherits a stale publish intent.
   */
  setSubmitIntent: (intent: 'publish' | 'save') => void
  /**
   * Runs the unpublish mutation against the underlying collection and
   * closes the dialog on success. Used by the Unpublish secondary
   * button surfaced in edit mode for published collections. Bypasses
   * Formik entirely — any pending field edits are discarded, on the
   * assumption that "unpublish" is a deliberate action distinct from
   * "save".
   * No-op when called from create mode, or when no collection is
   * attached.
   */
  handleUnpublishAction: () => Promise<void>
  /**
   * True only while handleUnpublishAction is in flight. Disjoint from
   * Formik's `isSubmitting`, which still tracks the Save / Publish
   * paths. Callers should OR the two together when binding the
   * footer's `disabled` so neither path can fire a duplicate while the
   * other is mid-mutation.
   */
  isUnpublishing: boolean
  /**
   * Dirtiness of every field EXCEPT media. Callers OR this with
   * `mediaDirty` when guarding close paths.
   */
  nonMediaDirty: (values: CollectionFormValues) => boolean
  /**
   * True when the form's media differs from what the collection has saved
   * (or, in create mode, from empty). All media — link or upload — stays
   * unsaved until the dialog's Save, so any pending value trips the
   * discard prompt.
   */
  mediaDirty: (values: CollectionFormValues) => boolean
}

const FIELD_ERROR_KEYS = new Set(['slug', 'creatorImageSrc', 'title', 'media'])

function buildSchema(t: TFunction): ObjectSchema<CollectionFormValues> {
  return object({
    title: string()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters')),
    description: string().default(''),
    creatorName: string().max(100, t('Max 100 characters')).default(''),
    creatorImageSrc: string().default(''),
    creatorImageAlt: string().default(''),
    // Both-slots media value (NES-1706/1707). No completeness rule: an empty
    // active slot is valid and renders nothing (the server is the source of
    // truth for URL validation/normalization). The only Save-time media gate
    // is an in-flight/incomplete Mux upload, enforced separately in
    // CollectionDialog (`mediaBlocked`), not here.
    media: mixed<CollectionMediaValues>().required().default(EMPTY_MEDIA),
    slug: string()
      .max(200, t('Max 200 characters'))
      .matches(TEMPLATE_GALLERY_SLUG_RE, {
        message: t('Use lowercase letters, numbers, and hyphens only'),
        // The slug field only renders in edit mode. Create mode submits
        // with slug = '' and the server generates one from the title.
        excludeEmptyString: true
      })
      .default(''),
    journeyIds: array().of(string().required()).required().default([])
  })
}

/**
 * Owns the Yup schema, initial values, and submit handler for the
 * Collection create/edit dialog. Extracted from CollectionDialog so the
 * submit logic — diff-vs-original, error mapping, snackbar coordination —
 * is unit-testable in isolation.
 */
export function useCollectionForm({
  mode,
  teamId,
  collection,
  parentBusy = false,
  onClose,
  onPublished
}: UseCollectionFormParams): UseCollectionFormResult {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [templateGalleryPageCreate] = useTemplateGalleryPageCreateMutation()
  const [templateGalleryPageUpdate] = useTemplateGalleryPageUpdateMutation()
  const [templateGalleryPagePublish] = useTemplateGalleryPagePublishMutation()
  const [templateGalleryPageUnpublish] =
    useTemplateGalleryPageUnpublishMutation()
  const [unpublishing, setUnpublishing] = useState(false)
  // The media currently persisted on the server (both slots). Seeded from the
  // collection so submitting an untouched value is a no-op (media stays out of
  // the update input) and so `formMediaToInput` can diff each slot. Advanced
  // after a successful update that included media so a retried submit doesn't
  // resend it.
  const persistedMediaRef = useRef<CollectionMediaValues>(
    collectionMediaToFormValues(collection?.media)
  )

  // Memoize so identity is stable across re-renders. Formik uses
  // initialValues identity to compute `dirty`; a fresh literal each
  // render would defeat the dirty check on tab-revisits etc.
  const initialValues = useMemo<CollectionFormValues>(
    () => ({
      title: collection?.title ?? '',
      description: collection?.description ?? '',
      creatorName: collection?.creatorName ?? '',
      creatorImageSrc: collection?.creatorImageSrc ?? '',
      creatorImageAlt: collection?.creatorImageAlt ?? '',
      media: collectionMediaToFormValues(collection?.media),
      slug: collection?.slug ?? '',
      journeyIds: collection?.templates.map((tpl) => tpl.id) ?? []
    }),
    [collection]
  )

  const schema = useMemo(() => buildSchema(t), [t])

  const isPublished = collection?.status === TemplateGalleryPageStatus.published

  // Synchronous double-submit guard. Formik's `isSubmitting` flips
  // through React state, so a sub-frame second click can squeeze through
  // before the LoadingButton renders disabled. A ref flips inside the
  // same JS tick that fires the mutation, so the second invocation
  // returns immediately.
  const submittingRef = useRef(false)
  // The edit dialog renders both "Save" and (for drafts) "Publish"
  // buttons backed by a single Formik submitForm. The Publish button
  // flips this ref before triggering submit so handleSubmit can branch
  // without needing two different form `onSubmit` handlers (which
  // would split validation + error mapping in two).
  // Default 'save' — a plain Save or an Enter-key submit must never
  // publish; handleSubmit resets the ref after every run so a stale
  // publish intent (e.g. from a failed publish attempt) can't leak
  // into the next submit.
  const submitIntentRef = useRef<'publish' | 'save'>('save')
  const setSubmitIntent = (intent: 'publish' | 'save'): void => {
    submitIntentRef.current = intent
  }

  async function handleSubmit(
    values: CollectionFormValues,
    helpers: FormikHelpers<CollectionFormValues>
  ): Promise<void> {
    // Read-and-consume the intent FIRST — before the early-return guards
    // below. A Publish click that short-circuits (double-submit, parent
    // busy) must not leave a stale 'publish' behind for a later plain
    // Save or Enter-key submit to inherit.
    const intent = submitIntentRef.current
    submitIntentRef.current = 'save'
    if (submittingRef.current) return
    if (parentBusy) {
      // A DnD mutation is still in flight on the parent. Bail rather than
      // interleave a dialog mutation against the same team's cache.
      enqueueSnackbar(t('Finishing previous action…'), {
        variant: 'info',
        preventDuplicate: true
      })
      return
    }
    submittingRef.current = true
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
          journeyIds: values.journeyIds
        }
        // Include media only when the user set a slot. An empty (none) create
        // omits it entirely — symmetric with the update branch, no `{ type:
        // none }` noise for a media-less collection. Diff against empty so each
        // set slot is sent.
        if (mediaDiffers(values.media, EMPTY_MEDIA)) {
          input.media = formMediaToInput(values.media, EMPTY_MEDIA)
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
          input.description = values.description
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
        // Media: diff each slot against the last server-persisted value and
        // send the tri-state input (omit unchanged / null cleared / value
        // set). All media — a pasted link, a completed upload, a removal, a
        // None toggle — stays in the form until this Save.
        if (mediaDiffers(values.media, persistedMediaRef.current)) {
          input.media = formMediaToInput(values.media, persistedMediaRef.current)
        }
        // Skip the slug field when the user cleared it. yup's
        // `excludeEmptyString` lets an empty value pass validation (so
        // create mode's empty default doesn't error), but sending
        // `input.slug = ''` would rename the published page's slug to
        // empty and break every external link. Empty in edit mode means
        // "leave the slug alone" — same effect as an unchanged field.
        if (values.slug !== collection.slug && values.slug !== '') {
          input.slug = values.slug
        }
        const initialIds = collection.templates.map((tpl) => tpl.id).join(',')
        const nextIds = values.journeyIds.join(',')
        if (initialIds !== nextIds) {
          input.journeyIds = values.journeyIds
        }
        // 'publish' only ever holds when the footer's Publish button set
        // it synchronously before this submit (drafts only — published
        // collections don't render the button).
        const shouldPublish = intent === 'publish'
        // Only fire the update when at least one field actually changed.
        // The dialog opens pre-filled and the user may hit Publish
        // without edits — an empty-input update is a wasted round-trip
        // and would still emit the "Collection updated" snackbar, which
        // is confusing when the only action they took was publish.
        if (Object.keys(input).length > 0) {
          await templateGalleryPageUpdate({
            variables: { id: collection.id, input }
          })
          // The update persisted the form's media — advance the baseline so a
          // retry after a later failure (e.g. publish) doesn't resend it.
          if (input.media !== undefined) {
            persistedMediaRef.current = values.media
          }
          // Suppress the update snackbar when we're about to fire publish
          // — the success dialog covers it, and stacking two toasts
          // (Updated + Published) reads as noise.
          if (!shouldPublish) {
            enqueueSnackbar(t('Collection updated'), {
              variant: 'success',
              preventDuplicate: true
            })
          }
        }
        if (shouldPublish) {
          const { data } = await templateGalleryPagePublish({
            variables: { id: collection.id }
          })
          const result = data?.templateGalleryPagePublish
          if (result == null) {
            // Match the null-result trap in useCollectionMutations.publish:
            // a partial GraphQL error reaches `errorPolicy: 'all'`
            // consumers as `{ data: null, errors: [...] }`, so silently
            // falling through would leave the user staring at no
            // feedback after a publish click.
            enqueueSnackbar(t("Couldn't publish collection"), {
              variant: 'error',
              preventDuplicate: true
            })
            return
          }
          // Merge server-set fields (status, publishedAt, updatedAt,
          // slug) into the collection so the success dialog has the
          // live public URL. Don't merge the form values: the
          // collection's templates / team / fragment shape come from
          // the cached gallery list, not from the form.
          onPublished?.({
            ...collection,
            status: result.status,
            publishedAt: result.publishedAt,
            updatedAt: result.updatedAt,
            slug: result.slug
          })
        }
      }
      onClose()
    } catch (error) {
      if (error instanceof ApolloError) {
        // Scan every GraphQL error, not just [0] — a batched response can
        // carry the actionable extension at any index.
        const gqlErrors = error.graphQLErrors ?? []
        // Media validation errors carry a structured `extensions.reason`
        // (BAD_USER_INPUT) rather than a `field` — surface them inline on the
        // media field with a human-readable, translated message.
        const rawReason = gqlErrors.find(
          (e) => typeof e.extensions?.reason === 'string'
        )?.extensions?.reason
        const reason = typeof rawReason === 'string' ? rawReason : undefined
        if (reason != null) {
          await helpers.setFieldTouched('media', true, false)
          helpers.setFieldError('media', mediaErrorMessage(reason, t))
          return
        }
        // Map field-scoped errors back to Formik fields when possible.
        const fieldErrorSource = gqlErrors.find(
          (e) =>
            typeof e.extensions?.field === 'string' &&
            FIELD_ERROR_KEYS.has(e.extensions.field)
        )
        const fieldError = fieldErrorSource?.extensions?.field as
          | string
          | undefined
        if (fieldError != null) {
          // Mark the field as touched so the error renders even if the
          // user submitted without focusing it first. Fall back to the
          // ApolloError's combined message when the individual error's
          // message is empty — an empty field error renders as nothing,
          // which would make the failed save look like a silent no-op.
          await helpers.setFieldTouched(fieldError, true, false)
          helpers.setFieldError(
            fieldError,
            fieldErrorSource?.message !== undefined &&
              fieldErrorSource.message !== ''
              ? fieldErrorSource.message
              : error.message
          )
          return
        }
      }
      enqueueSnackbar(
        error instanceof Error ? error.message : t("Couldn't save collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      submittingRef.current = false
    }
  }

  async function handleUnpublishAction(): Promise<void> {
    // Only the published-collection edit dialog surfaces this action,
    // but guard anyway so a misuse from other modes is a no-op rather
    // than a partial round-trip.
    if (mode !== 'edit' || collection == null || !isPublished) return
    if (submittingRef.current) return
    if (parentBusy) {
      enqueueSnackbar(t('Finishing previous action…'), {
        variant: 'info',
        preventDuplicate: true
      })
      return
    }
    submittingRef.current = true
    setUnpublishing(true)
    try {
      const { data } = await templateGalleryPageUnpublish({
        variables: { id: collection.id }
      })
      if (data?.templateGalleryPageUnpublish == null) {
        // Same null-result trap as useCollectionMutations.unpublish:
        // a partial GraphQL error reaches `errorPolicy: 'all'`
        // consumers as `{ data: null, errors: [...] }`. Surface a
        // snackbar so the user doesn't see a silent close.
        enqueueSnackbar(t("Couldn't unpublish collection"), {
          variant: 'error',
          preventDuplicate: true
        })
        return
      }
      enqueueSnackbar(t('Collection unpublished'), {
        variant: 'success',
        preventDuplicate: true
      })
      onClose()
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't unpublish collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      submittingRef.current = false
      setUnpublishing(false)
    }
  }

  function nonMediaDirty(values: CollectionFormValues): boolean {
    return (
      values.title !== initialValues.title ||
      values.description !== initialValues.description ||
      values.creatorName !== initialValues.creatorName ||
      values.creatorImageSrc !== initialValues.creatorImageSrc ||
      values.creatorImageAlt !== initialValues.creatorImageAlt ||
      values.slug !== initialValues.slug ||
      values.journeyIds.join(',') !== initialValues.journeyIds.join(',')
    )
  }

  function mediaDirty(values: CollectionFormValues): boolean {
    return mediaDiffers(values.media, persistedMediaRef.current)
  }

  return {
    initialValues,
    schema,
    isPublished,
    handleSubmit,
    setSubmitIntent,
    handleUnpublishAction,
    isUnpublishing: unpublishing,
    nonMediaDirty,
    mediaDirty
  }
}
