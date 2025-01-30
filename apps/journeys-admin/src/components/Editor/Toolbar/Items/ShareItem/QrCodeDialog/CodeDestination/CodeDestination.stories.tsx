import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ReactElement } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

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

const CodeDestinationComponent = ({ ...args }): ReactElement => {
  return (
    <CodeDestination
      to={args.to}
      handleChangeTo={noop}
      disabled={args.disabled}
    />
  )
}

const Template: StoryObj<typeof CodeDestination> = {
  render: ({ ...args }) => <CodeDestinationComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    to: 'https://example.com',
    disabled: false
  }
}

export const NoDestination = {
  ...Template,
  args: {
    to: '',
    disabled: true
  }
}

export default meta
