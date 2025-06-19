import { fireEvent, render, screen } from '@testing-library/react'

import { AiEditButton } from './AiEditButton'

jest.mock('../../AiChat', () => ({
  AiChat: () => <div data-testid="mocked-aichat">Mocked AiChat</div>
}))

describe('AiEditButton', () => {
  it('should render button and ai chat', () => {
    render(<AiEditButton />)

    const fabButton = screen.getByTestId('AiEditButton')
    expect(fabButton).toBeInTheDocument()

    const aiChat = screen.getByTestId('mocked-aichat')
    expect(aiChat).toBeInTheDocument()

    // AiChat should not be visible initially
    expect(aiChat).not.toBeVisible()
  })

  it('should open chat when button is clicked', () => {
    render(<AiEditButton />)

    const fabButton = screen.getByTestId('AiEditButton')
    const aiChat = screen.getByTestId('mocked-aichat')
    expect(aiChat).not.toBeVisible()

    fireEvent.click(fabButton)
    expect(aiChat).toBeVisible()
  })

  it('should close chat when button is clicked again', () => {
    render(<AiEditButton />)

    const fabButton = screen.getByTestId('AiEditButton')
    const aiChat = screen.getByTestId('mocked-aichat')
    expect(aiChat).not.toBeVisible()

    fireEvent.click(fabButton)
    expect(aiChat).toBeVisible()

    fireEvent.click(fabButton)
    expect(aiChat).not.toBeVisible()
  })
})
