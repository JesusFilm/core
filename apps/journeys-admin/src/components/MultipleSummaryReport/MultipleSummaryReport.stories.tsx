import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { journeysAdminConfig } from '../../libs/storybook'

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
