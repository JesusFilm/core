import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { TypographyVariant } from '../../../../__generated__/globalTypes'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { Card } from '../Card'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import SignUp from './SignUp'

const children: TreeBlock[] = [
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: null,
    align: null,
    color: null,
    content: 'Sign up',
    variant: TypographyVariant.h1,
    children: []
  },
  {
    id: 'signUpBlockId1',
    __typename: 'SignupBlock',
    parentBlockId: null,
    action: {
      __typename: 'LinkAction',
      gtmEventName: 'signUp'
    },
    children: []
  }
]

const Demo = {
  ...journeysConfig,
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

const Template: Story<TreeBlock<CardBlock>> = ({ ...props }) => (
  <Card {...props} />
)

// TODO: Awaiting on final designs
export const Default = Template.bind({})
Default.args = {
  children
}

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

export default Demo as Meta
