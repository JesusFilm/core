import { render, screen } from '@testing-library/react'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'

import { HostAvatars } from './HostAvatars'

describe('HostAvatars', () => {
  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    featuredAt: null,
    strategySlug: null,
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: 'My awesome journey',
    seoDescription: null,
    chatButtons: [],
    host: {
      id: 'hostId',
      __typename: 'Host' as const,
      teamId: 'teamId',
      title: 'Cru International',
      location: 'Florida, USA',
      src1: null,
      src2: null
    },
    team: null,
    tags: [],
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    logoImageBlock: null,
    menuButtonIcon: null,
    menuStepBlock: null,
    showHosts: null,
    showChatButtons: null,
    showReactionButtons: null,
    showLogo: null,
    showMenu: null,
    showDisplayTitle: null
  }

  it('renders both avatars if both images are set', () => {
    render(
      <JourneyProvider value={{ journey }}>
        <HostAvatars avatarSrc1="avatar1.jpg" avatarSrc2="avatar2.jpg" />
      </JourneyProvider>
    )

    const avatarGroupElement = screen.getByTestId('StepFooterHostAvatars')
    expect(avatarGroupElement).toBeInTheDocument()
    const avatars = screen.getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })

  it('renders nothing if no images are set', () => {
    render(
      <JourneyProvider value={{ journey }}>
        <HostAvatars />
      </JourneyProvider>
    )

    const avatars = screen.queryAllByRole('img')
    expect(avatars).toHaveLength(0)
  })

  it('renders with avatar if one image is set', () => {
    render(
      <JourneyProvider value={{ journey }}>
        <HostAvatars avatarSrc1="avatar1.jpg" />
      </JourneyProvider>
    )

    const avatars = screen.queryAllByRole('img')
    expect(avatars).toHaveLength(1)
  })

  describe('hasPlaceholder', () => {
    it('renders placeholder if no images are set', () => {
      render(
        <JourneyProvider value={{ journey }}>
          <HostAvatars hasPlaceholder />
        </JourneyProvider>
      )

      const adminPlaceholderElement = screen.getByTestId(
        'host-avatar-placeholder'
      )
      expect(adminPlaceholderElement).toBeInTheDocument()
    })

    it('renders with avatar and placeholder if one image is set', () => {
      render(
        <JourneyProvider value={{ journey }}>
          <HostAvatars hasPlaceholder avatarSrc1="avatar1.jpg" />
        </JourneyProvider>
      )

      const avatars = screen.getByRole('img')
      expect(avatars).toBeInTheDocument()
      expect(avatars.getAttribute('src')).toBe('avatar1.jpg')
      const adminPlaceholderElement = screen.getByTestId(
        'host-avatar-placeholder'
      )
      expect(adminPlaceholderElement).toBeInTheDocument()
    })
  })
})
