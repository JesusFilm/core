import { render } from '@testing-library/react'
import { HostListItem } from './HostListItem'

describe('HostListCard', () => {
  it('renders host title and location', () => {
    const hostTitle = 'Edmond Shen'
    const hostLocation = 'National Team'

    const { getByText } = render(
      <HostListItem hostTitle={hostTitle} hostLocation={hostLocation} />
    )

    expect(getByText(hostTitle)).toBeInTheDocument()
    expect(getByText(hostLocation)).toBeInTheDocument()
  })

  it('renders host title without location', () => {
    const hostTitle = 'Edmond Shen'
    const hostLocation = 'National Team'

    const { getByText, queryByText } = render(
      <HostListItem hostTitle={hostTitle} />
    )

    expect(getByText(hostTitle)).toBeInTheDocument()
    expect(queryByText(hostLocation)).not.toBeInTheDocument()
  })

  it('renders both host avatars ', () => {
    const hostTitle = 'Edmond Shen'

    const { getAllByRole } = render(
      <HostListItem hostTitle={hostTitle} avatarSrc1="pic" avatarSrc2="pic" />
    )

    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(2)
  })
  it('renders only one host avatar with no placeholders', () => {
    const hostTitle = 'Edmond Shen'

    const { getAllByRole, queryByTestId } = render(
      <HostListItem hostTitle={hostTitle} avatarSrc1="pic" />
    )

    const avatars = getAllByRole('img')
    expect(avatars).toHaveLength(1)
    const adminPlaceholderElement = queryByTestId(
      'host-avatar-placeholder-solid'
    )
    expect(adminPlaceholderElement).not.toBeInTheDocument()
  })

  it('renders placeholder when no images are set', () => {
    const hostTitle = 'Edmond Shen'

    const { queryAllByRole, queryByTestId } = render(
      <HostListItem hostTitle={hostTitle} />
    )

    const avatars = queryAllByRole('img')
    expect(avatars).toHaveLength(0)
    const adminPlaceholderElement = queryByTestId(
      'host-avatar-placeholder-solid'
    )
    expect(adminPlaceholderElement).toBeInTheDocument()
  })
})
