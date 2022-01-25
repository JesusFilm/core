import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { JourneyProvider } from '../../../../../libs/context'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { TYPOGRAPHY_BLOCK_CREATE } from './Typography'
import { Typography } from '.'

const TypographyStory = {
  ...journeysAdminConfig,
  component: Typography,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/Typography'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: TYPOGRAPHY_BLOCK_CREATE,
            variables: {
              input: {
                journeyId: 'journeyId',
                parentBlockId: 'cardId',
                content: 'TEST'
              }
            }
          },
          result: {
            data: {
              typographyBlockCreate: {
                id: 'typographyBlockId',
                parentBlockId: 'cardId',
                journeyId: 'journeyId',
                align: null,
                color: null,
                content: null,
                variant: null
              }
            }
          }
        }
      ]}
      addTypename={false}
    >
      <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
        <EditorProvider
          initialState={{
            selectedStep: {
              __typename: 'StepBlock',
              id: 'stepId',
              parentBlockId: null,
              locked: true,
              nextBlockId: null,
              children: [
                {
                  id: 'cardId',
                  __typename: 'CardBlock',
                  parentBlockId: 'stepId',
                  coverBlockId: null,
                  backgroundColor: null,
                  themeMode: null,
                  themeName: null,
                  fullscreen: false,
                  children: []
                }
              ]
            }
          }}
        >
          <Typography />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default TypographyStory as Meta
