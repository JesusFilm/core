import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { IMAGE_BLOCK_CREATE } from './Image'
import { Image } from '.'

const ImageStory = {
  ...journeysAdminConfig,
  component: Image,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/Image'
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
          <Image />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default ImageStory as Meta
