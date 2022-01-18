import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Image } from '.'

const ImageStory = {
  ...journeysAdminConfig,
  component: Image,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/Image'
}

export const Default: Story = () => {
  return (
    <MockedProvider>
      <Image />
    </MockedProvider>
  )
}

export default ImageStory as Meta
