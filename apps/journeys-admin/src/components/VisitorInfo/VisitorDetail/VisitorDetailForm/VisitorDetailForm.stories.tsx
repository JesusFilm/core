import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../../libs/storybook'
import {
  getVisitorMock,
  getVisitorUnfilledMock,
  visitorUpdateMock
} from './VisitorDetailFormData'
import { VisitorDetailForm } from '.'

const VisitorDetailFormDemo = {
  ...simpleComponentConfig,
  component: VisitorDetailForm,
  title: 'Journeys-Admin/VisitorInfo/VisitorDetail/VisitorDetailForm'
}

const Template: Story<ComponentProps<typeof VisitorDetailForm>> = ({
  ...args
}) => (
  <Stack spacing={2}>
    <Typography variant="h5">Filled</Typography>
    <MockedProvider mocks={[getVisitorMock, visitorUpdateMock]}>
      <VisitorDetailForm {...args} />
    </MockedProvider>
    <Typography variant="h5" sx={{ pt: 2 }}>
      Unfilled
    </Typography>
    <MockedProvider mocks={[getVisitorUnfilledMock]}>
      <VisitorDetailForm {...args} />
    </MockedProvider>
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorDetailFormDemo as Meta
