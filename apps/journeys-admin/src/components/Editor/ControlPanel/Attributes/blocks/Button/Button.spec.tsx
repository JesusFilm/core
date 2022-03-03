import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { Button } from '.'

describe('Button attributes', () => {
  it('shows default button', () => {
    const block: TreeBlock<ButtonBlock> = {
      id: 'button.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }
    const { getByRole } = render(<Button {...block} />)
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Primary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Size Medium' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Variant Contained' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Leading Icon None' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Trailing Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled button', () => {
    const block: TreeBlock<ButtonBlock> = {
      id: 'button.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Button',
      buttonVariant: ButtonVariant.text,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIconId: 'icon1',
      endIconId: 'icon2',
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'button.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: [
        {
          id: 'icon1',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 0,
          iconName: IconName.ChatBubbleOutlineRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        },
        {
          id: 'icon2',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 1,
          iconName: IconName.ChevronRightRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        }
      ]
    }
    const { getByRole } = render(<Button {...block} />)
    expect(
      getByRole('button', { name: 'Action NavigateToBlockAction' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Color Secondary' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Size Large' })
    ).toBeInTheDocument()
    expect(getByRole('button', { name: 'Variant Text' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Leading Icon Chat Bubble' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Trailing Icon Chevron Right' })
    ).toBeInTheDocument()
  })
})
