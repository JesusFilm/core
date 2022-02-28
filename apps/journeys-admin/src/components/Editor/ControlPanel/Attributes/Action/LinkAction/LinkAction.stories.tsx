import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import { LinkAction } from '.'

const LinkActionStory = {
  ...simpleComponentConfig,
  component: LinkAction,
  title:
    'Journeys-Admin/Editor/ControlPanel/Attributes/ActionProperties/LinkAction'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <LinkAction />
    </MockedProvider>
  )
}

export const WithLink: Story = () => {
  const selectedBlock: TreeBlock<ButtonBlock> = {
    __typename: 'ButtonBlock',
    id: 'button.id',
    parentBlockId: 'parentBlockId',
    parentOrder: 0,
    label: 'test button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: {
      parentBlockId: 'button.id',
      __typename: 'LinkAction',
      gtmEventName: 'gtmEventName',
      url: 'https://www.google.com'
    },
    children: []
  }

  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <LinkAction />
      </EditorProvider>
    </MockedProvider>
  )
}

export default LinkActionStory as Meta
