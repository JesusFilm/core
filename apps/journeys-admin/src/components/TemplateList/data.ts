import { formatISO, startOfYear } from 'date-fns'

import { GetAdminJourneys_journeys as Journey } from '../../../__generated__/GetAdminJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { ImageFields } from '../../../__generated__/ImageFields'

export const fakeDate = '2021-12-11'

const imageBlock: ImageFields = {
  __typename: 'ImageBlock',
  id: 'primaryImage.id1',
  parentBlockId: null,
  parentOrder: null,
  src: 'https://images.unsplash.com/photo-1659470160215-2c8916402ff0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1035&q=80',
  alt: 'image.alt',
  width: 10,
  height: 10,
  blurhash: '',
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

export const defaultTemplate: Journey = {
  __typename: 'Journey',
  id: 'template-id',
  title: 'Default Template Heading',
  description: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  slug: 'default',
  updatedAt: formatISO(startOfYear(new Date(fakeDate))),
  createdAt: formatISO(startOfYear(new Date(fakeDate))),
  publishedAt: null,
  status: JourneyStatus.draft,
  seoTitle: null,
  seoDescription: null,
  userJourneys: null,
  template: true,
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  primaryImageBlock: null,
  trashedAt: null
}

export const oldTemplate: Journey = {
  ...defaultTemplate,
  id: 'old-template-id',
  title: 'An Old Template Heading',
  description:
    'Template created before the current year should also show the year in the date',
  createdAt: '2020-11-19T12:34:56.647Z',
  updatedAt: '2020-11-19T12:34:56.647Z',
  publishedAt: '2020-12-19T12:34:56.647Z',
  status: JourneyStatus.published,
  primaryImageBlock: {
    ...imageBlock,
    src: 'https://images.unsplash.com/photo-1659386690005-28d213bcb550?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1065&q=80'
  }
}

export const publishedTemplate: Journey = {
  ...defaultTemplate,
  id: 'published-template-id',
  title: 'Published Template Heading',
  description: 'a published template',
  publishedAt: formatISO(startOfYear(new Date())),
  status: JourneyStatus.published,
  primaryImageBlock: {
    ...imageBlock,
    id: 'primaryImage.id2',
    src: 'https://images.unsplash.com/photo-1659424766377-70ec767c9d39?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80'
  }
}

export const descriptiveTemplate: Journey = {
  ...defaultTemplate,
  id: 'descriptive-template-id',
  title:
    'This heading is very long so that we can test out the wrapping of the title on the card, by default this should be no longer than 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  description:
    'This description is also very very long for the purpose of testing out text wrapping which also should restricted to 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  language: {
    __typename: 'Language',
    id: '20615',
    name: [
      {
        __typename: 'LanguageName',
        value: '普通話',
        primary: true
      },
      {
        __typename: 'LanguageName',
        value: 'Chinese, Mandarin',
        primary: false
      }
    ]
  },
  primaryImageBlock: {
    ...imageBlock,
    id: 'primaryImage.id3',
    src: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'
  }
}

export const archivedTemplate = {
  ...defaultTemplate,
  title: 'Archived Template Heading',
  description: 'a archived template',
  publishedAt: formatISO(startOfYear(new Date())),
  status: JourneyStatus.archived,
  primaryImageBlock: {
    ...imageBlock,
    id: 'primaryImage.id4',
    src: 'https://images.unsplash.com/photo-1659456194848-a61987e81510?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80'
  }
}

export const trashedTemplate = {
  ...defaultTemplate,
  title: 'Trashed Template Heading',
  description: 'a trashed template',
  publishedAt: formatISO(startOfYear(new Date())),
  status: JourneyStatus.trashed,
  primaryImageBlock: {
    ...imageBlock,
    id: 'primaryImage.id5',
    src: 'https://images.unsplash.com/photo-1517917822086-6988b4ca9b31?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'
  }
}
