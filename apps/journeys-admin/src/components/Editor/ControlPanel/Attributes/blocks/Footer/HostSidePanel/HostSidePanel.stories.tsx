import { MockedProvider } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, Story } from '@storybook/react'
import { userEvent, waitFor, within } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { GET_ALL_TEAM_HOSTS, HostSidePanel } from './HostSidePanel'

const Demo = {
  ...journeysAdminConfig,
  component: HostSidePanel,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer/HostSidePanel'
}

const defaultHost = {
  id: 'hostId',
  __typename: 'Host' as const,
  teamId: 'teamId',
  title: 'Cru International',
  location: null,
  src1: null,
  src2: null
}

const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  seoTitle: 'My awesome journey',
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'Translation'
      }
    ]
  },
  team: { __typename: 'Team', id: 'teamId', title: 'My Team' },
  host: defaultHost
} as unknown as Journey

const Template: Story<ComponentProps<typeof HostSidePanel>> = ({ ...args }) => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_ALL_TEAM_HOSTS,
            variables: { teamId: journey?.team?.id }
          },
          result: {
            data: {
              hosts: [
                {
                  id: '1',
                  location: '',
                  src1: null,
                  src2: null,
                  title: `John "The Rock" Geronimo`
                },
                {
                  id: '2',
                  location: 'Auckland, New Zealand',
                  src1: null,
                  src2: null,
                  title: 'Jian Wei'
                },
                {
                  id: '3',
                  location: 'Auckland, New Zealand',
                  src1: null,
                  src2: 'https://tinyurl.com/4b3327yn',
                  title: 'Nisal Cottingham'
                },
                {
                  id: '4',
                  location: 'Tokyo, Japan',
                  src1: 'https://tinyurl.com/3bxusmyb',
                  src2: 'https://tinyurl.com/mr4a78kb',
                  title: 'John G & Siyang C'
                }
              ]
            }
          }
        }
      ]}
    >
      <ThemeProvider>
        <JourneyProvider value={{ ...args, variant: 'admin' }}>
          <HostSidePanel />
        </JourneyProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

// Default side panels based on host availability
export const Default = Template.bind({})
Default.args = {
  journey: { ...journey, host: null }
}

export const EditHost = Template.bind({})
EditHost.args = {
  journey
}

// Popup side panels
export const SelectHost = Template.bind({})
SelectHost.args = {
  journey: { ...journey, host: null }
}
SelectHost.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  expect(
    canvas.getByRole('button', { name: 'Select a Host' })
  ).toBeInTheDocument()
  userEvent.click(canvas.getByRole('button', { name: 'Select a Host' }))
  await waitFor(() => {
    expect(canvas.getAllByText('Authors')).toHaveLength(2)
  })
}

export const CreateHost = Template.bind({})
CreateHost.args = {
  journey: { ...journey, host: null }
}
CreateHost.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  expect(
    canvas.getByRole('button', { name: 'Select a Host' })
  ).toBeInTheDocument()
  userEvent.click(canvas.getByRole('button', { name: 'Select a Host' }))
  expect(canvas.getByRole('button', { name: 'Create New' })).toBeInTheDocument()
  userEvent.click(canvas.getByRole('button', { name: 'Create New' }))
  await waitFor(() => {
    expect(canvas.getAllByText('Create Author')).toHaveLength(2)
  })
}

export const Info = Template.bind({})
Info.args = {
  journey: { ...journey, host: null }
}
Info.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  expect(
    canvas.getByRole('button', { name: 'Select a Host' })
  ).toBeInTheDocument()
  userEvent.click(canvas.getByRole('button', { name: 'Select a Host' }))
  expect(canvas.getAllByTestId('info')[0]).toBeInTheDocument()
  userEvent.click(canvas.getAllByTestId('info')[0])
  await waitFor(() => {
    expect(canvas.getByText('Information')).toBeInTheDocument()
  })
}

export default Demo as Meta
