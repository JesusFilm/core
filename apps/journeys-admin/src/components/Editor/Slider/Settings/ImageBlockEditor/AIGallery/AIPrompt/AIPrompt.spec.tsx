import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'

import { AIPrompt } from './AIPrompt'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('AIPrompt', () => {
  it('should validate form on incorrect input', async () => {
    const { getByText, getByRole } = render(
      <>
        <AIPrompt handleSubmit={noop} />
      </>
    )

    const promptBox = getByRole('textbox', { name: 'Prompt' })
    const promptSubmitButton = getByRole('button', { name: 'Prompt' })
    fireEvent.click(promptBox)
    await fireEvent.change(promptBox, { target: { value: '' } })
    await fireEvent.click(promptSubmitButton)
    await waitFor(() =>
      expect(
        getByText('Prompt must be at least one character')
      ).toBeInTheDocument()
    )
  })
})
