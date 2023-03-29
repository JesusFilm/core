import { MockedProvider } from '@apollo/client/testing'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'
import { simpleComponentConfig } from '../../libs/storybook'
import {
  GET_ONBOARDING_TEMPLATE,
  OnboardingPanelContent
} from './OnboardingPanelContent'

const OnboardingPanelContentStory = {
  ...simpleComponentConfig,
  title: 'Journeys-admin/OnboardingPanelContent'
}

const Template: Story = () => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_ONBOARDING_TEMPLATE,
          variables: {
            id: '014c7add-288b-4f84-ac85-ccefef7a07d3'
          }
        },
        result: {
          data: {
            template: {
              id: '014c7add-288b-4f84-ac85-ccefef7a07d3',
              title: 'template 1 title',
              description: 'template 1 description',
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80'
              }
            }
          }
        }
      },
      {
        request: {
          query: GET_ONBOARDING_TEMPLATE,
          variables: {
            id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9'
          }
        },
        result: {
          data: {
            template: {
              id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9',
              title: 'template 2 title',
              description: 'template 2 description',
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80'
              }
            }
          }
        }
      },
      {
        request: {
          query: GET_ONBOARDING_TEMPLATE,
          variables: {
            id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9'
          }
        },
        result: {
          data: {
            template: {
              id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9',
              title: 'template 3 title',
              description: 'template 3 description',
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80'
              }
            }
          }
        }
      },
      {
        request: {
          query: GET_ONBOARDING_TEMPLATE,
          variables: {
            id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8'
          }
        },
        result: {
          data: {
            template: {
              id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8',
              title: 'template 4 title',
              description: 'template 4 description',
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80'
              }
            }
          }
        }
      },
      {
        request: {
          query: GET_ONBOARDING_TEMPLATE,
          variables: {
            id: '13317d05-a805-4b3c-b362-9018971d9b57'
          }
        },
        result: {
          data: {
            template: {
              id: '13317d05-a805-4b3c-b362-9018971d9b57',
              title: 'template 5 title',
              description: 'template 5 description',
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1679941279735-b3b35e8bc476?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1887&q=80'
              }
            }
          }
        }
      }
    ]}
  >
    <Paper elevation={0} sx={{ width: '330px' }}>
      <Stack>
        <OnboardingPanelContent />
      </Stack>
    </Paper>
  </MockedProvider>
)

export const Default = Template.bind({})

export default OnboardingPanelContentStory as Meta
