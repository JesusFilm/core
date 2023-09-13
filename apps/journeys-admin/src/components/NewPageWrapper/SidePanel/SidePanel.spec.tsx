import Typography from '@mui/material/Typography'
import { fireEvent, render, within } from '@testing-library/react'

import { PageProvider } from '../../../libs/PageWrapperProvider'

import { SidePanel } from '.'

describe('SidePanel', () => {
  it('should render side panel props', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(
      <PageProvider
        initialState={{
          mobileDrawerOpen: true
        }}
      >
        <SidePanel title="Side Panel Title" onClose={onClose}>
          <Typography variant="h1">Side Panel</Typography>
        </SidePanel>
      </PageProvider>
    )

    expect(getByTestId('side-panel')).toBeInTheDocument()
    expect(getByTestId('mobile-side-panel')).toBeInTheDocument()

    const desktopDrawer = within(getByTestId('side-panel'))
    const mobileDrawer = within(getByTestId('mobile-side-panel'))

    expect(desktopDrawer.getByTestId('side-header')).toHaveTextContent(
      'Side Panel Title'
    )
    expect(desktopDrawer.getByTestId('side-body')).toHaveTextContent(
      'Side Panel'
    )
    expect(
      desktopDrawer.queryByTestId('close-side-drawer')
    ).not.toBeInTheDocument()

    expect(mobileDrawer.getByTestId('side-header')).toHaveTextContent(
      'Side Panel Title'
    )
    expect(mobileDrawer.getByTestId('side-body')).toHaveTextContent(
      'Side Panel'
    )
    expect(mobileDrawer.getByTestId('close-side-drawer')).toBeInTheDocument()

    fireEvent.click(mobileDrawer.getByTestId('close-side-drawer'))

    expect(onClose).toHaveBeenCalled()
  })
})
