import { ActionFieldsFragment } from '../action/__generated__/actionFields'
import { JourneyFieldsFragment } from '../JourneyProvider/__generated__/journeyFields'

export function getNextStepSlug(
  journey?: Pick<JourneyFieldsFragment, 'slug' | 'blocks' | 'website'>,
  action?: ActionFieldsFragment | null
): string | undefined {
  if (
    journey == null ||
    journey.website !== true ||
    action == null ||
    action.__typename !== 'NavigateToBlockAction'
  )
    return undefined

  const nextStep = journey.blocks?.find((block) => block.id === action.blockId)
  if (nextStep == null || nextStep.__typename !== 'StepBlock') return undefined

  return `/${journey.slug}/${nextStep.slug ?? nextStep.id}`
}
