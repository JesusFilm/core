import { render } from '@testing-library/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { HostAvatars } from './HostAvatars'

describe('HostAvatars', () => {
  const hostData = {
    id: 'hostId',
    __typename: 'Host' as const,
    teamId: 'teamId',
    title: 'Cru International',
    location: 'Florida, USA',
    src1: null,
    src2: null
  }

  const twoAvatarHost = {
    ...hostData,
    src1: 'avatar1.jpg',
    src2: 'avatar2.jpg'
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
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
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
    userJourneys: [],
    template: null,
    seoTitle: 'My awesome journey',
    seoDescription: null,
    chatButtons: [],
    host: hostData
  }

  it('renders both avatars if both images are set', () => {
    const { getByTestId, getAllByRole } = render(
      <JourneyProvider value={{ journey: { ...journey, host: twoAvatarHost } }}>
        <HostAvatars />
      </JourneyProvider>
    )

    const avatarGroupElement = getByTestId('host-avatars')
    expect(avatarGroupElement).toBeInTheDocument()
    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })

  it('renders nothing if no images are set', () => {
    const { queryAllByRole } = render(
      <JourneyProvider
        value={{ journey: { ...journey, host: { ...hostData } } }}
      >
        <HostAvatars />
      </JourneyProvider>
    )

    const avatars = queryAllByRole('img')
    expect(avatars).toHaveLength(0)
  })

  it('renders with avatar if one image is set', () => {
    const { queryAllByRole } = render(
      <JourneyProvider
        value={{
          journey: { ...journey, host: { ...hostData, src1: 'avatar1.jpg' } }
        }}
      >
        <HostAvatars />
      </JourneyProvider>
    )

    const avatars = queryAllByRole('img')
    expect(avatars).toHaveLength(1)
  })

  describe('hasPlaceholder', () => {
    it('renders placeholder if no images are set', () => {
      const { getByTestId } = render(
        <FlagsProvider
          flags={{
            editableStepFooter: true
          }}
        >
          <JourneyProvider value={{ admin: true, journey: { ...journey } }}>
            <HostAvatars hasPlaceholder />
          </JourneyProvider>
        </FlagsProvider>
      )

      const adminPlaceholderElement = getByTestId('host-avatar-placeholder')
      expect(adminPlaceholderElement).toBeInTheDocument()
    })

    it('renders with avatar and placeholder if one image is set', () => {
      const oneAvatarHost = {
        ...hostData,
        src1: 'avatar1.jpg'
      }

      const { getByTestId, getByRole } = render(
        <FlagsProvider flags={{ editableStepFooter: true }}>
          <JourneyProvider
            value={{
              admin: true,
              journey: { ...journey, host: oneAvatarHost }
            }}
          >
            <HostAvatars hasPlaceholder />
          </JourneyProvider>
        </FlagsProvider>
      )

      const avatars = getByRole('img')
      expect(avatars).toBeInTheDocument()
      expect(avatars.getAttribute('src')).toEqual('avatar1.jpg')
      const adminPlaceholderElement = getByTestId('host-avatar-placeholder')
      expect(adminPlaceholderElement).toBeInTheDocument()
    })
  })
})
