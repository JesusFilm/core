import { Story, Meta } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../PageWrapper'
import { MultipleSummaryReport } from '.'

const MultipleSummaryReportDemo = {
  ...journeysAdminConfig,
  component: MultipleSummaryReport,
  title: 'Journeys-Admin/MultipleSummaryReport'
}

const Template: Story = () => (
  <ApolloLoadingProvider>
    <PageWrapper title="Journeys">
      <SnackbarProvider>
        <MultipleSummaryReport />
      </SnackbarProvider>
    </PageWrapper>
  </ApolloLoadingProvider>
)

export const Default = Template.bind({})

export default MultipleSummaryReportDemo as Meta
