import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook/config'
import { Description } from './Description'

const inputString =
  'Following Jesus is a mini series designed to ground followers of Jesus in their faith and equip them to be fruitful members of Christ\'s body. Using storytelling techniques and incorporating images and clips from the "JESUS" film, "Following JESUS" teaches biblical principles and demonstrates how to live as a follower of Christ. Following Jesus is a mini series designed to ground followers of Jesus in their faith and equip them to be fruitful members of Christ\'s body. Using storytelling techniques and incorporating images and clips from the "JESUS" film, "Following JESUS" teaches biblical principles and demonstrates how to live as a follower of Christ. Following Jesus is a mini series designed to ground followers of Jesus in their faith and equip them to be fruitful members of Christ\'s body. Using storytelling techniques and incorporating images and clips from the "JESUS" film, "Following JESUS" teaches biblical principles and demonstrates how to live as a follower of Christ.'

const DescriptionStory = {
  ...watchConfig,
  component: Description,
  title: 'Watch/Description',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = () => <Description value={inputString} />

export const Default = Template.bind({})

export default DescriptionStory as Meta
