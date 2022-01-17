import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourneyForEdit_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
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
      label: 'Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIcon: null,
      endIcon: null,
      action: null,
      children: []
    }
    const { getAllByText, getByText } = render(<Button {...block} />)
    expect(getAllByText('None')).toHaveLength(3)
    expect(getByText('Medium')).toBeInTheDocument()
    expect(getByText('Primary')).toBeInTheDocument()
    expect(getByText('Text')).toBeInTheDocument()
  })

  it('shows filled button', () => {
    const block: TreeBlock<ButtonBlock> = {
      id: 'button.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      label: 'Button',
      buttonVariant: ButtonVariant.text,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIcon: {
        __typename: 'Icon',
        name: IconName.ChatBubbleOutlineRounded,
        color: IconColor.secondary,
        size: IconSize.lg
      },
      endIcon: {
        __typename: 'Icon',
        name: IconName.ChevronRightRounded,
        color: IconColor.secondary,
        size: IconSize.lg
      },
      action: {
        __typename: 'NavigateToBlockAction',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: []
    }
    const { getByText } = render(<Button {...block} />)
    expect(getByText('Large')).toBeInTheDocument()
    expect(getByText('ChatBubbleOutlineRounded')).toBeInTheDocument()
    expect(getByText('ChevronRightRounded')).toBeInTheDocument()
    expect(getByText('Secondary')).toBeInTheDocument()
    expect(getByText('Button')).toBeInTheDocument()
    expect(getByText('Text')).toBeInTheDocument()
    expect(getByText('NavigateToBlockAction')).toBeInTheDocument()
  })
})
