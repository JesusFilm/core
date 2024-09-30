import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../__generated__/JourneyFields'
import { ThemeProvider } from '../../../../../ThemeProvider'

import { Post } from '.'

describe('Post', () => {
  it('should display blank socialpreviewpost', () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id'
          } as unknown as Journey
        }}
      >
        <ThemeProvider>
          <Post />
        </ThemeProvider>
      </JourneyProvider>
    )
    expect(screen.getByTestId('social-preview-post-empty')).toBeInTheDocument()
  })

  it('should display social preview post', () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id',
            primaryImageBlock: {
              src: 'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
            },
            seoDescription: 'journey description',
            seoTitle: 'journey title'
          } as unknown as Journey
        }}
      >
        <ThemeProvider>
          <Post />
        </ThemeProvider>
      </JourneyProvider>
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    )
    expect(screen.getByText('journey title')).toBeInTheDocument()
    expect(screen.getByText('journey description')).toBeInTheDocument()
  })

  it('should render social image tooltip', async () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id'
          } as unknown as Journey
        }}
      >
        <ThemeProvider>
          <Post />
        </ThemeProvider>
      </JourneyProvider>
    )

    const preview = screen.getByTestId('social-preview-post-empty')

    await userEvent.hover(preview)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Social Image')).toBeVisible()
  })

  it('should render headline tooltip', async () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id'
          } as unknown as Journey
        }}
      >
        <ThemeProvider>
          <Post />
        </ThemeProvider>
      </JourneyProvider>
    )

    const headline = screen.getByTestId('HeadlineSkeleton')

    await userEvent.hover(headline)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Headline')).toBeVisible()
  })

  it('should render secondary text tooltip', async () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id'
          } as unknown as Journey
        }}
      >
        <ThemeProvider>
          <Post />
        </ThemeProvider>
      </JourneyProvider>
    )

    const headline = screen.getByTestId('SecondaryTextSkeleton')

    await userEvent.hover(headline)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Secondary Text')).toBeVisible()
  })
})
