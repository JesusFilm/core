import { render } from '@testing-library/react'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { HostAvatars } from './HostAvatars'

describe('HostAvatars', () => {
  it('renders AvatarGroup with src1 and src2 avatars when NOT admin', () => {
    const { getByTestId, getAllByRole } = render(
      <HostAvatars src1="avatar1.jpg" src2="avatar2.jpg" />
    )

    const avatarGroupElement = getByTestId('host-avatars')
    expect(avatarGroupElement).toBeInTheDocument()

    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })

  it('renders AccountCircleOutlinedIcon when admin and no src avatars', () => {
    const { getByTestId } = render(
      <FlagsProvider flags={{ editableStepFooter: true }}>
        <JourneyProvider value={{ admin: true }}>
          <HostAvatars src1={undefined} src2={undefined} />
        </JourneyProvider>
      </FlagsProvider>
    )

    const adminPlaceholderElement = getByTestId('host-avatar-placeholder')
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('renders AvatarGroup with one avatar and AccountCircleOutlinedIcon when admin and one src avatar', () => {
    const { getByTestId, getByRole } = render(
      <FlagsProvider flags={{ editableStepFooter: true }}>
        <JourneyProvider value={{ admin: true }}>
          <HostAvatars src1="avatar1.jpg" src2={undefined} />
        </JourneyProvider>
      </FlagsProvider>
    )

    const avatars = getByRole('img')
    expect(avatars).toBeInTheDocument()
    expect(avatars.getAttribute('src')).toEqual('avatar1.jpg')
    const adminPlaceholderElement = getByTestId('host-avatar-placeholder')
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('renders AvatarGroup with two src avatars when admin and both src avatars provided', () => {
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
