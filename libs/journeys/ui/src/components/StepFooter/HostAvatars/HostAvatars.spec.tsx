import { render } from '@testing-library/react'
import { HostAvatars } from './HostAvatars'

describe('HostAvatars', () => {
  it('renders AvatarGroup with src1 and src2 avatars when NOT admin', () => {
    const { getByTestId, getAllByRole } = render(
      <HostAvatars src1="avatar1.jpg" src2="avatar2.jpg" admin={false} />
    )

    const avatarGroupElement = getByTestId('journeys-avatars')
    expect(avatarGroupElement).toBeInTheDocument()

    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })

  it('renders AccountCircleOutlinedIcon when admin and no src avatars', () => {
    const { getByTestId } = render(
      <HostAvatars src1={undefined} src2={undefined} admin />
    )

    const adminPlaceholderElement = getByTestId('account-circled-out-icon')
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('renders AvatarGroup with one avatar and AccountCircleOutlinedIcon when admin and one src avatar', () => {
    const { getByTestId, getByRole } = render(
      <HostAvatars src1="avatar1.jpg" src2={undefined} admin />
    )

    const avatarGroupElement = getByTestId('journeys-admin-render-one-avatar')
    expect(avatarGroupElement).toBeInTheDocument()

    const avatars = getByRole('img')
    expect(avatars).toBeInTheDocument()
    const adminPlaceholderElement = getByTestId('account-circled-out-icon')
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('renders AvatarGroup with two src avatars when admin and both src avatars provided', () => {
    const { getByTestId, getAllByRole } = render(
      <HostAvatars src1="avatar1.jpg" src2="avatar2.jpg" admin />
    )

    const avatarGroupElement = getByTestId('journeys-admin-render-two-avatars')
    expect(avatarGroupElement).toBeInTheDocument()

    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })
})
