import { fireEvent, render, screen } from '@testing-library/react'

import type { BlockFields } from '../../../../__generated__/BlockFields'

import { AiBuilderPreview } from './AiBuilderPreview'

function stepWithCard(name: string, order: number): BlockFields[] {
  return [
    {
      __typename: 'StepBlock',
      id: name,
      parentBlockId: null,
      parentOrder: order,
      locked: false,
      nextBlockId: null,
      slug: null
    },
    {
      __typename: 'CardBlock',
      id: `${name}-card`,
      parentBlockId: name,
      parentOrder: 0,
      backgroundColor: null,
      backdropBlur: null,
      coverBlockId: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      eventLabel: null,
      showAssistant: false,
      expandChatByDefault: false
    }
  ]
}

describe('AiBuilderPreview', () => {
  it('shows a placeholder before there is a journey', () => {
    render(<AiBuilderPreview blocks={[]} />)

    expect(
      screen.getByText('Your journey preview will appear here.')
    ).toBeInTheDocument()
  })

  it('shows one card at a time and steps through them', () => {
    render(
      <AiBuilderPreview
        blocks={[...stepWithCard('welcome', 0), ...stepWithCard('close', 1)]}
      />
    )

    expect(screen.getByText('Card 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('welcome')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous card' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next card' }))

    expect(screen.getByText('Card 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('close')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next card' })).toBeDisabled()
  })
})
