import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ContainerHeroMuteButton } from './ContainerHeroMuteButton'

describe('ContainerHeroMuteButton', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly when muted', async () => {
    render(<ContainerHeroMuteButton isMuted={true} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass(
      'p-3 rounded-full bg-black/50 text-white ml-4 -mb-3 mr-1 transition-colors hover:bg-black/70'
    )

    const lineElements = screen.getByTestId('MuteIcon')
    await waitFor(() => {
      expect(lineElements).toBeInTheDocument()
    })
  })

  it('should render correctly when unmuted', async () => {
    render(<ContainerHeroMuteButton isMuted={false} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()

    const lineElements = screen.getByTestId('UnmuteIcon')
    await waitFor(() => {
      expect(lineElements).toBeInTheDocument()
    })
  })

  it('should call onClick handler when clicked', () => {
    render(<ContainerHeroMuteButton isMuted={true} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should have different SVG paths based on muted state', () => {
    const { rerender } = render(
      <ContainerHeroMuteButton isMuted={true} onClick={mockOnClick} />
    )

    const mutedSvg = screen.getByTestId('MuteIcon')
    expect(mutedSvg).toBeInTheDocument()

    const mutedSvgContent = mutedSvg?.innerHTML

    rerender(<ContainerHeroMuteButton isMuted={false} onClick={mockOnClick} />)

    const unmutedSvg = screen.getByTestId('UnmuteIcon')
    expect(unmutedSvg).toBeInTheDocument()

    const unmutedSvgContent = unmutedSvg?.innerHTML
    expect(mutedSvgContent).not.toEqual(unmutedSvgContent)
  })
})
