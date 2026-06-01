import { fireEvent, render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { JourneyListMenu } from '.'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ query: { status: 'active' } }))
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('JourneyListMenu', () => {
  it('should be empty if not needed', () => {
    mockedUseRouter.mockReturnValue({
      query: { status: '' }
    } as unknown as NextRouter)
    const { queryByRole } = render(<JourneyListMenu onClick={vi.fn()} />)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })

  describe('active', () => {
    beforeEach(() => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'active' }
      } as unknown as NextRouter)
    })

    it('should render correctly on active', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={vi.fn()} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Archive All')).toBeInTheDocument()
      expect(getByText('Trash All')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const handleClick = vi.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Archive All'))
      expect(handleClick).toHaveBeenCalledWith('archiveAllActive')
    })

    it('should call trashAllActive', () => {
      const handleClick = vi.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Trash All'))
      expect(handleClick).toHaveBeenCalledWith('trashAllActive')
    })
  })

  describe('archived', () => {
    beforeEach(() => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'archived' }
      } as unknown as NextRouter)
    })

    it('should render correctly on archived', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={vi.fn()} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Unarchive All')).toBeInTheDocument()
      expect(getByText('Trash All')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const handleClick = vi.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Unarchive All'))
      expect(handleClick).toHaveBeenCalledWith('restoreAllArchived')
    })

    it('should call trashAllArchived', () => {
      const handleClick = vi.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Trash All'))
      expect(handleClick).toHaveBeenCalledWith('trashAllArchived')
    })
  })

  describe('trashed', () => {
    beforeEach(() => {
      mockedUseRouter.mockReturnValue({
        query: { status: 'trashed' }
      } as unknown as NextRouter)
    })

    it('should render correctly on trashed', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={vi.fn()} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Restore All')).toBeInTheDocument()
      expect(getByText('Delete All Forever')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const handleClick = vi.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Restore All'))
      expect(handleClick).toHaveBeenCalledWith('restoreAllTrashed')
    })

    it('should call trashAllArchived', () => {
      const handleClick = vi.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Delete All Forever'))
      expect(handleClick).toHaveBeenCalledWith('deleteAllTrashed')
    })
  })
})
