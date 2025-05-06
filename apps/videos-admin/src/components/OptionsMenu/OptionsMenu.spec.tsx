import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'

import { useLogout } from '../../libs/useLogout'

import { OptionsMenu } from './OptionsMenu'

jest.mock('../../libs/useLogout', () => ({
  useLogout: jest.fn()
}))

const mockUseLogout = useLogout as jest.MockedFunction<typeof useLogout>

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OptionsMenu', () => {
  it('should handle logout', async () => {
    const mockHandleLogOut = jest.fn()
    mockUseLogout.mockReturnValue(mockHandleLogOut)
    render(<OptionsMenu />)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('menuitem', { name: 'Sign Out' }))
    )
    expect(mockHandleLogOut).toHaveBeenCalled()
  })

  it('should handle gettings click', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    render(<OptionsMenu />)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('menuitem', { name: 'Settings' }))
    )
    expect(push).toHaveBeenCalled()
  })
})
