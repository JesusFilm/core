import { ComponentStory, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { CollectionHero } from '.'

const CollectionHeroStory = {
  ...watchConfig,
  component: CollectionHero,
  title: 'Watch/Hero/CollectionHero'
}

const Template: ComponentStory<typeof CollectionHero> = ({ ...args }) => (
  <CollectionHero {...args} />
)

export const Default = Template.bind({})
Default.args = {
  title: 'hello world',
  imageSrc:
    'https://images.unsplash.com/photo-1669052324124-e6ee7da16031?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  type: 'collection',
  length: 4
}

export default CollectionHeroStory as Meta
