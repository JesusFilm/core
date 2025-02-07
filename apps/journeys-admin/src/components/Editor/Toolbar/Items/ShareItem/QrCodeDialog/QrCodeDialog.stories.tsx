import { MockedResponse } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentPropsWithoutRef } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey as Journey } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'
import { GetUserRole } from '@core/journeys/ui/useUserRoleQuery/__generated__/GetUserRole'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  GetJourneyQrCodes,
  GetJourneyQrCodesVariables
} from '../../../../../../../__generated__/GetJourneyQrCodes'
import { Role } from '../../../../../../../__generated__/globalTypes'
import { QrCodeFields } from '../../../../../../../__generated__/QrCodeFields'

import { GET_JOURNEY_QR_CODES, QrCodeDialog } from './QrCodeDialog'

const meta: Meta<typeof QrCodeDialog> = {
  ...journeysAdminConfig,
  component: QrCodeDialog,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey = {
  id: 'journey.id',
  team: {
    id: 'team.id'
  }
} as unknown as Journey
const qrCode: QrCodeFields = {
  __typename: 'QrCode',
  id: 'qrCode.id',
  toJourneyId: 'journey.id',
  shortLink: {
    __typename: 'ShortLink',
    id: 'shortLink.id',
    domain: {
      __typename: 'ShortLinkDomain',
      hostname: 'localhost'
    },
    pathname: 'path',
    to: 'http://localhost:4100/journeySlug?utm_source=ns-qr-code&utm_campaign=$shortLink.id'
  }
}
const getUserRoleMock: MockedResponse<GetUserRole> = {
  request: {
    query: GET_USER_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: 'user.id',
        roles: [Role.publisher]
      }
    }
  }
}
const getJourneyQrCodesMock: MockedResponse<
  GetJourneyQrCodes,
  GetJourneyQrCodesVariables
> = {
  request: {
    query: GET_JOURNEY_QR_CODES,
    variables: {
      where: {
        journeyId: 'journey.id'
      }
    }
  },
  result: {
    data: {
      qrCodes: [qrCode]
    }
  }
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof QrCodeDialog>> = {
  render: ({ ...args }) => {
    return (
      <JourneyProvider value={{ journey }}>
        <QrCodeDialog {...args} />
      </JourneyProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    onClose: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getUserRoleMock]
    }
  }
}

export const WithQRCode = {
  ...Template,
  args: {
    open: true,
    onClose: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getUserRoleMock, getJourneyQrCodesMock]
    }
  }
}

export default meta
