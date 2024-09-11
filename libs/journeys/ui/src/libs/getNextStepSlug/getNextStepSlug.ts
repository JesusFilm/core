import { ActionFields } from '../action/__generated__/ActionFields'
import { JourneyFields } from '../JourneyProvider/__generated__/JourneyFields'

export function getNextStepSlug(
  journey?: Pick<JourneyFields, 'slug' | 'blocks' | 'website'>,
  action?: ActionFields | null
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
