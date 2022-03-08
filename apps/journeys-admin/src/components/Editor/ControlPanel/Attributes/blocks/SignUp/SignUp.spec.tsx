import { fireEvent, render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { SignUp } from '.'

describe('SignUp Attributes', () => {
  const block: TreeBlock<SignUpBlock> = {
    id: 'signup.id',
    __typename: 'SignUpBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    submitLabel: 'Sign Up',
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'signup.id',
      gtmEventName: 'signup',
      url: 'https://www.google.com'
    },
    submitIconId: 'icon',
    children: [
      {
        id: 'icon',
        __typename: 'IconBlock',
        parentBlockId: 'button',
        parentOrder: 0,
        iconName: IconName.ArrowForwardRounded,
        iconColor: IconColor.action,
        iconSize: IconSize.lg,
        children: []
      }
    ]
  }
  it('shows default attributes', () => {
    const emptyBlock: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      action: null,
      submitIconId: null,
      children: []
    }

    const { getByRole } = render(<SignUp {...emptyBlock} />)
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const { getByRole } = render(<SignUp {...block} />)
    expect(
      getByRole('button', { name: 'Action LinkAction' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon Arrow Forward' })
    ).toBeInTheDocument()
  })

  it('should open icon editing drawer', () => {
    const { getByRole, getAllByText } = render(<SignUp {...block} />)
    fireEvent.click(getByRole('button', { name: 'Button Icon Arrow Forward' }))
    expect(getAllByText('Button Icon')).toHaveLength(2)
  })
})
