import { fireEvent, render, waitFor } from '@testing-library/react'

import { blockHistoryVar, treeBlocksVar } from '@core/journeys/ui/block'
import { showNavigationVar } from '@core/journeys/ui/block/block'

import { NavigationButton } from './NavigationButton'

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
  it('should show navigation arrows on mouse over', async () => {
    showNavigationVar(false)
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <NavigationButton variant="next" alignment="right" />
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
      <NavigationButton variant="next" alignment="right" />
    )
    expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()

    await waitFor(
      () => {
        expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
      },
      { timeout: 3000 }
    )
  })

  describe('ltr', () => {
    it('should call nextActiveBlock on next button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])

      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="right" />
      )
      fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should call prevActiveBlock on prev button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <NavigationButton variant="prev" alignment="left" />
      )
      expect(blockHistoryVar()[1].id).toBe('step2.id')

      fireEvent.click(getByTestId('ConductorNavigationButtonPrev'))

      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })

    it('should hide left button if on first card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])
      const { getByTestId } = render(
        <NavigationButton variant="prev" alignment="left" />
      )

      expect(getByTestId('ConductorNavigationButtonPrev')).not.toBeVisible()
    })

    it('should hide right button if next step is locked', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="right" />
      )
      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should hide right button if on last card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2, step3])
      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="right" />
      )

      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should show right button if on last card but set to navigate to another card', async () => {
      treeBlocksVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      blockHistoryVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="right" />
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
        <NavigationButton variant="next" alignment="left" />
      )
      fireEvent.click(getByTestId('ConductorNavigationButtonNext'))

      expect(blockHistoryVar()[1].id).toBe('step3.id')
    })

    it('should call prevActiveBlock on prev button click', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <NavigationButton variant="prev" alignment="right" />
      )
      expect(blockHistoryVar()[1].id).toBe('step2.id')

      fireEvent.click(getByTestId('ConductorNavigationButtonPrev'))

      expect(blockHistoryVar()[0].id).toBe('step1.id')
    })

    it('should hide right button if on first card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1])
      const { getByTestId } = render(
        <NavigationButton variant="prev" alignment="right" />
      )

      expect(getByTestId('ConductorNavigationButtonPrev')).not.toBeVisible()
    })

    it('should hide left button if next step is locked', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2])
      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="left" />
      )
      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should hide left button if on last card', () => {
      treeBlocksVar([step1, step2, step3])
      blockHistoryVar([step1, step2, step3])
      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="left" />
      )

      expect(getByTestId('ConductorNavigationButtonNext')).not.toBeVisible()
    })

    it('should show left button if on last card but set to navigate to another card', async () => {
      treeBlocksVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      blockHistoryVar([step1, step2, { ...step3, nextBlockId: step1.id }])
      const { getByTestId } = render(
        <NavigationButton variant="next" alignment="left" />
      )

      fireEvent.mouseOver(getByTestId('ConductorNavigationButtonNext'))

      await waitFor(() => {
        expect(getByTestId('ConductorNavigationButtonNext')).toBeVisible()
      })
    })
  })
})
