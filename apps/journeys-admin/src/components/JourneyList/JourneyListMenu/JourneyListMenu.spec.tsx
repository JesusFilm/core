import { fireEvent, render } from '@testing-library/react'
import { NextRouter } from 'next/router'
import JourneyListMenu from './JourneyListMenu'

const onclick = jest.fn()

describe('JourneyListMenu', () => {
  it('should be empty if not needed', () => {
    const router = { query: { tab: '' } } as unknown as NextRouter
    const { queryByRole } = render(
      <JourneyListMenu router={router} onClick={onclick} />
    )
    expect(queryByRole('button')).toBeNull()
  })

  describe('active', () => {
    const router = { query: { tab: 'active' } } as unknown as NextRouter
    it('should render correctly on active', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Archive All')).toBeInTheDocument()
      expect(getByText('Trash All')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Archive All'))
      expect(onclick).toHaveBeenCalledWith('archiveAllActive')
    })

    it('should call trashAllActive', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Trash All'))
      expect(onclick).toHaveBeenCalledWith('trashAllActive')
    })
  })

  describe('archived', () => {
    const router = { query: { tab: 'archived' } } as unknown as NextRouter
    it('should render correctly on archived', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Unarchive All')).toBeInTheDocument()
      expect(getByText('Trash All')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Unarchive All'))
      expect(onclick).toHaveBeenCalledWith('restoreAllArchived')
    })

    it('should call trashAllArchived', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Trash All'))
      expect(onclick).toHaveBeenCalledWith('trashAllArchived')
    })
  })

  describe('trashed', () => {
    const router = { query: { tab: 'trashed' } } as unknown as NextRouter
    it('should render correctly on trashed', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      expect(getByText('Restore All')).toBeInTheDocument()
      expect(getByText('Delete All Forever')).toBeInTheDocument()
    })

    it('should call archiveAllActive', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Restore All'))
      expect(onclick).toHaveBeenCalledWith('restoreAllTrashed')
    })

    it('should call trashAllArchived', () => {
      const { getByText, getByRole } = render(
        <JourneyListMenu router={router} onClick={onclick} />
      )
      fireEvent.click(getByRole('button'))
      fireEvent.click(getByText('Delete All Forever'))
      expect(onclick).toHaveBeenCalledWith('deleteAllTrashed')
    })
  })
})
