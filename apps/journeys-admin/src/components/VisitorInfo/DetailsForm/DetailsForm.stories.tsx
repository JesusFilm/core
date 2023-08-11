import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../libs/storybook'

import {
  getVisitorMock,
  getVisitorUnfilledMock,
  visitorUpdateMock
} from './DetailsFormData'

import { DetailsForm } from '.'

const VisitorDetailFormDemo = {
  ...simpleComponentConfig,
  component: DetailsForm,
  title: 'Journeys-Admin/VisitorInfo/DetailsForm'
}

const Template: Story<ComponentProps<typeof DetailsForm>> = ({ ...args }) => (
  <Stack spacing={2}>
    <Typography variant="h5">Filled</Typography>
    <MockedProvider mocks={[getVisitorMock, visitorUpdateMock]}>
      <DetailsForm {...args} />
    </MockedProvider>
    <Typography variant="h5" sx={{ pt: 2 }}>
      Unfilled
    </Typography>
    <MockedProvider mocks={[getVisitorUnfilledMock]}>
      <DetailsForm {...args} />
    </MockedProvider>
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  id: 'visitorId'
}

export default VisitorDetailFormDemo as Meta
