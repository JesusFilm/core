import { render } from '@testing-library/react'

import { fakeDate } from '../../../journeyListData'

import { LastModifiedDate } from '.'

describe('LastModifiedDate', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('should show "Edited just now" for recent edits', () => {
    const modifiedDate = '2021-12-11'
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('Edited just now')).toBeInTheDocument()
  })

  it('should show "1 minute ago" for edits 1 minute ago', () => {
    const modifiedDate = '2021-12-10 23:59'
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('1 minute ago')).toBeInTheDocument()
  })

  it('should show "3 hours ago" for edits 3 hours ago', () => {
    const modifiedDate = '2021-12-10 21:00'
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('3 hours ago')).toBeInTheDocument()
  })

  it('should show "10 days ago" for edits 10 days ago', () => {
    const modifiedDate = '2021-12-01'
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('10 days ago')).toBeInTheDocument()
  })

  it('should show "1 month ago" for edits 1 month ago', () => {
    const modifiedDate = '2021-11-11'
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('1 month ago')).toBeInTheDocument()
  })

  it('should show "1 year ago" for edits 1 year ago', () => {
    const modifiedDate = '2020-12-11'
    const { getByText } = render(
      <LastModifiedDate modifiedDate={modifiedDate} />
    )
    expect(getByText('1 year ago')).toBeInTheDocument()
  })
})
