import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { type MockedFunction } from 'vitest'

import { useLogout } from '../../libs/useLogout'

import { OptionsMenu } from './OptionsMenu'

vi.mock('../../libs/useLogout', () => ({
  useLogout: vi.fn()
}))

const mockUseLogout = useLogout as MockedFunction<typeof useLogout>

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

const mockRouter = useRouter as MockedFunction<typeof useRouter>

describe('OptionsMenu', () => {
  it('should handle logout', async () => {
    const mockHandleLogOut = vi.fn()
    mockUseLogout.mockReturnValue(mockHandleLogOut)
    render(<OptionsMenu />)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('menuitem', { name: 'Sign Out' }))
    )
    expect(mockHandleLogOut).toHaveBeenCalled()
  })

  it('should handle gettings click', async () => {
    const push = vi.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    render(<OptionsMenu />)

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      fireEvent.click(screen.getByRole('menuitem', { name: 'Settings' }))
    )
    expect(push).toHaveBeenCalled()
  })
})
