import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GrowthSpacesSettings } from './GrowthSpacesSettings'

describe('GrowthSpacesSettings', () => {
  it('should render growth space settings', () => {
    render(
      <GrowthSpacesSettings accessId="accessId" accessSecret="accessSecret" />
    )
    expect(screen.getByDisplayValue('accessId')).toBeInTheDocument()
    expect(screen.getByDisplayValue('accessSecret')).toBeInTheDocument()
    // eslint-disable-next-line jest/valid-expect
    expect(screen.getByRole('button', { name: 'Save' }))
  })

  it('should call setAccessId and setAccessSecret on change', async () => {
    const setAccessId = jest.fn()
    const setAccessSecret = jest.fn()
    render(
      <GrowthSpacesSettings
        accessId="accessId"
        accessSecret="accessSecret"
        setAccessId={setAccessId}
        setAccessSecret={setAccessSecret}
      />
    )
    const accessIdInput = screen.getByDisplayValue('accessId')
    fireEvent.change(accessIdInput, {
      target: {
        value: 'newAccessId'
      }
    })
    fireEvent.submit(accessIdInput)
    await waitFor(() => expect(setAccessId).toHaveBeenCalledWith('newAccessId'))

    const accessSecretInput = screen.getByDisplayValue('accessSecret')
    fireEvent.change(accessSecretInput, {
      target: {
        value: 'newAccessSecret'
      }
    })
    fireEvent.submit(accessSecretInput)
    await waitFor(() =>
      expect(setAccessSecret).toHaveBeenCalledWith('newAccessSecret')
    )
  })

  it('should call onClick on save button click', async () => {
    const onClick = jest.fn()
    render(
      <GrowthSpacesSettings
        accessId="accessId"
        accessSecret="accessSecret"
        onClick={onClick}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onClick).toHaveBeenCalled())
  })

  it('should call onDelete on remove button click', async () => {
    const onDelete = jest.fn()
    render(
      <GrowthSpacesSettings
        accessId="accessId"
        accessSecret="accessSecret"
        onDelete={onDelete}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() => expect(onDelete).toHaveBeenCalled())
  })
})
