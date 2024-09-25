import { fireEvent, render, screen, within } from '@testing-library/react'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { defaultJourney } from '../TemplateView/data'

import { StepHeader } from '.'

describe('StepHeader', () => {
  it('should handleClick', () => {
    const onHeaderClick = jest.fn()
    render(<StepHeader onHeaderClick={onHeaderClick} />)

    fireEvent.click(screen.getByTestId('JourneysStepHeader'))
    expect(onHeaderClick).toHaveBeenCalled()
  })

  it('should render journey elements', () => {
    render(<StepHeader />)

    expect(screen.getByTestId('InformationButton')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-bullets')).toBeInTheDocument()
  })

  it('should render website elements', () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            ...defaultJourney,
            website: true,
            displayTitle: 'Journey display title',
            logoImageBlock: {
              __typename: 'ImageBlock',
              id: 'logoImageBlockId',
              src: 'https://example.com/logo.png',
              alt: 'Logo',
              parentBlockId: null,
              parentOrder: null,
              height: 10,
              width: 10,
              blurhash: 'blurhash',
              scale: 1,
              focalLeft: 50,
              focalTop: 50
            },
            showLogo: true,
            showDisplayTitle: true,
            showMenu: true
          }
        }}
      >
        <StepHeader />
      </JourneyProvider>
    )

    expect(screen.getByText('Journey display title')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/logo.png'
    )
    expect(screen.getByTestId('StepHeaderMenu')).toBeInTheDocument()
  })

  it('should hide elements if they are turned off', () => {
    render(
      <JourneyProvider
        value={{
          journey: {
            ...defaultJourney,
            website: true,
            displayTitle: 'Journey display title',
            logoImageBlock: {
              __typename: 'ImageBlock',
              id: 'logoImageBlockId',
              src: 'https://example.com/logo.png',
              alt: 'Logo',
              parentBlockId: null,
              parentOrder: null,
              height: 10,
              width: 10,
              blurhash: 'blurhash',
              scale: 1,
              focalLeft: 50,
              focalTop: 50
            },
            showLogo: false,
            showDisplayTitle: false,
            showMenu: null
          }
        }}
      >
        <StepHeader />
      </JourneyProvider>
    )

    expect(screen.queryByText('Journey display title')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(
      within(screen.getByTestId('StepHeaderMenu')).queryByTestId('Menu1Icon')
    ).not.toBeInTheDocument()
  })
})
