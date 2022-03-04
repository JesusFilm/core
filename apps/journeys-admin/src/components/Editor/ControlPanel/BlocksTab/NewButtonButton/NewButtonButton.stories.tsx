import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../libs/context'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize
} from '../../../../../../__generated__/globalTypes'
import { BUTTON_BLOCK_CREATE } from './NewButtonButton'
import { NewButtonButton } from '.'

const NewButtonButtonStory = {
  ...simpleComponentConfig,
  component: NewButtonButton,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/NewButtonButton'
}

export const Default: Story = () => {
  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: BUTTON_BLOCK_CREATE,
            variables: {
              input: {
                id: 'buttonBlockId',
                journeyId: 'journeyId',
                parentBlockId: 'cardId',
                label: 'Your text here',
                variant: ButtonVariant.contained,
                color: ButtonColor.primary,
                size: ButtonSize.medium
              },
              iconBlockCreateInput1: {
                id: 'startIconId',
                journeyId: 'journeyId',
                parentBlockId: 'buttonBlockId',
                name: null
              },
              iconBlockCreateInput2: {
                id: 'endIconId',
                journeyId: 'journeyId',
                parentBlockId: 'buttonBlockId',
                name: null
              },
              id: 'buttonBlockId',
              journeyId: 'journeyId',
              updateInput: {
                startIconId: 'startIconId',
                endIconId: 'endIconId'
              }
            }
          },
          result: {
            data: {
              buttonBlockCreate: {
                id: 'buttonBlockId'
              },
              startIcon: {
                __typename: 'IconBlock',
                id: 'startIconId',
                journeyId: 'journeyId',
                parentBlockId: 'buttonBlockId',
                parentOrder: null,
                iconName: null,
                iconColor: null,
                iconSize: null
              },
              endIcon: {
                __typename: 'IconBlock',
                id: 'endIconId',
                journeyId: 'journeyId',
                parentBlockId: 'buttonBlockId',
                parentOrder: null,
                iconName: null,
                iconColor: null,
                iconSize: null
              },
              buttonBlockUpdate: {
                id: 'buttonBlockId',
                parentBlockId: 'cardId',
                parentOrder: 0,
                journeyId: 'journeyId',
                label: 'Your text here',
                variant: ButtonVariant.contained,
                color: ButtonColor.primary,
                size: ButtonSize.medium,
                startIconId: 'startIconId',
                endIconId: 'endIconId',
                action: null
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
          <NewButtonButton />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export default NewButtonButtonStory as Meta
