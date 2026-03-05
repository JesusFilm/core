import { fireEvent, render, screen } from '@testing-library/react'

import { JourneyMenuButtonIcon } from '../../../__generated__/globalTypes'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { defaultJourney } from '../TemplateView/data'

import { StepHeader } from '.'

jest.mock('next/legacy/image', () => ({
  __esModule: true,
  default: jest.fn(
    ({ priority, blurDataURL, objectFit, objectPosition, ...props }) => {
      return <img {...props} />
    }
  )
}))

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
            menuButtonIcon: JourneyMenuButtonIcon.home3,
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
              focalTop: 50,
              customizable: null
            }
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

  it('should render information icon when menu button icon is null', () => {
    render(
      <JourneyProvider
        value={{
          journey: { ...defaultJourney, menuButtonIcon: null }
        }}
      >
        <StepHeader />
      </JourneyProvider>
    )
    expect(screen.getByTestId('InformationButton')).toBeInTheDocument()
  })
})
