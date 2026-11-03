import { MockedProvider } from '@apollo/client/testing/react'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

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
  it('blocks card clicks while allowing wheel events through the preview', async () => {
    const onWheel = vi.fn()
    const { container } = render(
      <MockedProvider>
        <AiBuilderPreview
          blocks={[
            ...stepWithCard('welcome', 0),
            {
              __typename: 'ButtonBlock',
              id: 'continue',
              parentBlockId: 'welcome-card',
              parentOrder: 0,
              label: 'Continue',
              buttonVariant: null,
              buttonColor: null,
              size: null,
              startIconId: null,
              endIconId: null,
              submitEnabled: false,
              action: null,
              settings: null,
              eventLabel: null
            }
          ]}
        />
      </MockedProvider>
    )
    const iframe = container.querySelector('iframe')
    expect(iframe).not.toBeNull()
    fireEvent.load(iframe!)
    const button = await waitFor(() =>
      within(iframe!.contentDocument!.body).getByRole('button', {
        name: 'Continue'
      })
    )
    // The capture handler must stop the event before a real block receives it.
    const onClick = vi.fn((event: Event) => event.stopImmediatePropagation())
    button.addEventListener('click', onClick)
    iframe!.contentDocument!.body.addEventListener('wheel', onWheel)

    expect(fireEvent.click(button)).toBe(false)
    expect(onClick).not.toHaveBeenCalled()
    expect(fireEvent.wheel(button, { deltaY: 300 })).toBe(true)
    expect(onWheel).toHaveBeenCalledOnce()
  })

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
