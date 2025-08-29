import { MockedResponse } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { expect, screen, waitFor } from 'storybook/test'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetPlausibleJourneyQrCodeScans,
  GetPlausibleJourneyQrCodeScansVariables
} from '../../../../../../../../__generated__/GetPlausibleJourneyQrCodeScans'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'

import { GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS, ScanCount } from './ScanCount'

const meta: Meta<typeof ScanCount> = {
  ...journeysAdminConfig,
  component: ScanCount,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/ScanCount',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}
const getPlausibleJourneyQrCodeScansMock: MockedResponse<
  GetPlausibleJourneyQrCodeScans,
  GetPlausibleJourneyQrCodeScansVariables
> = {
  request: {
    query: GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS
  },
  variableMatcher: (variables) => true,
  result: {
    data: {
      journeysPlausibleStatsAggregate: {
        __typename: 'PlausibleStatsAggregateResponse',
        visitors: {
          __typename: 'PlausibleStatsAggregateValue',
          value: 1
        }
      }
    }
  }
}

const journey = {
  id: 'journey.id'
} as unknown as Journey

type Story = StoryObj<ComponentProps<typeof ScanCount>>

const Template: Story = {
  render: ({ ...args }) => (
    <JourneyProvider value={{ journey }}>
      <ScanCount {...args} />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    shortLinkId: 'shortLink.id'
  },
  parameters: {
    apolloClient: {
      mocks: [getPlausibleJourneyQrCodeScansMock]
    }
  },
  play: async () => {
    await waitFor(async () => {
      await expect(screen.getByText('1 scan')).toBeInTheDocument()
    })
  }
}

export const Loading = {
  ...Template
}

export default meta
