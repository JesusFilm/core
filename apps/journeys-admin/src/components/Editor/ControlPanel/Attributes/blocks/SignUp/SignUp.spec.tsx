import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { SignUp } from '.'

describe('SignUp Attributes', () => {
  it('shows default attributes', () => {
    const block: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: null,
      parentOrder: 0,
      submitLabel: null,
      action: null,
      submitIcon: null,
      children: []
    }

    const { getByRole } = render(<SignUp {...block} />)
    expect(getByRole('button', { name: 'Action None' })).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon None' })
    ).toBeInTheDocument()
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      submitLabel: 'Sign Up',
      action: {
        __typename: 'LinkAction',
        gtmEventName: 'signup',
        url: 'https://www.google.com'
      },
      submitIcon: {
        __typename: 'Icon',
        name: IconName.ArrowForwardRounded,
        color: IconColor.action,
        size: IconSize.lg
      },
      children: []
    }

    const { getByRole } = render(<SignUp {...block} />)
    expect(
      getByRole('button', { name: 'Action LinkAction' })
    ).toBeInTheDocument()
    expect(
      getByRole('button', { name: 'Button Icon ArrowForwardRounded' })
    ).toBeInTheDocument()
  })
})
