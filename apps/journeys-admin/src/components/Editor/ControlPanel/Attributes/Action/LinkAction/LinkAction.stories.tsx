import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { steps } from '../data'
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
  const selectedBlock = steps[1].children[0].children[3]

  return (
    <MockedProvider>
      <EditorProvider initialState={{ selectedBlock }}>
        <LinkAction />
      </EditorProvider>
    </MockedProvider>
  )
}

export default LinkActionStory as Meta
