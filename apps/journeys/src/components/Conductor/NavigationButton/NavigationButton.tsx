import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import { sendGTMEvent } from '@next/third-parties/google'
import capitalize from 'lodash/capitalize'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useBlocks } from '@core/journeys/ui/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import {
  JourneyPlausibleEvents,
  keyify
} from '@core/journeys/ui/plausibleHelpers'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import {
  StepNextEventCreateInput,
  StepPreviousEventCreateInput
} from '../../../../__generated__/globalTypes'
import { StepFields } from '../../../../__generated__/StepFields'
import {
  StepNextEventCreate,
  StepNextEventCreateVariables
} from '../../../../__generated__/StepNextEventCreate'
import {
  StepPreviousEventCreate,
  StepPreviousEventCreateVariables
} from '../../../../__generated__/StepPreviousEventCreate'

const LeftNavigationContainer = styled(Box)`
  /* @noflip */
  left: 0;
`
const RightNavigationContainer = styled(Box)`
  /* @noflip */
  right: 0;
`

interface NavigationButtonProps {
  variant: 'previous' | 'next'
  alignment: 'left' | 'right'
}

export function NavigationButton({
  variant,
  alignment
}: NavigationButtonProps): ReactElement {
  const [stepNextEventCreate] = useMutation<
    StepNextEventCreate,
    StepNextEventCreateVariables
  >(STEP_NEXT_EVENT_CREATE)
  const [stepPreviousEventCreate] = useMutation<
    StepPreviousEventCreate,
    StepPreviousEventCreateVariables
  >(STEP_PREVIOUS_EVENT_CREATE)
  const { t } = useTranslation('apps-journeys')
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant: journeyVariant, journey } = useJourney()
  const {
    setShowNavigation,
    getNextBlock,
    treeBlocks,
    blockHistory,
    showNavigation,
    nextActiveBlock,
    previousActiveBlock
  } = useBlocks()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const canNavigate =
    variant === 'previous'
      ? blockHistory.length > 1
      : activeBlock?.nextBlockId != null
  const disabled = variant === 'next' && activeBlock?.locked

  // Handle fade navigation after 3 seconds inactive
  useEffect(() => {
    const isVideoOnlyBlock =
      activeBlock?.children.length > 0 &&
      activeBlock?.children[0].children.length === 1 &&
      activeBlock?.children[0].children[0].__typename === 'VideoBlock'

    if (showNavigation && !isVideoOnlyBlock) {
      setTimeout(() => {
        setShowNavigation(false)
      }, 3000)
    }
  }, [showNavigation, setShowNavigation, activeBlock])

  // should always be called with nextActiveBlock()
  // should match with other handleNextNavigationEventCreate functions
  // places used:
  // journeys/src/components/Conductor/NavigationButton/NavigationButton.tsx
  // journeys/src/components/Conductor/SwipeNavigation/SwipeNavigation.tsx
  // journeys/src/components/Conductor/HotkeyNavigation/HotkeyNavigation.tsx
  function handleNextNavigationEventCreate(): void {
    const id = uuidv4()
    const stepName = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const targetBlock = getNextBlock({ id: undefined, activeBlock })
    if (targetBlock == null) return
    const targetStepName = getStepHeading(
      targetBlock.id,
      targetBlock.children,
      treeBlocks,
      t
    )
    const input: StepNextEventCreateInput = {
      id,
      blockId: activeBlock.id,
      label: stepName,
      value: targetStepName,
      nextStepId: targetBlock.id
    }
    void stepNextEventCreate({
      variables: {
        input
      }
    })
    if (journey != null)
      plausible('navigateNextStep', {
        u: `${window.location.origin}/${journey.id}/${input.blockId}`,
        props: {
          ...input,
          key: keyify({
            stepId: input.blockId,
            event: 'navigateNextStep',
            blockId: input.blockId,
            target: input.nextStepId
          }),
          simpleKey: keyify({
            stepId: input.blockId,
            event: 'navigateNextStep',
            blockId: input.blockId
          })
        }
      })
    sendGTMEvent({
      event: 'step_next',
      eventId: id,
      blockId: activeBlock.id,
      stepName,
      targetStepId: targetBlock.id,
      targetStepName
    })
  }
  // should always be called with previousActiveBlock()
  // should match with other handlePreviousNavigationEventCreate functions
  // places used:
  // libs/journeys/ui/src/components/Card/Card.tsx
  // journeys/src/components/Conductor/NavigationButton/NavigationButton.tsx
  // journeys/src/components/Conductor/SwipeNavigation/SwipeNavigation.tsx
  // journeys/src/components/Conductor/HotkeyNavigation/HotkeyNavigation.tsx
  function handlePreviousNavigationEventCreate(): void {
    const id = uuidv4()
    const stepName = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const targetBlock = blockHistory[
      blockHistory.length - 2
    ] as TreeBlock<StepFields>
    if (targetBlock == null) return
    const targetStepName = getStepHeading(
      targetBlock.id,
      targetBlock.children,
      treeBlocks,
      t
    )
    const input: StepPreviousEventCreateInput = {
      id,
      blockId: activeBlock.id,
      label: stepName,
      value: targetStepName,
      previousStepId: targetBlock.id
    }
    void stepPreviousEventCreate({
      variables: {
        input
      }
    })
    if (journey != null)
      plausible('navigatePreviousStep', {
        u: `${window.location.origin}/${journey.id}/${input.blockId}`,
        props: {
          ...input,
          key: keyify({
            stepId: input.blockId,
            event: 'navigatePreviousStep',
            blockId: input.blockId,
            target: input.previousStepId
          }),
          simpleKey: keyify({
            stepId: input.blockId,
            event: 'navigatePreviousStep',
            blockId: input.blockId
          })
        }
      })
    sendGTMEvent({
      event: 'step_prev',
      eventId: id,
      blockId: activeBlock.id,
      stepName,
      targetStepId: targetBlock.id,
      targetStepName
    })
  }
  function handleNavigation(direction: 'next' | 'previous'): void {
    if (journeyVariant === 'admin') return
    if (direction === 'next' && !activeBlock.locked) {
      handleNextNavigationEventCreate()
      nextActiveBlock()
    } else if (direction === 'previous') {
      handlePreviousNavigationEventCreate()
      previousActiveBlock()
    }
  }

  // Issue using https://mui.com/material-ui/guides/right-to-left/#emotion-amp-styled-components for justifyContent
  const alignSx =
    variant === 'previous'
      ? {
          justifyContent: 'flex-start',
          ml:
            journeyVariant === 'default'
              ? 'env(safe-area-inset-left)'
              : 'inherit'
        }
      : {
          justifyContent: 'flex-end',
          mr:
            journeyVariant === 'default'
              ? 'env(safe-area-inset-right)'
              : 'inherit'
        }

  const NavigationContainer =
    alignment === 'left' ? LeftNavigationContainer : RightNavigationContainer

  return (
    <NavigationContainer
      data-testid={`ConductorNavigationContainer${capitalize(variant)}`}
      onMouseOver={() => setShowNavigation(true)}
      sx={{
        ...alignSx,
        position: 'absolute',
        top: 0,
        zIndex: 2,
        display: 'flex',
        width: { xs: 82, lg: 114 },
        height: '100dvh',
        alignItems: 'center',
        pointerEvents: 'none'
      }}
    >
      <Fade
        in={canNavigate && showNavigation && !disabled}
        timeout={{ appear: 300, exit: 1000 }}
      >
        <IconButton
          data-testid={`ConductorNavigationButton${capitalize(variant)}`}
          size="small"
          onClick={() => handleNavigation(variant)}
          disableRipple
          sx={{
            pointerEvents: 'all',
            mx: { xs: 2, lg: 8 },
            p: 2,
            color: (theme) => theme.palette.common.white,
            backgroundColor: (theme) => `${theme.palette.grey[700]}33`,
            '&:hover': {
              color: (theme) => theme.palette.common.white,
              backgroundColor: (theme) => `${theme.palette.grey[700]}4d`
            }
          }}
        >
          {alignment === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Fade>
    </NavigationContainer>
  )
}
