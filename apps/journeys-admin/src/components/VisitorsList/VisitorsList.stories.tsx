import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'

import { GET_VISITORS } from './VisitorsList'

import { VisitorsList } from '.'

const VisitorsListStory: Meta<typeof VisitorsList> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorsList',
  component: VisitorsList
}

export const Default: StoryObj<typeof VisitorsList> = {
  render: () => (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VISITORS,
            variables: {
              first: 100
            }
          },
          result: {
            data: {
              visitors: {
                __typename: 'VisitorConnection',
                edges: [
                  {
                    __typename: 'VisitorEdge',
                    node: {
                      __typename: 'Visitor',
                      id: 'visitor1.id',
                      lastChatPlatform: 'facebook',
                      lastLinkAction: 'https://google.com',
                      lastRadioOptionSubmission: 'selected option',
                      lastRadioQuestion: 'Radio Question',
                      lastStepViewedAt: '2023-03-29T23:08:17.487Z',
                      lastTextResponse: 'Feedback from the user'
                    },
                    cursor: '2023-03-29T23:08:17.487Z'
                  },
                  {
                    __typename: 'VisitorEdge',
                    node: {
                      __typename: 'Visitor',
                      id: 'visitor2.id',
                      lastChatPlatform: 'instagram',
                      lastLinkAction: 'https://www.biblegateway.com/',
                      lastRadioOptionSubmission: 'selected option',
                      lastRadioQuestion: 'Radio Question',
                      lastStepViewedAt: '2023-03-29T23:08:17.487Z',
                      lastTextResponse: 'Feedback from the user'
                    },
                    cursor: '2023-03-29T23:08:17.487Z'
                  },
                  {
                    __typename: 'VisitorEdge',
                    node: {
                      __typename: 'Visitor',
                      id: 'visitor3.id',
                      lastChatPlatform: 'viber',
                      lastLinkAction: 'https://www.lipsum.com/',
                      lastRadioOptionSubmission:
                        'long selected option - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur quis magna feugiat, ultrices ante et, ultricies orci. In cursus ante sit amet velit dapibus consequat.',
                      lastRadioQuestion:
                        'Long Radio Question - Aliquam ornare tortor vitae enim consequat, fermentum bibendum tortor aliquet. Donec vitae sem ut libero mattis faucibus vel ac orci.',
                      lastStepViewedAt: '2023-03-29T01:08:17.487Z',
                      lastTextResponse:
                        'Long feedback from the user - Nullam massa lacus, imperdiet id massa porttitor, semper eleifend sapien. Vestibulum sed tellus diam. Aenean et urna eget diam mattis facilisis. Aliquam malesuada at purus ac condimentum. Fusce a tristique erat, at porta sapien. Quisque cursus lectus massa, et dictum lacus sagittis vitae. Vestibulum quis erat sapien. Vivamus metus lectus, efficitur sit amet eleifend vehicula, rutrum nec leo. Duis sit amet consectetur erat, non pharetra lorem. Pellentesque non lectus lobortis, ullamcorper turpis at, lacinia nunc. Maecenas dictum neque id justo sagittis ultrices. Fusce lectus odio, gravida nec convallis eu, fringilla id libero. Aliquam finibus malesuada mauris, vehicula facilisis nunc varius quis. In sed odio quis augue tincidunt porttitor eget et massa. Morbi sed elit sit amet neque lobortis pulvinar fermentum eu nunc. Praesent a ultrices leo. Sed elementum semper tortor, sit amet eleifend diam iaculis nec. Pellentesque sed leo in augue vestibulum fermentum eu eu metus. Suspendisse porttitor, erat hendrerit ullamcorper scelerisque, enim ex tempor nulla, vel placerat erat orci id ex. Aliquam neque mauris, pellentesque eget mollis quis, malesuada eu diam. Curabitur malesuada turpis lacus, sit amet pretium nunc dictum non. Cras erat massa, faucibus varius sagittis a, laoreet vitae nulla. Vestibulum porta ligula id mollis auctor. Aenean eget laoreet odio, at suscipit nisl. Nunc in elementum velit, id sollicitudin nulla. Cras dignissim sed sem eget auctor. Nullam finibus vulputate sem, non iaculis arcu vulputate quis. Aliquam vehicula nisl nec lorem gravida pellentesque.'
                    },
                    cursor: '2023-03-29T01:08:17.487Z'
                  }
                ],
                pageInfo: {
                  __typename: 'PageInfo',
                  hasNextPage: true,
                  startCursor: null,
                  endCursor: null
                }
              }
            }
          }
        }
      ]}
    >
      <Box sx={{ height: '600px' }}>
        <VisitorsList />
      </Box>
    </MockedProvider>
  )
}

export const Loading: StoryObj<typeof VisitorsList> = {
  render: () => (
    <ApolloLoadingProvider>
      <VisitorsList />
    </ApolloLoadingProvider>
  )
}

export default VisitorsListStory
