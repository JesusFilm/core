import { Story, Meta } from '@storybook/react'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock
} from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Image } from './Image'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: Image,
  title: 'Journeys/Blocks/Image'
}

const DefaultTemplate: Story<TreeBlock<ImageBlock>> = ({
  ...props
}) => <Image {...props} />

export const Default: Story<TreeBlock<ImageBlock>> =
  DefaultTemplate.bind({})
Default.args = {
  id: 'Image',
  alt: 'How can we help you know more about Jesus?',
  src: 'https://www.placehold.it/500'
}


export default Demo as Meta
