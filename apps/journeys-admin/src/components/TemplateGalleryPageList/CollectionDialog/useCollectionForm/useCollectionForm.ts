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
  collectionMediaToFormValues,
  formMediaToInput,
  mediaKey
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
  mode: 'create' | 'edit' | 'publish'
  teamId: string
  collection?: TemplateGalleryPage
  /** When true, submit is short-circuited with a snackbar — a sibling
   * DnD mutation is still in flight on the parent. */
  parentBusy?: boolean
  /** Called once on a successful create or update. */
  onClose: () => void
  /**
   * Called after a successful publish (mode === 'publish') with the
   * just-published collection so the parent can open the success
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
   *  - edit, or publish + intent 'draft' → diff vs original, send
   *    only changed fields to templateGalleryPageUpdate, then onClose
   *  - publish + intent 'publish' → diffed update (if any), then
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
   * Set the next submit's intent. Only meaningful in publish mode where
   * the dialog renders both Save Draft and Publish buttons backed by a
   * single Formik onSubmit. Call this synchronously before triggering
   * `submitForm` so handleSubmit reads the right branch.
   */
  setSubmitIntent: (intent: 'publish' | 'draft') => void
  /**
   * Runs the unpublish mutation against the underlying collection and
   * closes the dialog on success. Used by the Unpublish secondary
   * button surfaced in edit mode for published collections. Bypasses
   * Formik entirely — any pending field edits are discarded, on the
   * assumption that "unpublish" is a deliberate action distinct from
   * "save".
   * No-op when called from create or publish mode, or when no
   * collection is attached.
   */
  handleUnpublishAction: () => Promise<void>
  /**
   * True only while handleUnpublishAction is in flight. Disjoint from
   * Formik's `isSubmitting`, which still tracks the Save / Save Draft /
   * Publish paths. Callers should OR the two together when binding the
   * footer's `disabled` so neither path can fire a duplicate while the
   * other is mid-mutation.
   */
  isUnpublishing: boolean
}

const FIELD_ERROR_KEYS = new Set(['slug', 'creatorImageSrc', 'title'])

function buildSchema(t: TFunction): ObjectSchema<CollectionFormValues> {
  return object({
    title: string()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters')),
    description: string().default(''),
    creatorName: string().max(100, t('Max 100 characters')).default(''),
    creatorImageSrc: string().default(''),
    creatorImageAlt: string().default(''),
    // Tagged media union (NES-1707). The server is the source of truth for
    // URL validation and normalization; this rule only guards against
    // submitting an empty link/upload. An existing mux row is valid via its
    // persisted playbackId even though the form's muxVideoId is empty (the
    // read model never exposes the original muxVideoId).
    media: mixed<CollectionMediaValues>()
      .required()
      .test('media-complete', t('Add a link or upload a video'), (value) => {
        if (value == null) return false
        if (value.type === 'none') return true
        if (value.type === 'link') return value.url.trim() !== ''
        return value.muxVideoId !== '' || value.muxPlaybackId != null
      })
      .default({ type: 'none' }),
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
  // The dialog in publish mode renders both "Save Draft" and "Publish"
  // buttons backed by a single Formik submitForm. Each button flips
  // this ref before triggering submit so handleSubmit can branch
  // without needing two different form `onSubmit` handlers (which
  // would split validation + error mapping in two).
  // Default 'publish' so an edit-mode submit (which doesn't read this
  // ref) and a publish-mode submit triggered by Enter both land on the
  // intended action.
  const submitIntentRef = useRef<'publish' | 'draft'>('publish')
  const setSubmitIntent = (intent: 'publish' | 'draft'): void => {
    submitIntentRef.current = intent
  }

  async function handleSubmit(
    values: CollectionFormValues,
    helpers: FormikHelpers<CollectionFormValues>
  ): Promise<void> {
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
          media: formMediaToInput(values.media),
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
        // Emit `media` only when it differs from the persisted value.
        // `mediaKey` produces the same key for an untouched existing row
        // (keyed by playbackId / embedUrl) so an unedited media slot is
        // omitted; `formMediaToInput` returns null for `none`, which clears.
        if (
          mediaKey(values.media) !==
          mediaKey(collectionMediaToFormValues(collection.media))
        ) {
          input.media = formMediaToInput(values.media)
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
        const shouldPublish =
          mode === 'publish' && submitIntentRef.current === 'publish'
        // Only fire the update when at least one field actually changed.
        // In publish mode the dialog opens pre-filled and the user may
        // submit without edits — an empty-input update is a wasted
        // round-trip and would still emit the "Collection updated"
        // snackbar, which is confusing when the only action they took
        // was publish.
        if (Object.keys(input).length > 0) {
          await templateGalleryPageUpdate({
            variables: { id: collection.id, input }
          })
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
        // Media validation errors carry a structured `extensions.reason`
        // (BAD_USER_INPUT) rather than a `field` — surface them inline on the
        // media field with a human-readable, translated message.
        const rawReason = error.graphQLErrors?.[0]?.extensions?.reason
        const reason = typeof rawReason === 'string' ? rawReason : undefined
        if (reason != null) {
          await helpers.setFieldTouched('media', true, false)
          helpers.setFieldError('media', mediaErrorMessage(reason, t))
          return
        }
        // Map field-scoped errors back to Formik fields when possible.
        const rawField = error.graphQLErrors?.[0]?.extensions?.field
        const fieldError = typeof rawField === 'string' ? rawField : undefined
        if (fieldError != null && FIELD_ERROR_KEYS.has(fieldError)) {
          // Mark the field as touched so the error renders even if the
          // user submitted without focusing it first.
          await helpers.setFieldTouched(fieldError, true, false)
          helpers.setFieldError(fieldError, error.message)
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

  return {
    initialValues,
    schema,
    isPublished,
    handleSubmit,
    setSubmitIntent,
    handleUnpublishAction,
    isUnpublishing: unpublishing
  }
}
