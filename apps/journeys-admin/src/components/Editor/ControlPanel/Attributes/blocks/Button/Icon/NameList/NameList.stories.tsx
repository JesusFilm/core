import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { NameList } from '.'

const NameListStory = {
  ...simpleComponentConfig,
  component: NameList,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button/Icon/NameList'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <NameList id={'button-name-id'} name={undefined} disabled={false} />
    </MockedProvider>
  )
}

export default NameListStory as Meta
