import { fireEvent, render } from '@testing-library/react'

import { NavigationDrawer } from './NavigationDrawer'

describe('NavigationDrawer', () => {
  it('should show toggle and call onClose with false when open', async () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(
      <NavigationDrawer open onClose={handleClose} />
    )
    fireEvent.click(getByTestId('NavigationListItemToggle'))
    expect(handleClose).toHaveBeenCalledWith(false)
  })

  it('should show toggle and call onClose with false when not open', async () => {
    const handleClose = jest.fn()
    const { getByTestId } = render(<NavigationDrawer onClose={handleClose} />)
    fireEvent.click(getByTestId('NavigationListItemToggle'))
    expect(handleClose).toHaveBeenCalledWith(true)
  })

  it('should show selected resource link when selected page resources', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open selectedPage="resources" />
    )
    expect(getByTestId('NavigationListItemResources')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemResources')).toHaveAttribute(
      'href',
      '/resources'
    )
  })

  it('should show selected channels link when selected page channels', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open selectedPage="channels" />
    )
    expect(getByTestId('NavigationListItemChannels')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemChannels')).toHaveAttribute(
      'href',
      '/channels'
    )
  })

  it('should show selected resource batches when selected page batches', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open selectedPage="batches" />
    )
    expect(getByTestId('NavigationListItemBatches')).toHaveClass('Mui-selected')
    expect(getByTestId('NavigationListItemBatches')).toHaveAttribute(
      'href',
      '/batches'
    )
  })

  it('should show selected shorts-links link when selected page short-links', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open selectedPage="short-links" />
    )
    expect(getByTestId('NavigationListItemShortLinks')).toHaveClass(
      'Mui-selected'
    )
    expect(getByTestId('NavigationListItemShortLinks')).toHaveAttribute(
      'href',
      '/short-links'
    )
  })

  it('should show selected videos link when selected page videos', async () => {
    const { getByTestId } = render(
      <NavigationDrawer open selectedPage="videos" />
    )
    expect(getByTestId('NavigationListItemVideos')).toHaveClass('Mui-selected')
    expect(getByTestId('NavigationListItemVideos')).toHaveAttribute(
      'href',
      '/videos'
    )
  })
})
