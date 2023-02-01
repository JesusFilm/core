import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ImageLibrary } from '.'

const ImageLibraryStory = {
  ...simpleComponentConfig,
  component: ImageLibrary,
  title: 'Journeys-Admin/Editor/ImageLibrary'
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)

  return (
    <FlagsProvider flags={{ unsplashGallery: true }}>
      <ImageLibrary open={open} onClose={() => setOpen(false)} />
    </FlagsProvider>
  )
}

export const Default = Template.bind({})

export default ImageLibraryStory as Meta
