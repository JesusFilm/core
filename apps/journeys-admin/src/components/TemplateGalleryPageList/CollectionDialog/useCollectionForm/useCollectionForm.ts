import { ApolloError } from '@apollo/client'
import { FormikHelpers } from 'formik'
import { TFunction } from 'i18next'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useMemo, useRef } from 'react'
import { ObjectSchema, array, object, string } from 'yup'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageCreateInput,
  TemplateGalleryPageStatus,
  TemplateGalleryPageUpdateInput
} from '../../../../../__generated__/globalTypes'
import { useTemplateGalleryPageCreateMutation } from '../../../../libs/useTemplateGalleryPageCreateMutation'
import { useTemplateGalleryPageUpdateMutation } from '../../../../libs/useTemplateGalleryPageUpdateMutation'

export interface CollectionFormValues {
  title: string
  description: string
  creatorName: string
  creatorImageSrc: string
  creatorImageAlt: string
  mediaUrl: string
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
}

export interface UseCollectionFormResult {
  initialValues: CollectionFormValues
  schema: ObjectSchema<CollectionFormValues>
  /** True when the underlying collection is published. The dialog uses
   * this to lock the membership picker. */
  isPublished: boolean
  /**
   * Formik onSubmit. Branches on mode:
   *  - create → templateGalleryPageCreate, then onClose
   *  - edit → diff values vs the original collection, send only the
   *    changed fields to templateGalleryPageUpdate, then onClose
   * On ApolloError, maps `extensions.field` back to a Formik field error
   * for slug / mediaUrl / creatorImageSrc / title; falls back to a
   * snackbar otherwise.
   */
  handleSubmit: (
    values: CollectionFormValues,
    helpers: FormikHelpers<CollectionFormValues>
  ) => Promise<void>
}

const FIELD_ERROR_KEYS = new Set([
  'slug',
  'mediaUrl',
  'creatorImageSrc',
  'title'
])

function buildSchema(
  t: TFunction
): ObjectSchema<CollectionFormValues> {
  return object({
    title: string()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters')),
    description: string().default(''),
    creatorName: string()
      .max(100, t('Max 100 characters'))
      .default(''),
    creatorImageSrc: string().default(''),
    creatorImageAlt: string().default(''),
    mediaUrl: string()
      .max(2048, t('URL too long'))
      .default('')
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
      .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
        message: t('Use lowercase letters, numbers, and hyphens only'),
        // The slug field only renders in edit mode. Create mode submits
        // with slug = '' and the server generates one from the title.
        excludeEmptyString: true
      })
      .default(''),
    journeyIds: array()
      .of(string().required())
      .required()
      .default([])
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
  onClose
}: UseCollectionFormParams): UseCollectionFormResult {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [templateGalleryPageCreate] = useTemplateGalleryPageCreateMutation()
  const [templateGalleryPageUpdate] = useTemplateGalleryPageUpdateMutation()

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
      mediaUrl: collection?.mediaUrl ?? '',
      slug: collection?.slug ?? '',
      journeyIds: collection?.templates.map((tpl) => tpl.id) ?? []
    }),
    [collection]
  )

  const schema = useMemo(() => buildSchema(t), [t])

  const isPublished =
    collection?.status === TemplateGalleryPageStatus.published

  // Synchronous double-submit guard. Formik's `isSubmitting` flips
  // through React state, so a sub-frame second click can squeeze through
  // before the LoadingButton renders disabled. A ref flips inside the
  // same JS tick that fires the mutation, so the second invocation
  // returns immediately.
  const submittingRef = useRef(false)

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
          input.description =
            values.description === '' ? null : values.description
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
        const initialIds = collection.templates
          .map((tpl) => tpl.id)
          .join(',')
        const nextIds = values.journeyIds.join(',')
        if (initialIds !== nextIds) {
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
        error instanceof Error
          ? error.message
          : t("Couldn't save collection"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      submittingRef.current = false
    }
  }

  return { initialValues, schema, isPublished, handleSubmit }
}
