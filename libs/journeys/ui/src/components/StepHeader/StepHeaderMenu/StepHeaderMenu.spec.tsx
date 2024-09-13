import { fireEvent, render, screen, within } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyMenuButtonIcon } from '../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { defaultJourney } from '../../TemplateView/data'

import { StepHeaderMenu } from './StepHeaderMenu'

const menuStep = {
  id: 'menuStep.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 1,
  locked: true,
  nextBlockId: null,
  slug: 'menu',
  children: []
}

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({
    query: { stepSlug: 'menu' },
    push: jest.fn(),
    back: jest.fn()
  }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('StepHeaderMenu', () => {
  describe('Journey', () => {
    it('should not render menu icon when icon is null', () => {
      const journey = {
        ...defaultJourney,
        menuButtonIcon: null
      }

      render(
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      expect(screen.queryByTestId('Menu1Icon')).not.toBeInTheDocument()
    })

    it('should render menu icon', () => {
      const journey = {
        ...defaultJourney,
        menuButtonIcon: JourneyMenuButtonIcon.home3
      }

      render(
        <JourneyProvider
          value={{
            journey: { ...journey, menuStepBlock: menuStep },
            variant: 'default'
          }}
        >
          <StepHeaderMenu />
        </JourneyProvider>
      )

      const button = screen.getByRole('button')

      expect(button).toBeInTheDocument()
      expect(within(button).getByTestId('Home3Icon')).toBeInTheDocument()
    })

    it('should render close icon for menu card', () => {
      const journey = {
        ...defaultJourney,
        menuStepBlock: menuStep,
        menuButtonIcon: JourneyMenuButtonIcon.home3,
        blocks: [menuStep]
      }

      render(
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    })

    it('should navigate to menu card when clicked', () => {
      const push = jest.fn()

      mockedUseRouter.mockReturnValue({
        query: { stepSlug: 'menu' },
        push
      } as unknown as NextRouter)

      const journey = {
        ...defaultJourney,
        menuStepBlock: menuStep,
        menuStepBlockId: 'menuStep.id',
        menuButtonIcon: JourneyMenuButtonIcon.home3
      }

      render(
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button'))

      expect(push).toHaveBeenCalledWith('/default/menu')
    })

    it('should navigate back when close button is clicked', () => {
      const back = jest.fn()

      mockedUseRouter.mockReturnValue({
        query: { stepSlug: 'menu' },
        back
      } as unknown as NextRouter)

      const journey = {
        ...defaultJourney,
        menuStepBlock: menuStep,
        menuButtonIcon: JourneyMenuButtonIcon.home3,
        blocks: [menuStep]
      }

      render(
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByRole('button'))

      expect(back).toHaveBeenCalled()
    })
  })

  describe('Admin', () => {
    it('should render placeholder', () => {
      const journey = {
        ...defaultJourney,
        menuButtonIcon: null
      }

      render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      expect(screen.getByTestId('Menu1Icon')).toBeInTheDocument()
    })

    it('should render menu icon', () => {
      const journey = {
        ...defaultJourney,
        menuButtonIcon: JourneyMenuButtonIcon.home3
      }

      render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.getByTestId('Home3Icon')).toBeInTheDocument()
    })

    it('should not navigate when clicked', () => {
      const journey = {
        ...defaultJourney,
        menuButtonIcon: JourneyMenuButtonIcon.home3
      }

      render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <StepHeaderMenu />
        </JourneyProvider>
      )

      expect(screen.getByTestId('Home3Icon')).toBeInTheDocument()
    })
  })
})
