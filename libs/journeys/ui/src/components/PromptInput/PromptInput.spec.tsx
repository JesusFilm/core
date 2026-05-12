import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MAX_MESSAGE_CHARS, PromptInput } from './PromptInput'

function noop(): void {
  // intentionally empty
}

describe('PromptInput', () => {
  describe('character cap UX (NES-1579)', () => {
    it('sets maxLength=MAX_MESSAGE_CHARS on the underlying textarea', () => {
      render(
        <PromptInput
          input=""
          onInputChange={noop}
          onSubmit={noop}
          isLoading={false}
        />
      )
      const textarea = screen.getByRole('textbox', {
        name: 'Chat message input'
      })
      expect(textarea).toHaveAttribute('maxlength', String(MAX_MESSAGE_CHARS))
    })

    it('hides the character counter below 75% of the cap', () => {
      render(
        <PromptInput
          input={'x'.repeat(Math.floor(MAX_MESSAGE_CHARS * 0.75) - 1)}
          onInputChange={noop}
          onSubmit={noop}
          isLoading={false}
        />
      )
      expect(screen.queryByTestId('prompt-input-counter')).toBeNull()
    })

    it('shows the counter once input reaches 75% of the cap', () => {
      const len = Math.floor(MAX_MESSAGE_CHARS * 0.75)
      render(
        <PromptInput
          input={'x'.repeat(len)}
          onInputChange={noop}
          onSubmit={noop}
          isLoading={false}
        />
      )
      const counter = screen.getByTestId('prompt-input-counter')
      expect(counter).toHaveTextContent(`${len}/${MAX_MESSAGE_CHARS}`)
    })

    it('renders the counter at the cap with the live count', () => {
      render(
        <PromptInput
          input={'x'.repeat(MAX_MESSAGE_CHARS)}
          onInputChange={noop}
          onSubmit={noop}
          isLoading={false}
        />
      )
      expect(screen.getByTestId('prompt-input-counter')).toHaveTextContent(
        `${MAX_MESSAGE_CHARS}/${MAX_MESSAGE_CHARS}`
      )
    })

    it('truncates an over-cap paste and surfaces the clipped value to onInputChange', () => {
      const onInputChange = jest.fn()
      render(
        <PromptInput
          input=""
          onInputChange={onInputChange}
          onSubmit={noop}
          isLoading={false}
        />
      )
      const textarea = screen.getByRole('textbox', {
        name: 'Chat message input'
      })

      const oversized = 'a'.repeat(MAX_MESSAGE_CHARS + 500)
      fireEvent.paste(textarea, {
        clipboardData: { getData: () => oversized }
      })

      expect(onInputChange).toHaveBeenCalledTimes(1)
      const next = onInputChange.mock.calls[0][0] as string
      expect(next).toHaveLength(MAX_MESSAGE_CHARS)
      expect(next).toBe(oversized.slice(0, MAX_MESSAGE_CHARS))
    })

    it('lets a within-cap paste pass through untouched (browser handles it)', () => {
      const onInputChange = jest.fn()
      render(
        <PromptInput
          input="hello "
          onInputChange={onInputChange}
          onSubmit={noop}
          isLoading={false}
        />
      )
      const textarea = screen.getByRole('textbox', {
        name: 'Chat message input'
      })

      fireEvent.paste(textarea, {
        clipboardData: { getData: () => 'world' }
      })

      // No manual override of the value — the native paste runs.
      expect(onInputChange).not.toHaveBeenCalled()
    })

    it('shakes the form when the user types at the cap', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <PromptInput
          input={'x'.repeat(MAX_MESSAGE_CHARS)}
          onInputChange={noop}
          onSubmit={noop}
          isLoading={false}
        />
      )
      const form = container.querySelector('form')
      expect(form).not.toBeNull()
      expect(form?.className).not.toMatch(/prompt-input-shake/)

      await user.type(
        screen.getByRole('textbox', { name: 'Chat message input' }),
        'a'
      )

      expect(form?.className).toMatch(/prompt-input-shake/)
    })
  })
})
