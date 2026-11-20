/* eslint-disable react-hooks/rules-of-hooks */
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useBlocks } from '../../../libs/block/block'
import { TreeBlock } from '../../../libs/block/TreeBlock'
import { useJourney } from '../../../libs/JourneyProvider/JourneyProvider'
import { useStepNavigationEvents } from '../../../libs/useStepNavigationEvents/useStepNavigationEvents'
import { StepFields } from '../../Step/__generated__/StepFields'

interface HotkeyNavigationProps {
  rtl: boolean
}

export function HotkeyNavigation({ rtl }: HotkeyNavigationProps): ReactElement {
  const { renderMode } = useJourney()
  const { blockHistory, nextActiveBlock, previousActiveBlock } = useBlocks()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>
  const { t } = useTranslation('apps-journeys')
  const {
    handleNextNavigationEventCreate,
    handlePreviousNavigationEventCreate
  } = useStepNavigationEvents({ t })

  const handleNavigation = useCallback(
    (direction: 'next' | 'previous'): void => {
      if (renderMode === 'admin') return

      if (
        direction === 'next' &&
        activeBlock?.nextBlockId != null &&
        !activeBlock.locked
      ) {
        handleNextNavigationEventCreate(activeBlock)
        nextActiveBlock()
      } else if (direction === 'previous' && blockHistory.length > 1) {
        handlePreviousNavigationEventCreate(activeBlock)
        previousActiveBlock()
      }
    },
    [
      activeBlock,
      nextActiveBlock,
      previousActiveBlock,
      renderMode,
      blockHistory,
      handleNextNavigationEventCreate,
      handlePreviousNavigationEventCreate
    ]
  )

  if (rtl) {
    useHotkeys('left', () => handleNavigation('next'), { preventDefault: true })
    useHotkeys('right', () => handleNavigation('previous'), {
      preventDefault: true
    })
  } else {
    useHotkeys('left', () => handleNavigation('previous'), {
      preventDefault: true
    })
    useHotkeys('right', () => handleNavigation('next'), {
      preventDefault: true
    })
  }

  return <></>
}
