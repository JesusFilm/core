import { Meta, StoryObj } from '@storybook/nextjs'
import { SnackbarProvider } from 'notistack'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'

import { MultipleSummaryReport } from '.'

const MultipleSummaryReportDemo: Meta<typeof MultipleSummaryReport> = {
  ...journeysAdminConfig,
  component: MultipleSummaryReport,
  title: 'Journeys-Admin/MultipleSummaryReport'
}

const Template: StoryObj<typeof MultipleSummaryReport> = {
  render: () => (
    <ApolloLoadingProvider>
      <SnackbarProvider>
        <MultipleSummaryReport />
      </SnackbarProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = { ...Template }

export default MultipleSummaryReportDemo
