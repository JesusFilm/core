import { Typography } from '@mui/material'
import { Story, Meta } from '@storybook/react'
import { journeysConfig } from '../../../libs/storybook/decorators'
import SignUp, { SignUpProps } from './SignUp'

const Demo = {
  ...journeysConfig,
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

const Template: Story<SignUpProps> = ({ ...props }) => (
  <>
    <div style={{ marginBottom: '32px' }}>
      <Typography variant="h1">Sign up</Typography>
    </div>
    <SignUp {...props} />
  </>
)

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
