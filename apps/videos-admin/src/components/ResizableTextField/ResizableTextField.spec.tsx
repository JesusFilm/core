import { fireEvent, render, screen } from '@testing-library/react'

import { ResizableTextField } from './ResizableTextField'

describe('ResizableTextField', () => {
  it('should render text', () => {
    render(
      <ResizableTextField
        id="id"
        name="testTextField"
        value="some text"
        disabled
      />
    )

    expect(screen.getByRole('textbox')).toHaveValue('some text')
  })

  it('should be disabled', () => {
    render(
      <ResizableTextField id="id" name="test" value="some text" disabled />
    )

    expect(screen.getByRole('textbox')).toHaveValue('some text')
    expect(screen.getByRole('textbox')).toBeDisabled()
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new text' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('some text')
  })
})
