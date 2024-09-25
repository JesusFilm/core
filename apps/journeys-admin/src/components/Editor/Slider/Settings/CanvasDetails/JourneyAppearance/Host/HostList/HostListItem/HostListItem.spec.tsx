import { fireEvent, render, screen } from '@testing-library/react'

import { HostListItem } from './HostListItem'

describe('HostListItem', () => {
  it('renders list item with title, location and avatars with proper data', () => {
    const hostTitle = 'Edmond Shen'
    const hostLocation = 'National Team'

    render(
      <HostListItem
        id="hostId"
        title={hostTitle}
        location={hostLocation}
        src1="pic"
        src2="image"
        onClick={jest.fn}
      />
    )

    expect(screen.getByText(hostTitle)).toBeInTheDocument()
    expect(screen.getByText(hostLocation)).toBeInTheDocument()
    const avatars = screen.getAllByRole('img')
    expect(avatars).toHaveLength(2)
    expect(avatars[0]).toHaveAttribute('src', 'image')
    expect(avatars[1]).toHaveAttribute('src', 'pic')
    const adminPlaceholderElement = screen.queryByTestId(
      'host-avatar-placeholder-solid'
    )
    expect(adminPlaceholderElement).not.toBeInTheDocument()
  })

  it('renders placeholder when no images are set', () => {
    const hostTitle = 'Edmond Shen'

    render(
      <HostListItem
        id="hostId"
        title={hostTitle}
        location={null}
        src1={null}
        src2={null}
        onClick={jest.fn}
      />
    )

    const avatars = screen.queryAllByRole('img')
    expect(avatars).toHaveLength(0)
    const adminPlaceholderElement = screen.queryByTestId(
      'host-avatar-placeholder-solid'
    )
    expect(adminPlaceholderElement).toBeInTheDocument()
  })

  it('passes the correct host data when clicked', () => {
    const handleClick = jest.fn()
    const hostTitle = 'Edmond Shen'
    const hostTitleTwo = 'Siyang Diesel'

    render(
      <>
        <HostListItem
          id="hostId"
          title={hostTitle}
          location={null}
          src1={null}
          src2={null}
          onClick={handleClick}
        />
        <HostListItem
          id="hostIdTwo"
          title={hostTitleTwo}
          location={null}
          src1={null}
          src2={null}
          onClick={handleClick}
        />
      </>
    )

    fireEvent.click(screen.getByText('Edmond Shen'))
    expect(handleClick).toHaveBeenCalledWith('hostId')
    expect(handleClick).not.toHaveBeenCalledWith('hostIdTwo')
  })
})
