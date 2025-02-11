import { render } from '@testing-library/react'

import { LastModifiedDate } from '.'

describe('LastModifiedDate', () => {
  it('should show "Edited just now" for recent edits', () => {
    const { getByText } = render(
      <LastModifiedDate modifiedDate={new Date().toISOString()} />
    )
    expect(getByText('Edited just now')).toBeInTheDocument()
  })

  it('should show "1 minute ago" for edits 1 minute ago', () => {
    const modifiedDate = new Date(Date.now() - 60 * 1000).toISOString()
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('1 minute ago')).toBeInTheDocument()
  })

  it('should show "3 hours ago" for edits 3 hours ago', () => {
    const modifiedDate = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('3 hours ago')).toBeInTheDocument()
  })

  it('should show "10 days ago" for edits 10 days ago', () => {
    const modifiedDate = new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('10 days ago')).toBeInTheDocument()
  })

  it('should show "1 month ago" for edits 1 month ago', () => {
    const modifiedDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('1 month ago')).toBeInTheDocument()
  })

  it('should show "1 year ago" for edits 1 year ago', () => {
    const modifiedDate = new Date(
      Date.now() - 365 * 24 * 60 * 60 * 1000
    ).toISOString()
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('1 year ago')).toBeInTheDocument()
  })
})
