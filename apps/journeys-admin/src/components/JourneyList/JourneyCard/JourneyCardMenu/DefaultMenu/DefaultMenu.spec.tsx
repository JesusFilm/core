import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { DefaultMenu } from '.'

describe('DefaultMenu', () => {
  it('should render menu for journey', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
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
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Access' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Copy to ...' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
  })

  it('should render menu for templates', () => {
    const { queryByRole, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <DefaultMenu
            id="template-id"
            slug="template-slug"
            status={JourneyStatus.published}
            journeyId="template-id"
            published
            setOpenAccessDialog={noop}
            handleCloseMenu={noop}
            template
            setOpenTrashDialog={noop}
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Trash' })).toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Access' })).not.toBeInTheDocument()
    expect(queryByRole('menuitem', { name: 'Copy to' })).not.toBeInTheDocument()
  })

  it('should call correct functions on Access click', () => {
    const setOpenAccessDialog = jest.fn()
    const handleCloseMenu = jest.fn()

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
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
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Access' }))
    expect(setOpenAccessDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })

  it('should redirect to preview', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <TeamProvider>
            <DefaultMenu
              id="journey-id"
              slug="journey-slug"
              status={JourneyStatus.published}
              journeyId="journey-id"
              published
              setOpenAccessDialog={noop}
              handleCloseMenu={noop}
              setOpenTrashDialog={noop}
            />
          </TeamProvider>
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
          <TeamProvider>
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
          </TeamProvider>
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
          <TeamProvider>
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
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Trash' }))
    expect(setOpenTrashDialog).toHaveBeenCalled()
    expect(handleCloseMenu).toHaveBeenCalled()
  })
})
