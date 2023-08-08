import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { CustomImage } from '.'

const CustomImageStory = {
  ...simpleComponentConfig,
  component: CustomImage,
  title: 'Journeys-Admin/Editor/ImageBlockEditor/CustomImage'
}

const Template: Story = () => (
  <MockedProvider mocks={[]}>
    <Box sx={{ bgcolor: 'background.paper' }}>
      <CustomImage
        selectedBlock={{
          id: 'imageBlockId',
          __typename: 'ImageBlock',
          src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
          alt: 'random image from unsplash',
          width: 1600,
          height: 1067,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          parentBlockId: 'card',
          parentOrder: 0
        }}
        onChange={noop}
      />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})

export default CustomImageStory as Meta
