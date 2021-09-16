import { Story, Meta } from '@storybook/react'
import SignUp, { SignUpProps } from './SignUp'

const Demo = {
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

const Template: Story<SignUpProps> = ({ ...props }) => <SignUp {...props} />

// TODO: Awaiting on final designs
export const Default = Template.bind({})
Default.args = {
  heading: 'Sign Up',
  description: 'Lorem ipsum dolor sit amet.'
}

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

export default Demo as Meta
