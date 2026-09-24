import { CombinedGraphQLErrors } from '@apollo/client'
import { FormikHelpers } from 'formik'
import { TFunction } from 'i18next'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useMemo, useRef, useState } from 'react'
import { ObjectSchema, array, mixed, object, string } from 'yup'

import { TEMPLATE_GALLERY_SLUG_RE } from '@core/journeys/ui/templateGallerySlug'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignStatus,
  CampaignUpdateInput
} from '../../../../__generated__/globalTypes'
import { useCampaignPublishMutation } from '../../../libs/useCampaignPublishMutation'
import { useCampaignUnpublishMutation } from '../../../libs/useCampaignUnpublishMutation'
import { useCampaignUpdateMutation } from '../../../libs/useCampaignUpdateMutation'
import {
  CollectionMediaValues,
  collectionMediaToFormValues,
  formMediaToInput,
  mediaDirty as mediaDiffers
} from '../../TemplateGalleryPageList/CollectionDialog/useCollectionForm/collectionMedia'
import {
  mediaErrorMessage,
  mediaErrorReason
} from '../../TemplateGalleryPageList/CollectionDialog/useCollectionForm/mediaErrorMessage'

export interface CampaignFormValues {
  title: string
  eyebrow: string
  tagline: string
  description: string
  slug: string
  backgroundImageSrc: string
  backgroundImageAlt: string
  media: CollectionMediaValues
  shareJourneyIds: string[]
  templateJourneyIds: string[]
}

export type CampaignSubmitIntent = 'save' | 'publish'

export interface UseCampaignFormResult {
  initialValues: CampaignFormValues
  schema: ObjectSchema<CampaignFormValues>
  isPublished: boolean
  handleSubmit: (
    values: CampaignFormValues,
    helpers: FormikHelpers<CampaignFormValues>
  ) => Promise<void>
  /** Set before `submitForm` by the Publish button; resets to 'save' after every submit. */
  setSubmitIntent: (intent: CampaignSubmitIntent) => void
  handleUnpublish: () => Promise<void>
  isUnpublishing: boolean
  /** True when any field (including media) differs from the saved campaign. */
  isDirty: (values: CampaignFormValues) => boolean
}

const FIELD_ERROR_KEYS = new Set([
  'slug',
  'title',
  'backgroundImageSrc',
  'media',
  'shareJourneyIds',
  'templateJourneyIds'
])

function isHttpsUrl(value: string | undefined): boolean {
  if (value == null || value === '') return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function buildSchema(t: TFunction): ObjectSchema<CampaignFormValues> {
  return object({
    title: string()
      .required(t('Title is required'))
      .max(100, t('Max 100 characters')),
    eyebrow: string().max(80, t('Max 80 characters')).default(''),
    tagline: string().max(160, t('Max 160 characters')).default(''),
    description: string().default(''),
    slug: string()
      .max(200, t('Max 200 characters'))
      .matches(TEMPLATE_GALLERY_SLUG_RE, {
        message: t('Use lowercase letters, numbers, and hyphens only'),
        excludeEmptyString: true
      })
      .default(''),
    backgroundImageSrc: string()
      .default('')
      .test('https', t('Must be a https link'), isHttpsUrl),
    backgroundImageAlt: string().max(200, t('Max 200 characters')).default(''),
    media: mixed<CollectionMediaValues>().required(),
    shareJourneyIds: array().of(string().required()).required().default([]),
    templateJourneyIds: array().of(string().required()).required().default([])
  })
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

/**
 * Owns the builder's schema, initial values and submit handler: diffs the
 * form against the saved campaign, sends only changed fields to
 * `campaignUpdate`, optionally publishes afterwards, and maps field-scoped
 * GraphQL errors back onto Formik fields. Mirrors the Collections dialog's
 * `useCollectionForm` (edit mode only — creation happens in the list).
 */
export function useCampaignForm({
  campaign
}: {
  campaign: Campaign
}): UseCampaignFormResult {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [campaignUpdate] = useCampaignUpdateMutation()
  const [campaignPublish] = useCampaignPublishMutation()
  const [campaignUnpublish] = useCampaignUnpublishMutation()
  const [isUnpublishing, setUnpublishing] = useState(false)

  const persistedMedia = useMemo(
    () => collectionMediaToFormValues(campaign.media),
    [campaign.media]
  )

  const initialValues = useMemo<CampaignFormValues>(
    () => ({
      title: campaign.title,
      eyebrow: campaign.eyebrow ?? '',
      tagline: campaign.tagline ?? '',
      description: campaign.description,
      slug: campaign.slug,
      backgroundImageSrc: campaign.backgroundImageSrc ?? '',
      backgroundImageAlt: campaign.backgroundImageAlt ?? '',
      media: persistedMedia,
      shareJourneyIds: campaign.shareJourneys.map((journey) => journey.id),
      templateJourneyIds: campaign.templateJourneys.map((journey) => journey.id)
    }),
    [campaign, persistedMedia]
  )

  const schema = useMemo(() => buildSchema(t), [t])
  const isPublished = campaign.status === CampaignStatus.published

  const submittingRef = useRef(false)
  const submitIntentRef = useRef<CampaignSubmitIntent>('save')

  function buildInput(values: CampaignFormValues): CampaignUpdateInput {
    const input: CampaignUpdateInput = {}
    if (values.title !== initialValues.title) input.title = values.title
    if (values.eyebrow !== initialValues.eyebrow) {
      input.eyebrow = values.eyebrow === '' ? null : values.eyebrow
    }
    if (values.tagline !== initialValues.tagline) {
      input.tagline = values.tagline === '' ? null : values.tagline
    }
    if (values.description !== initialValues.description) {
      input.description = values.description
    }
    // An emptied slug means "leave it alone" — the server generated one and
    // an empty slug would break the public link.
    if (values.slug !== initialValues.slug && values.slug !== '') {
      input.slug = values.slug
    }
    if (values.backgroundImageSrc !== initialValues.backgroundImageSrc) {
      input.backgroundImageSrc =
        values.backgroundImageSrc === '' ? null : values.backgroundImageSrc
    }
    if (values.backgroundImageAlt !== initialValues.backgroundImageAlt) {
      input.backgroundImageAlt =
        values.backgroundImageAlt === '' ? null : values.backgroundImageAlt
    }
    if (mediaDiffers(values.media, persistedMedia)) {
      input.media = formMediaToInput(values.media, persistedMedia)
    }
    if (!sameIds(values.shareJourneyIds, initialValues.shareJourneyIds)) {
      input.shareJourneyIds = values.shareJourneyIds
    }
    if (!sameIds(values.templateJourneyIds, initialValues.templateJourneyIds)) {
      input.templateJourneyIds = values.templateJourneyIds
    }
    return input
  }

  async function handleSubmit(
    values: CampaignFormValues,
    helpers: FormikHelpers<CampaignFormValues>
  ): Promise<void> {
    const intent = submitIntentRef.current
    submitIntentRef.current = 'save'
    if (submittingRef.current) return
    submittingRef.current = true
    try {
      const input = buildInput(values)
      if (Object.keys(input).length > 0) {
        await campaignUpdate({ variables: { id: campaign.id, input } })
        if (intent !== 'publish') {
          enqueueSnackbar(t('Campaign saved'), {
            variant: 'success',
            preventDuplicate: true
          })
        }
      }
      if (intent === 'publish') {
        const { data } = await campaignPublish({
          variables: { id: campaign.id }
        })
        if (data?.campaignPublish == null) {
          enqueueSnackbar(t("Couldn't publish campaign"), {
            variant: 'error',
            preventDuplicate: true
          })
          return
        }
        enqueueSnackbar(t('Campaign published'), {
          variant: 'success',
          preventDuplicate: true
        })
      }
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        const reason = mediaErrorReason(error)
        if (reason != null) {
          await helpers.setFieldTouched('media', true, false)
          helpers.setFieldError('media', mediaErrorMessage(reason, t))
          return
        }
        const fieldErrorSource = error.errors.find(
          (e) =>
            typeof e.extensions?.field === 'string' &&
            FIELD_ERROR_KEYS.has(e.extensions.field)
        )
        const field = fieldErrorSource?.extensions?.field as string | undefined
        if (field != null) {
          await helpers.setFieldTouched(field, true, false)
          helpers.setFieldError(
            field,
            fieldErrorSource?.message !== undefined &&
              fieldErrorSource.message !== ''
              ? fieldErrorSource.message
              : error.message
          )
          return
        }
      }
      enqueueSnackbar(
        error instanceof Error ? error.message : t("Couldn't save campaign"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      submittingRef.current = false
    }
  }

  async function handleUnpublish(): Promise<void> {
    if (!isPublished || submittingRef.current) return
    submittingRef.current = true
    setUnpublishing(true)
    try {
      const { data } = await campaignUnpublish({
        variables: { id: campaign.id }
      })
      if (data?.campaignUnpublish == null) {
        enqueueSnackbar(t("Couldn't unpublish campaign"), {
          variant: 'error',
          preventDuplicate: true
        })
        return
      }
      enqueueSnackbar(t('Campaign unpublished'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t("Couldn't unpublish campaign"),
        { variant: 'error', preventDuplicate: true }
      )
    } finally {
      submittingRef.current = false
      setUnpublishing(false)
    }
  }

  function isDirty(values: CampaignFormValues): boolean {
    return Object.keys(buildInput(values)).length > 0
  }

  return {
    initialValues,
    schema,
    isPublished,
    handleSubmit,
    setSubmitIntent: (intent) => {
      submitIntentRef.current = intent
    },
    handleUnpublish,
    isUnpublishing,
    isDirty
  }
}
