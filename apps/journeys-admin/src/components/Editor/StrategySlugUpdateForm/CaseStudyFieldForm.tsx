import { ApolloError, gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { object, string } from 'yup'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { StrategySlugUpdate } from '../../../../__generated__/StrategySlugUpdate'
import { TextFieldForm } from '../../TextFieldForm'

export const STRATEGY_SLUG_UPDATE = gql`
  mutation StrategySlugUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      strategySlug
    }
  }
`

export function CaseStudyFieldForm(): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation()
  const [journeyUpdate] = useMutation<StrategySlugUpdate>(STRATEGY_SLUG_UPDATE)
  const { enqueueSnackbar } = useSnackbar()

  const strategySlugSchema = object({
    strategySlug: string()
      .trim()
      .test('valid-embed-url', t('Invalid URL'), (value) => {
        if (value == null) return true
        const canvaRegex =
          /^https:\/\/www\.canva\.com\/design\/[A-Za-z0-9]+\/view$/

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

  async function handleSubmit(src: string): Promise<void> {
    if (journey == null) return
    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { strategySlug: src === '' ? null : src }
        },
        onCompleted: () =>
          enqueueSnackbar(t('Embedded URL has been updated'), {
            variant: 'success',
            preventDuplicate: false
          })
      })
    } catch (error) {
      if (error instanceof ApolloError) {
        if (error.networkError != null) {
          enqueueSnackbar(
            t('Case Study update failed. Reload the page or try again.'),
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

  return (
    <TextFieldForm
      id="strategySlug"
      initialValue={journey?.strategySlug ?? ''}
      onSubmit={handleSubmit}
      validationSchema={strategySlugSchema}
      label={t('Paste URL here')}
      endIcon={<LinkAngled />}
    />
  )
}
