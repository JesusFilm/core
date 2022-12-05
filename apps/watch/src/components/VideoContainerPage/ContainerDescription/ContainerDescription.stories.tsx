import { ComponentStory, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook/config'
import { ContainerDescription } from './ContainerDescription'

const inputString =
  'Following Jesus is a mini series designed to ground followers of Jesus in their faith and equip them to be fruitful members of Christ\'s body. Using storytelling techniques and incorporating images and clips from the "JESUS" film, "Following JESUS" teaches biblical principles and demonstrates how to live as a follower of Christ. Following Jesus is a mini series designed to ground followers of Jesus in their faith and equip them to be fruitful members of Christ\'s body. Using storytelling techniques and incorporating images and clips from the "JESUS" film, "Following JESUS" teaches biblical principles and demonstrates how to live as a follower of Christ. Following Jesus is a mini series designed to ground followers of Jesus in their faith and equip them to be fruitful members of Christ\'s body. Using storytelling techniques and incorporating images and clips from the "JESUS" film, "Following JESUS" teaches biblical principles and demonstrates how to live as a follower of Christ.'

const ContainerDescriptionStory = {
  ...watchConfig,
  component: ContainerDescription,
  title: 'Watch/ContainerDescription',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof ContainerDescription> = ({ ...args }) => (
  <ContainerDescription {...args} />
)

export const Default = Template.bind({})

Default.args = {
  value: inputString
}

export default ContainerDescriptionStory as Meta
