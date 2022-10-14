import { Story, Meta } from '@storybook/react'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../__generated__/globalTypes'
import { JourneyFields } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { StoryCard } from '../StoryCard'
import { Image } from './Image'

const Demo = {
  ...journeyUiConfig,
  component: Image,
  title: 'Journeys-Ui/Image'
}

const emptyImage: Omit<Parameters<typeof Image>[0], 'src'> = {
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  id: 'Image',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
  children: []
}

const Template: Story<
  Parameters<typeof Image>[0] & { journey?: JourneyFields }
> = ({ journey, ...args }) => (
  <JourneyProvider value={{ journey }}>
    <StoryCard>
      <Image {...args} alt={args.alt} />
    </StoryCard>
  </JourneyProvider>
)

// Throttle network to see loading image
export const Default = Template.bind({})
Default.args = {
  ...emptyImage
}

export const WebImage = Template.bind({})
WebImage.args = {
  ...Default.args,
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
}
WebImage.parameters = {
  chromatic: { delay: 300 }
}

export const RTL = Template.bind({})
RTL.args = {
  ...WebImage.args,
  journey: {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'ar',
      iso3: 'arb',
      name: [
        {
          __typename: 'Translation',
          value: 'Arabic',
          primary: false
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null
  }
}
RTL.parameters = { rtl: true }

export default Demo as Meta
