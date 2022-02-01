import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { IMAGE_BLOCK_CREATE } from './NewImageButton'
import { NewImageButton } from '.'

const NewImageButtonStory = {
  ...simpleComponentConfig,
  component: NewImageButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewImageButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: IMAGE_BLOCK_CREATE,
            variables: {
              input: {
                journeyId: 'journeyId',
                parentBlockId: 'cardId',
                src: null,
                alt: 'Default Image Icon'
              }
            }
          },
          result: {
            data: {
              imageBlockCreate: {
                id: 'imageBlockId',
                parentBlockId: 'cardId',
                journeyId: 'journeyId',
                src: null,
                alt: 'Default Image Icon',
                width: 0,
                height: 0,
                blurhash: null
              }
            }
          }
        }
      ]}
    >
      <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
        <EditorProvider
          initialState={{
            selectedStep: {
              __typename: 'StepBlock',
              id: 'stepId',
              parentBlockId: null,
              parentOrder: 0,
              locked: true,
              nextBlockId: null,
              children: [
                {
                  id: 'cardId',
                  __typename: 'CardBlock',
                  parentBlockId: 'stepId',
                  parentOrder: 0,
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
          <NewImageButton />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NewImageButtonStory as Meta
