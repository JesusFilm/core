import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../../../../../libs/storybook'
import { GET_ALL_TEAM_HOSTS, HostList } from './HostList'

const HostListDemo = {
  ...journeysAdminConfig,
  component: HostList,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/HostedBy/HostList',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const mocks = [
  {
    request: {
      query: GET_ALL_TEAM_HOSTS,
      variables: { teamId: 'jfp-team' }
    },
    result: {
      data: {
        hosts: [
          {
            id: '1',
            location: '',
            src1: 'https://tinyurl.com/3bxusmyb',
            src2: null,
            title: `John "The Rock" Geronimo`
          },
          {
            id: '2',
            location: 'Tokyo, Japan',
            src1: 'https://tinyurl.com/3bxusmyb',
            src2: 'https://tinyurl.com/mr4a78kb',
            title: 'John G & Siyang C'
          },
          {
            id: '3',
            location: 'Auckland, New Zealand',
            src1: null,
            src2: null,
            title: 'Jian Wei'
          },
          {
            id: '4',
            location: 'Auckland, New Zealand',
            src1: null,
            src2: 'https://tinyurl.com/4b3327yn',
            title: 'Nisal Cottingham'
          }
        ]
      }
    }
  }
]

const Template: Story<ComponentProps<typeof HostList>> = () => (
  <MockedProvider mocks={mocks}>
    <HostList />
  </MockedProvider>
)

export const Default = Template.bind({})

export default HostListDemo as Meta
