import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { ResizableTextField } from './ResizableTextField'

describe('ResizableTextField', () => {
  it('should render text', () => {
    render(
      <NextIntlClientProvider locale="en">
        <ResizableTextField
          id="id"
          name="testTextField"
          value="some text"
          disabled
        />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('some text')
  })

  it('should be disabled', () => {
    render(
      <NextIntlClientProvider locale="en">
        <ResizableTextField id="id" name="test" value="some text" disabled />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('some text')
    expect(screen.getByRole('textbox')).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('some text')
  })
})
