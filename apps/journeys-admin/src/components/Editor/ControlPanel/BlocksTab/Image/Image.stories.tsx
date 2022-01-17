import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Image } from '.'
import { MockedProvider } from '@apollo/client/testing'

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
