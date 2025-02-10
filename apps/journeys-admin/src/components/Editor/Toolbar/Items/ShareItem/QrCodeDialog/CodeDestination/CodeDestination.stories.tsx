import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { QrCodeFields as QrCode } from '../../../../../../../../__generated__/QrCodeFields'

import { CodeDestination } from './CodeDestination'

const meta: Meta<typeof CodeDestination> = {
  ...journeysAdminConfig,
  component: CodeDestination,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeDestination',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const qrCode: QrCode = {
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
    pathname: 'shortId',
    to: 'destinationUrl'
  }
}

const to = 'http://localhost:4000/destinationUrl'

const Template: StoryObj<typeof CodeDestination> = {
  render: ({ ...args }) => <CodeDestination {...args} />
}

export const Default = {
  ...Template,
  args: {
    journeyId: 'journey.id',
    qrCode,
    to,
    handleUpdateTo: noop
  }
}

export const NoDestination = {
  ...Template,
  args: {
    journeyId: 'journey.id',
    qrCode,
    to: null,
    handleUpdateTo: noop
  }
}

export default meta
