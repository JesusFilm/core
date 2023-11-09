import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import { blockHistoryVar, treeBlocksVar } from '@core/journeys/ui/block'
import { showNavigationVar } from '@core/journeys/ui/block/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREV_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'

import { NavigationButton } from './NavigationButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

const step1 = {
  id: 'step1.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step3.id',
  children: []
}
const step2 = {
  id: 'step2.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 1,
  locked: true,
  nextBlockId: null,
  children: []
}
const step3 = {
  id: 'step3.id',
  __typename: 'StepBlock' as const,
  parentBlockId: null,
  parentOrder: 2,
  locked: false,
  nextBlockId: null,
  children: []
}

describe('NavigationButton', () => {
  mockUuidv4.mockReturnValue('uuid')

  const stepNextResult = jest.fn(() => ({
    data: {
      stepNextEventCreate: {
        id: 'uuid',
        __typename: 'StepNextEvent'
      }
    }
  }))
  const stepPrevResult = jest.fn(() => ({
    data: {
      stepPrevEventCreate: {
        id: 'uuid',
        __typename: 'StepPrevEvent'
      }
    }
  }))

  const stepNextEventCreateMock = {
    request: {
      query: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step1.id',
          nextStepId: 'step3.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: stepNextResult
  }

  const stepPrevEventCreateMock = {
    request: {
      query: STEP_PREV_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step2.id',
          prevStepId: 'step1.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: stepPrevResult
  }

  it('should show navigation arrows on mouse over', async () => {
    showNavigationVar(false)
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <NavigationButton variant="next" alignment="right" />
      </MockedProvider>
    )
    expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()

    fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

    await waitFor(() => {
      expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
    })
  })

  it('should hide navigation arrows after 3 seconds', async () => {
    showNavigationVar(true)
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider>
        <NavigationButton variant="next" alignment="right" />
      </MockedProvider>
    )
    expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()

    await waitFor(
      () => {
        expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
      },
      { timeout: 3000 }
    )
  })

  it('should create stepNextEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[stepNextEventCreateMock]}>
        <NavigationButton variant="next" alignment="right" />
      </MockedProvider>
    )
    fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

    await waitFor(() => expect(stepNextResult).toHaveBeenCalled())

    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'step_next',
        eventId: 'uuid',
        blockId: 'step1.id',
        stepName: 'Step {{number}}',
        targetStepId: 'step3.id',
        targetStepName: 'Step {{number}}'
      }
    })
  })

  it('should create stepPrevEvent', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[stepPrevEventCreateMock]}>
        <NavigationButton variant="prev" alignment="left" />
      </MockedProvider>
    )
    fireEvent.click(getByTestId('ConductorNavigationButtonPrev'))

    await waitFor(() => expect(stepPrevResult).toHaveBeenCalled())

    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'step_prev',
        eventId: 'uuid',
        blockId: 'step2.id',
        stepName: 'Step {{number}}',
        targetStepId: 'step1.id',
        targetStepName: 'Step {{number}}'
      }
    })
  })

  describe('ltr', () => {
    it('should call nextActiveBlock on next button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      const { getByTestId } = render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )
      fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should call prevActiveBlock on prev button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider mocks={[stepPrevEventCreateMock]}>
          <NavigationButton variant="prev" alignment="left" />
        </MockedProvider>
      )
      expect(blockHistoryVar()[1].id).toBe('step2.id')

      fireEvent.click(getByTestId('ConductorNavigationButtonPrev'))

      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })

    it('should hide left button if on first card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="prev" alignment="left" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonPrev')).not.toBeVisible()
    })

    it('should hide right button if next step is locked', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )
      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should hide right button if on last card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2, step3])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should show right button if on last card but set to navigate to another card', async () => {
      treeBlocksVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      blockHistoryVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      const { getByTestId } = render(
        <MockedProvider
          mocks={[stepNextEventCreateMock, stepPrevEventCreateMock]}
        >
          <NavigationButton variant="next" alignment="right" />
        </MockedProvider>
      )

      fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

      await waitFor(() => {
        expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
      })
    })
  })

  describe('rtl', () => {
    it('should call nextActiveBlock on next button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      const { getByTestId } = render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )
      fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should call prevActiveBlock on prev button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider mocks={[stepPrevEventCreateMock]}>
          <NavigationButton variant="prev" alignment="right" />
        </MockedProvider>
      )
      expect(blockHistoryVar()[1].id).toBe('step2.id')

      fireEvent.click(getByTestId('ConductorNavigationButtonPrev'))

      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })

    it('should hide right button if on first card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="prev" alignment="right" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonPrev')).not.toBeVisible()
    })

    it('should hide left button if next step is locked', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )
      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should hide left button if on last card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2, step3])
      const { getByTestId } = render(
        <MockedProvider>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )

      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should show left button if on last card but set to navigate to another card', async () => {
      treeBlocksVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      blockHistoryVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      const { getByTestId } = render(
        <MockedProvider mocks={[stepNextEventCreateMock]}>
          <NavigationButton variant="next" alignment="left" />
        </MockedProvider>
      )

      fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

      await waitFor(() => {
        expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
      })
    })
  })
})
