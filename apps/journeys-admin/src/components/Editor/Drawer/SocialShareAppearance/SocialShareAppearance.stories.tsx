import { Story, Meta } from '@storybook/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { screen, userEvent } from '@storybook/testing-library'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '../../../../libs/context'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Drawer } from '../Drawer'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../__generated__/globalTypes'
import { SocialShareAppearance } from './SocialShareAppearance'

const SocialShareAppearanceStory = {
  ...journeysAdminConfig,
  component: SocialShareAppearance,
  title: 'Journeys-Admin/Editor/Drawer/SocialShareAppearance'
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: null,
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: [],
  seoTitle: null,
  seoDescription: null
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: null,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1649866725673-16dc15de5c29?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1009&q=80',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const Template: Story = ({ ...args }) => {
  return (
    <MockedProvider>
      <JourneyProvider value={args.journey}>
        <EditorProvider
          initialState={{
            drawerTitle: 'Social Share Appearance',
            drawerChildren: <SocialShareAppearance />,
            drawerMobileOpen: true
          }}
        >
          <Drawer />
        </EditorProvider>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = { journey: journey }

export const Filled = Template.bind({})
Filled.args = {
  journey: {
    ...journey,
    blocks: [image],
    primaryImageBlock: image,
    seoTitle: 'Social title',
    seoDescription: 'Social description',
    status: 'published'
  }
}

export const Max = Template.bind({})
Max.args = {
  journey: {
    ...journey,
    blocks: [image],
    primaryImageBlock: image,
    seoTitle: 'Lorem ipsum dolor sit amet, consectetuer adipiscin',
    seoDescription:
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur rid'
  }
}

export const Loading = Template.bind({})
Loading.args = { journey: null }

export const NoImageDialog = Template.bind({})
NoImageDialog.args = { journey: journey }
NoImageDialog.play = () => {
  userEvent.click(screen.getByRole('button', { name: 'Change' }))
}

export const ImageDialog = Template.bind({})
ImageDialog.args = {
  journey: {
    ...journey,
    blocks: [image],
    primaryImageBlock: image,
    seoTitle: 'Social title',
    seoDescription: 'Social description'
  }
}
ImageDialog.play = () => {
  userEvent.click(screen.getByRole('button', { name: 'Change' }))
}

export default SocialShareAppearanceStory as Meta
