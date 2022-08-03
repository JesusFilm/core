import { fireEvent, render } from '@testing-library/react'
import { noop } from 'lodash'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { DefaultMenu } from '.'

describe('DefaultMenu', () => {
  it('should render menu items', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="journeyId"
            slug="journey-slug"
            status={JourneyStatus.draft}
            journeyId="journey-id"
            published={false}
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should call correct functions on Access click', () => {
    const setOpenAccessDialog = jest.fn()
    const handleCloseMenu = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="journey-id"
            slug="journey-slug"
            status={JourneyStatus.draft}
            journeyId="journey-id"
            published={false}
            setOpenAccessDialog={setOpenAccessDialog}
            handleCloseMenu={handleCloseMenu}
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Access' }))
    expect(setOpenAccessDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should handle preview', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="journey-id"
            slug="journey-slug"
            status={JourneyStatus.published}
            journeyId="journey-id"
            published={true}
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Preview' })).not.toBeDisabled()
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=journey-slug'
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should disable preview button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="journey-id"
            slug="journey-slug"
            status={JourneyStatus.draft}
            journeyId="journey-id"
            published={false}
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('should call correct functions on Delete click', () => {
    const handleCloseMenu = jest.fn()
    const setOpenTrashDialog = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="journey-id"
            slug="journey-slug"
            status={JourneyStatus.draft}
            journeyId="journey-id"
            published={false}
            setOpenAccessDialog={noop}
            handleCloseMenu={handleCloseMenu}
            setOpenTrashDialog={setOpenTrashDialog}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Trash' }))
    expect(setOpenTrashDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should show menu for templates', () => {
    const { queryByRole, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="template-id"
            slug="template-slug"
            status={JourneyStatus.published}
            journeyId="template-id"
            published={true}
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template={true}
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/api/preview?slug=template-slug'
    )
    expect(queryByRole('menuitem', { name: 'Access' })).not.toBeInTheDocument()
  })
})
