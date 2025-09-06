import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'
import { screen, userEvent } from 'storybook/test'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { GetRole } from '../../../../../__generated__/GetRole'
import { JourneyStatus, Role } from '../../../../../__generated__/globalTypes'

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

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof Menu> & { template: boolean }
> = {
  render: ({ template }) => {
    return (
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
  parameters: {
    apolloClient: {
      mocks: [getUserRoleMock]
    }
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
