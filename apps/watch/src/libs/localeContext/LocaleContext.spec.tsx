import { fireEvent, render } from '@testing-library/react'
import { ReactElement } from 'react'

import { LocaleProvider, useLocale } from './LocaleContext'

const handleClick = jest.fn()

const TestComponent = (): ReactElement => {
  const locale = useLocale()

  return (
    <button
      onClick={() => {
        handleClick(locale)
      }}
    />
  )
}

describe('VideoContext', () => {
  it('should pass the video data', () => {
    const { getByRole } = render(
      <LocaleProvider locale="en">
        <TestComponent />
      </LocaleProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith({
      locale: 'en'
    })
  })
})
