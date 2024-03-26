import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { GetRole } from '../../../../../__generated__/GetRole'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { GET_ROLE } from './Menu'

import { Menu } from '.'

const Demo: Meta<typeof Menu> = {
  ...journeysAdminConfig,
  component: Menu,
  title: 'Journeys-Admin/Editor/Toolbar/Menu'
}

const getUserRoleMock: MockedResponse<GetRole> = {
  request: {
    query: GET_ROLE
  },
  result: {
    data: {
      getUserRole: {
        __typename: 'UserRole',
        id: '1',
        userId: 'userId',
        roles: [Role.publisher]
      }
    }
  }
}

const Template: StoryObj<typeof Menu> = {
  render: ({ mocks, template }) => {
    return (
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{
            journey: {
              status: JourneyStatus.draft,
              tags: [],
              template
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider>
            <Menu />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
  }
}

export const Publisher = {
  ...Template,
  args: {
    mocks: [getUserRoleMock]
  },
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
  }
}

export const TemplateMenu = {
  ...Template,
  args: {
    template: true
  },
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
  }
}

export default Demo
