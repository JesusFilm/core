import { render } from '@testing-library/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { HostAvatars } from './HostAvatars'

describe('HostAvatars', () => {
  it('renders both avatars if images are set in journeys', () => {
    const { getByTestId, getAllByRole } = render(
      <HostAvatars src1="avatar1.jpg" src2="avatar2.jpg" />
    )

    const avatarGroupElement = getByTestId('host-avatars')
    expect(avatarGroupElement).toBeInTheDocument()

    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })

  it('renders placeholder in journey edit page and no images are set', () => {
    const { getByTestId } = render(
      <FlagsProvider flags={{ editableStepFooter: true }}>
        <JourneyProvider value={{ admin: true }}>
          <HostAvatars src1={undefined} src2={undefined} hasPlaceholder />
        </JourneyProvider>
      </FlagsProvider>
    )

    const adminPlaceholderElement = getByTestId('host-avatar-placeholder')
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('renders with one avatar and placeholder in journey edit page when only one image is set', () => {
    const { getByTestId, getByRole } = render(
      <FlagsProvider flags={{ editableStepFooter: true }}>
        <JourneyProvider value={{ admin: true }}>
          <HostAvatars src1="avatar1.jpg" src2={undefined} hasPlaceholder />
        </JourneyProvider>
      </FlagsProvider>
    )

    const avatars = getByRole('img')
    expect(avatars).toBeInTheDocument()
    expect(avatars.getAttribute('src')).toEqual('avatar1.jpg')
    const adminPlaceholderElement = getByTestId('host-avatar-placeholder')
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('renders with two avatars in journey edit page when both images are provided', () => {
    const { getByTestId, getAllByRole } = render(
      <JourneyProvider value={{ admin: true }}>
        <HostAvatars src1="avatar1.jpg" src2="avatar2.jpg" />
      </JourneyProvider>
    )

    const avatarGroupElement = getByTestId('host-avatars')
    expect(avatarGroupElement).toBeInTheDocument()
    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
    expect(avatars[0].getAttribute('src')).toEqual('avatar2.jpg')
    expect(avatars[1].getAttribute('src')).toEqual('avatar1.jpg')
  })
})
