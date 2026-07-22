import { gql, useMutation } from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import { useTranslation } from 'next-i18next/pages'
import { usePlausible } from 'next-plausible'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { StepViewEventCreateInput } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider/JourneyProvider'
import {
  JourneyPlausibleEvents,
  fireCaptureEvent,
  keyify,
  templateKeyify
} from '../../libs/plausibleHelpers'
// eslint-disable-next-line import/no-cycle
import { useGetValueFromJourneyCustomizationString } from '../../libs/useGetValueFromJourneyCustomizationString'
import { BlockRenderer, WrappersProps } from '../BlockRenderer'

import { StepFields } from './__generated__/StepFields'
import {
  StepViewEventCreate,
  StepViewEventCreateVariables
} from './__generated__/StepViewEventCreate'

export const STEP_VIEW_EVENT_CREATE = gql`
  mutation StepViewEventCreate($input: StepViewEventCreateInput!) {
    stepViewEventCreate(input: $input) {
      id
    }
  }
`

interface StepProps extends TreeBlock<StepFields> {
  wrappers?: WrappersProps
}

export function Step({
  id: blockId,
  children,
  wrappers
}: StepProps): ReactElement {
  const [stepViewEventCreate] = useMutation<
    StepViewEventCreate,
    StepViewEventCreateVariables
  >(STEP_VIEW_EVENT_CREATE)
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { renderMode, journey } = useJourney()
  const { treeBlocks } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')

  const activeJourneyStep =
    (renderMode === 'default' || renderMode === 'embed') &&
    isActiveBlockOrDescendant(blockId)

  const stepHeading = getStepHeading(blockId, children, treeBlocks, t)
  const heading = useGetValueFromJourneyCustomizationString(stepHeading)

  useEffect(() => {
    if (activeJourneyStep && wrappers === undefined) {
      const id = uuidv4()
      const input: StepViewEventCreateInput = {
        id,
        blockId,
        value: heading
      }
      void stepViewEventCreate({
        variables: {
          input
        }
      })
      if (journey != null) {
        // Append the query string directly (no leading slash). A leading slash
        // here produced a trailing-slash pathname (`.../{blockId}/?utm=...`),
        // which Plausible records as a separate page from `.../{blockId}`,
        // splitting a single step's traffic across two pages. See NES analytics
        // trailing-slash bug.
        const search =
          window.location.search === '' || window.location.search == null
            ? ''
            : window.location.search
        const key = keyify({
          stepId: input.blockId,
          event: 'pageview',
          blockId: input.blockId,
          journeyId: journey?.id
        })
        plausible('pageview', {
          u: `${window.location.origin}/${journey.id}/${blockId}${search}`,
          props: {
            ...input,
            key,
            simpleKey: key,
            templateKey: templateKeyify({
              event: 'pageview',
              journeyId: journey?.id
            })
          }
        })
        const eventLabel =
          children[0]?.__typename === 'CardBlock'
            ? children[0].eventLabel
            : null
        // Fire the registered Capture goal (e.g. christDecisionCapture) instead of
        // the raw event label so card conversions are counted in the Plausible
        // dashboard, matching how buttons/videos/radio questions report captures.
        fireCaptureEvent(plausible, eventLabel, {
          u: `${window.location.origin}/${journey.id}/${input.blockId}`,
          input,
          stepId: input.blockId,
          blockId: input.blockId,
          journeyId: journey?.id
        })
      }
      sendGTMEvent({
        event: 'step_view',
        eventId: id,
        blockId,
        stepName: heading
      })
    }
  }, [
    blockId,
    stepViewEventCreate,
    renderMode,
    heading,
    activeJourneyStep,
    wrappers,
    journey,
    plausible
  ])

  return (
    <>
      {activeJourneyStep &&
        (treeBlocks[0]?.id !== blockId ? (
          <NextSeo title={`${heading} (${journey?.title ?? ''})`} />
        ) : (
          <NextSeo title={`${journey?.title ?? ''} (${heading})`} />
        ))}
      {children.map((block) => (
        <BlockRenderer block={block} wrappers={wrappers} key={block.id} />
      ))}
    </>
  )
}
