import { ApolloError, gql, useMutation } from '@apollo/client'
import { Form, Formik } from 'formik'
import omit from 'lodash/omit'
import { useSnackbar } from 'notistack'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { JourneyUpdateInput } from '../../../../../__generated__/globalTypes'
import { JourneyFeature } from '../../../../../__generated__/JourneyFeature'
import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'

export const JOURNEY_FEATURE_UPDATE = gql`
  mutation JourneyFeature($id: ID!, $feature: Boolean!) {
    journeyFeature(id: $id, feature: $feature) {
      id
      featuredAt
    }
  }
`

export interface TemplateSettingsFormValues extends JourneyUpdateInput {
  featured: boolean
}

interface TemplateSettingsFormProp {
  onSubmit?: () => void
  children: ReactNode
}

export function TemplateSettingsForm({
  onSubmit,
  children
}: TemplateSettingsFormProp): ReactElement {
  const { t } = useTranslation()
  const { journey } = useJourney()
  const [journeySettingsUpdate] = useJourneyUpdateMutation()
  const [journeyFeature] = useMutation<JourneyFeature>(JOURNEY_FEATURE_UPDATE)
  const { enqueueSnackbar } = useSnackbar()
  async function handleSubmit(
    values: TemplateSettingsFormValues
  ): Promise<void> {
    if (journey == null) return

    try {
      await journeySettingsUpdate({
        variables: {
          id: journey.id,
          input: omit(values, 'featured')
        }
      })
      if (Boolean(journey.featuredAt) !== values.featured)
        await journeyFeature({
          variables: { id: journey.id, feature: values.featured }
        })
      enqueueSnackbar(t('Template settings have been saved'), {
        variant: 'success',
        preventDuplicate: true
      })
      onSubmit?.()
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            'Field update failed. Reload the page or try again.',
            {
              variant: 'error',
              preventDuplicate: true
            }
          )
          return
        }
      }
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  const validationSchema = object({
    strategySlug: string()
      .trim()
      .nullable()
      .test('valid-embed-url', t('Invalid embed link'), (value) => {
        if (value == null) return true
        const canvaRegex =
          /^https:\/\/www\.canva\.com\/design\/[A-Za-z0-9]+\/(view|watch)$/

        const googleSlidesRegex =
          /^https:\/\/docs\.google\.com\/presentation\/d\/e\/[A-Za-z0-9-_]+\/pub\?(start=true|start=false)&(loop=true|loop=false)&delayms=\d+$/

        const isValidCanvaLink = canvaRegex.test(value)
        const isValidGoogleLink = googleSlidesRegex.test(value)
        if (!isValidCanvaLink && !isValidGoogleLink) {
          return false
        }
        return true
      })
  })

  const initialValues: TemplateSettingsFormValues = {
    title: journey?.title,
    description: journey?.description,
    featured: journey?.featuredAt != null,
    strategySlug: journey?.strategySlug,
    tagIds: journey?.tags.map(({ id }) => id)
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      enableReinitialize
    >
      <Form>{children}</Form>
    </Formik>
  )
}
