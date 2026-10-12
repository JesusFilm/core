import {
  CampaignSectionStyleInput,
  CampaignStyledBlock,
  useCampaignSectionStyleMutation
} from '../../../../libs/useCampaignSectionStyleMutation'
import { previousOf, useCampaignStyleCommand } from '../useCampaignStyleCommand'

export interface CampaignSectionStyleCommand {
  /** Write any of the nine shared section fields of a section or chrome block as one Command. */
  addSectionStyle: (
    block: CampaignStyledBlock,
    input: CampaignSectionStyleInput
  ) => void
  error?: string
  clearError: () => void
}

/**
 * The Style panel's Command: choosing a background kind, committing a custom
 * colour or setting / clearing one of the five overrides each writes through
 * the section type's own update mutation, optimistically; undo writes the
 * previous values of the same fields back.
 */
export function useCampaignSectionStyleCommand(): CampaignSectionStyleCommand {
  const { addStyle, error, clearError } = useCampaignStyleCommand()
  const mutate = useCampaignSectionStyleMutation()

  function addSectionStyle(
    block: CampaignStyledBlock,
    input: CampaignSectionStyleInput
  ): void {
    addStyle({
      block,
      input,
      previous: previousOf(block, input),
      run: mutate
    })
  }

  return { addSectionStyle, error, clearError }
}
