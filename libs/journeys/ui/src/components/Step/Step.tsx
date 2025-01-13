import { gql, useMutation } from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { NextSeo } from 'next-seo'
import { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { StepViewEventCreateInput } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider/JourneyProvider'
import { JourneyPlausibleEvents, keyify } from '../../libs/plausibleHelpers'
// eslint-disable-next-line import/no-cycle
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
  const { variant, journey } = useJourney()
  const { treeBlocks } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')

  const activeJourneyStep =
    (variant === 'default' || variant === 'embed') &&
    isActiveBlockOrDescendant(blockId)

  const heading = getStepHeading(blockId, children, treeBlocks, t)

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
        const search =
          window.location.search === '' || window.location.search == null
            ? ''
            : `/${window.location.search}`
        const key = keyify({
          stepId: input.blockId,
          event: 'pageview',
          blockId: input.blockId
        })
        plausible('pageview', {
          u: `${window.location.origin}/${journey.id}/${blockId}${search}`,
          props: {
            ...input,
            key,
            simpleKey: key
          }
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
    variant,
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
