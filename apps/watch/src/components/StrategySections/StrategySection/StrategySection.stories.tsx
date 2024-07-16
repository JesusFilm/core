import { Typography } from '@mui/material'
import { Meta, StoryObj } from '@storybook/react'
import algoliasearch from 'algoliasearch'
import { InstantSearch } from 'react-instantsearch'
import { StrategySection } from '.'
import { watchConfig } from '../../../libs/storybook'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...watchConfig,
  component: StrategySection,
  title: 'Watch/StrategySections/StrategySection'
}

const longDescription =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

const imageSrc =
  'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'

const testItems = [
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: longDescription,
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  },
  {
    title: 'Title',
    description: 'description',
    id: 'test-id',
    imageUrl: imageSrc,
    link: ''
  }
]

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

const Template: StoryObj = {
  render: () => (
    <>
      <Typography>Title</Typography>
      <InstantSearch searchClient={searchClient}>
        <StrategySection />
      </InstantSearch>
    </>
    // <StrategySection />
  )
}

export const Default = {
  ...Template
}

export default StrategySectionStory
