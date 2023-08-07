import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'

import { MultipleSummaryReport } from '.'

const MultipleSummaryReportDemo = {
  ...journeysAdminConfig,
  component: MultipleSummaryReport,
  title: 'Journeys-Admin/MultipleSummaryReport'
}

const Template: Story = () => (
  <ApolloLoadingProvider>
    <SnackbarProvider>
      <MultipleSummaryReport />
    </SnackbarProvider>
  </ApolloLoadingProvider>
)

export const Default = Template.bind({})

export default MultipleSummaryReportDemo as Meta
