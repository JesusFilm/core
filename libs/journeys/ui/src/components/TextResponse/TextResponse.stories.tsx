import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import type { TreeBlock } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { StoryCard } from '../StoryCard'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { IconName } from '../../../__generated__/globalTypes'
import {
  TextResponse,
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
} from './TextResponse'
import { TextResponseFields } from './__generated__/TextResponseFields'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: TextResponse,
  title: 'Journeys-Ui/TextResponse'
}

const textResponseProps: TreeBlock<TextResponseFields> = {
  id: 'textResponseBlockId1',
  __typename: 'TextResponseBlock',
  parentBlockId: null,
  parentOrder: 0,
  label: 'label',
  hint: 'hint text',
  submitIconId: null,
  submitLabel: null,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'textResponseBlockId1',
    gtmEventName: 'gtmEventName',
    blockId: 'step2.id'
  },
  children: []
}

const Template: Story<TreeBlock<TextResponseFields>> = ({
  ...props
}): ReactElement => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'textResponseBlockId1',
              value: 'My response'
            }
          }
        },
        result: {
          data: {
            textResponseSubmissionEventCreate: {
              id: 'uuid',
              blockId: 'textResponseBlockId1',
              value: 'My response'
            }
          }
        }
      }
    ]}
  >
    <SnackbarProvider>
      <StoryCard>
        <TextResponse {...textResponseProps} {...props} uuid={() => 'uuid'} />
      </StoryCard>
    </SnackbarProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export const Complete = Template.bind({})
Complete.args = {
  submitIconId: 'icon',
  submitLabel: 'Unlock Now',
  children: [
    {
      id: 'icon',
      __typename: 'IconBlock',
      parentBlockId: 'parent',
      parentOrder: 0,
      iconName: IconName.LockOpenRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }
  ]
}

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

const LoadingTemplate: Story<
  TreeBlock<TextResponseFields>
> = (): ReactElement => (
  <ApolloLoadingProvider>
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <TextResponse {...textResponseProps} uuid={() => 'uuid'} />
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </ApolloLoadingProvider>
)

export const Loading = LoadingTemplate.bind({})

export default Demo as Meta
