import { render } from '@testing-library/react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourneyForEdit_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
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
      submitLabel: null,
      action: null,
      submitIcon: null,
      children: []
    }

    const { getAllByText } = render(<SignUp {...block} />)
    expect(getAllByText('None')).toHaveLength(3)
  })

  it('shows filled attributes', () => {
    const block: TreeBlock<SignUpBlock> = {
      id: 'signup.id',
      __typename: 'SignUpBlock',
      parentBlockId: 'step1.id',
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

    const { getByText } = render(<SignUp {...block} />)
    expect(getByText('Sign Up')).toBeInTheDocument()
    expect(getByText('LinkAction')).toBeInTheDocument()
    expect(getByText('ArrowForwardRounded')).toBeInTheDocument()
  })
})
