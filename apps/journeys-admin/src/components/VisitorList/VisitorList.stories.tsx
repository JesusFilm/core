import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { gql } from '@apollo/client'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { journeysAdminConfig } from '../../libs/storybook'
// import {
//   defaultTemplate,
//   oldTemplate,
//   descriptiveTemplate,
//   publishedTemplate
// } from '../TemplateLibrary/TemplateListData'
import { VisitorList } from '.'

export const GET_VISITOR_TEAMS_CONNECTION = gql`
  query getVisitorTeamsConnection{
  visitorTeamsConnection(teamId: "jfp-team", first: 10) {
    edges {
      node {
        id
        teamId
        userId
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
  }
}
`

const VisitorListStory = {
  ...journeysAdminConfig,
  component: VisitorList,
  title: 'Journeys-Admin/VisitorList',  
}
const input = [
  {
    id:"Jesse Ernst",
    teamId: 56445,
    userId: 84454,
    createdAt: "This date"
  },
  {
    id:"Tataihono Nikora",
    teamId: 1111,
    userId: 8465,
    createdAt: "This date"
  },
  {
    id:"Siyang Cao",
    teamId: 2222,
    userId: 32165,
    createdAt: "This date"
  },
  {
    id:"Steven Diller",
    teamId: 33332,
    userId: 5,
    createdAt: "This date"
  },
  {
    id:"Aaron Thompson",
    teamId: 798654,
    userId: 132465,
    createdAt: "This date"
  }
]

const Template: Story = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VISITOR_TEAMS_CONNECTION
        },
        result: {
          data: {
            
          }
        }
      }
    ]}
  >
    {console.log(args.props)}
    <FlagsProvider flags={{ templates: true }}>
      <VisitorList input={input} />
    </FlagsProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  props: {
    event: ''
  }
}

export default VisitorListStory as Meta