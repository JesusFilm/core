import { fireEvent, render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyListMenu } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyListMenu', () => {
  it('should be empty if not needed', () => {
    mockedUseRouter.mockReturnValue({
      query: { tab: '' }
    } as unknown as NextRouter)
    const { queryByRole } = render(<JourneyListMenu onClick={jest.fn()} />)
    expect(queryByRole('button')).not.toBeInTheDocument()
  })

  describe('active', () => {
    beforeEach(() => {
      mockedUseRouter.mockReturnValue({
        query: { tab: 'active' }
      } as unknown as NextRouter)
    })

    it('should render correctly on active', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={jest.fn()} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Archive All')).toBeInTheDocument()
      expect(getByText('Trash All')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const handleClick = jest.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Archive All'))
      expect(handleClick).toHaveBeenCalledWith('archiveAllActive')
    })

    it('should call trashAllActive', () => {
      const handleClick = jest.fn()
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
        query: { tab: 'archived' }
      } as unknown as NextRouter)
    })

    it('should render correctly on archived', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={jest.fn()} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Unarchive All')).toBeInTheDocument()
      expect(getByText('Trash All')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const handleClick = jest.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Unarchive All'))
      expect(handleClick).toHaveBeenCalledWith('restoreAllArchived')
    })

    it('should call trashAllArchived', () => {
      const handleClick = jest.fn()
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
        query: { tab: 'trashed' }
      } as unknown as NextRouter)
    })

    it('should render correctly on trashed', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={jest.fn()} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Restore All')).toBeInTheDocument()
      expect(getByText('Delete All Forever')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const handleClick = jest.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Restore All'))
      expect(handleClick).toHaveBeenCalledWith('restoreAllTrashed')
    })

    it('should call trashAllArchived', () => {
      const handleClick = jest.fn()
      const { getByText, getByRole } = render(
        <JourneyListMenu onClick={handleClick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Delete All Forever'))
      expect(handleClick).toHaveBeenCalledWith('deleteAllTrashed')
    })
  })
})
