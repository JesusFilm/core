import {
  GetCampaign_campaign_blocks_CampaignButtonBlock as ButtonBlock,
  GetCampaign_campaign_blocks_CampaignTypographyBlock as TypographyBlock
} from '../../../../../__generated__/GetCampaign'
import {
  ButtonSize,
  ButtonVariant,
  TypographyAlign,
  TypographyVariant
} from '../../../../../__generated__/globalTypes'
import { useCampaignButtonBlockUpdateMutation } from '../../../../libs/useCampaignButtonBlockUpdateMutation'
import { useCampaignTypographyBlockUpdateMutation } from '../../../../libs/useCampaignTypographyBlockUpdateMutation'
import { previousOf, useCampaignStyleCommand } from '../useCampaignStyleCommand'

/** A text Extra's style fields as its update input takes them; null follows the section. */
export interface CampaignTextStyleInput {
  variant?: TypographyVariant | null
  align?: TypographyAlign | null
  color?: string | null
}

/** A button Extra's style fields as its update input takes them; null follows the section. */
export interface CampaignButtonStyleInput {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
  align?: TypographyAlign | null
  color?: string | null
  labelColor?: string | null
}

/** Input field → the aliased column the cache holds it under. */
const TEXT_COLUMNS = { variant: 'typographyVariant' } as const
const BUTTON_COLUMNS = { variant: 'buttonVariant' } as const

export function textStyleRow(
  block: TypographyBlock,
  input: CampaignTextStyleInput
): Pick<
  TypographyBlock,
  '__typename' | 'id' | 'typographyVariant' | 'align' | 'color'
> {
  return {
    __typename: 'CampaignTypographyBlock',
    id: block.id,
    typographyVariant:
      'variant' in input ? (input.variant ?? null) : block.typographyVariant,
    align: 'align' in input ? (input.align ?? null) : block.align,
    color: 'color' in input ? (input.color ?? null) : block.color
  }
}

export function buttonStyleRow(
  block: ButtonBlock,
  input: CampaignButtonStyleInput
): Pick<
  ButtonBlock,
  | '__typename'
  | 'id'
  | 'buttonVariant'
  | 'size'
  | 'align'
  | 'color'
  | 'labelColor'
> {
  return {
    __typename: 'CampaignButtonBlock',
    id: block.id,
    buttonVariant:
      'variant' in input ? (input.variant ?? null) : block.buttonVariant,
    size: 'size' in input ? (input.size ?? null) : block.size,
    align: 'align' in input ? (input.align ?? null) : block.align,
    color: 'color' in input ? (input.color ?? null) : block.color,
    labelColor:
      'labelColor' in input ? (input.labelColor ?? null) : block.labelColor
  }
}

export interface CampaignExtraStyleCommand {
  addTextStyle: (block: TypographyBlock, input: CampaignTextStyleInput) => void
  addButtonStyle: (block: ButtonBlock, input: CampaignButtonStyleInput) => void
  error?: string
  clearError: () => void
}

/**
 * The text and button bar controls' Command: size (the variant), align and
 * colour of a text Extra; variant, size and the two colours of a button
 * Extra. One Command per change through the Extra's own update mutation.
 */
export function useCampaignExtraStyleCommand(): CampaignExtraStyleCommand {
  const { addStyle, error, clearError } = useCampaignStyleCommand()
  const [typographyUpdate] = useCampaignTypographyBlockUpdateMutation()
  const [buttonUpdate] = useCampaignButtonBlockUpdateMutation()

  function addTextStyle(
    block: TypographyBlock,
    input: CampaignTextStyleInput
  ): void {
    addStyle({
      block,
      input,
      previous: previousOf(block, input, TEXT_COLUMNS),
      run: async (current, next) =>
        await typographyUpdate({
          variables: { id: current.id, input: next },
          optimisticResponse: {
            campaignTypographyBlockUpdate: textStyleRow(current, next)
          }
        })
    })
  }

  function addButtonStyle(
    block: ButtonBlock,
    input: CampaignButtonStyleInput
  ): void {
    addStyle({
      block,
      input,
      previous: previousOf(block, input, BUTTON_COLUMNS),
      run: async (current, next) =>
        await buttonUpdate({
          variables: { id: current.id, input: next },
          optimisticResponse: {
            campaignButtonBlockUpdate: buttonStyleRow(current, next)
          }
        })
    })
  }

  return { addTextStyle, addButtonStyle, error, clearError }
}
