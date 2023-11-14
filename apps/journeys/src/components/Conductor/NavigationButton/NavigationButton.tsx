import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import capitalize from 'lodash/capitalize'
import last from 'lodash/last'
import { ReactElement, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useBlocks } from '@core/journeys/ui/block'
import { StepNextEventCreate } from '@core/journeys/ui/Card/__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from '@core/journeys/ui/Card/__generated__/StepPreviousEventCreate'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { StepFields } from '../../../../__generated__/StepFields'

const LeftNavigationContainer = styled(Box)`
  /* @noflip */
  left: 0;
`
const RightNavigationContainer = styled(Box)`
  /* @noflip */
  right: 0;
`

interface NavigationButtonProps {
  variant: 'prev' | 'next'
  alignment: 'left' | 'right'
}

export function NavigationButton({
  variant,
  alignment
}: NavigationButtonProps): ReactElement {
  const [stepNextEventCreate] = useMutation<StepNextEventCreate>(
    STEP_NEXT_EVENT_CREATE
  )
  const [stepPreviousEventCreate] = useMutation<StepPreviousEventCreate>(
    STEP_PREVIOUS_EVENT_CREATE
  )
  const { t } = useTranslation('journeys')
  const { variant: journeyVariant } = useJourney()
  const {
    setShowNavigation,
    getNextBlock,
    treeBlocks,
    blockHistory,
    showNavigation,
    nextActiveBlock,
    prevActiveBlock
  } = useBlocks()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const onFirstStep = activeBlock === treeBlocks[0]
  const onLastStep = activeBlock === last(treeBlocks)
  const navigateToAnotherBlock =
    activeBlock?.nextBlockId != null &&
    activeBlock?.nextBlockId !== activeBlock.id
  const canNavigate =
    variant === 'prev'
      ? !onFirstStep
      : !onLastStep || (onLastStep && navigateToAnotherBlock)
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

  // should always be called with nextActiveBlock() and prevActiveBlock()
  // should match with other handleNavigationEventCreate functions
  function handleNavigationEventCreate(target: 'next' | 'prev'): void {
    const id = uuidv4()
    const stepName = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const targetBlock =
      target === 'next'
        ? getNextBlock({ id: undefined, activeBlock })
        : (blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>)
    const targetStepName =
      targetBlock != null &&
      getStepHeading(targetBlock.id, targetBlock.children, treeBlocks, t)

    const mutationInput = {
      id,
      blockId: activeBlock.id,
      label: stepName,
      value: targetStepName
    }

    if (target === 'next') {
      void stepNextEventCreate({
        variables: {
          input: {
            ...mutationInput,
            nextStepId: targetBlock?.id
          }
        }
      })
    } else {
      void stepPreviousEventCreate({
        variables: {
          input: {
            ...mutationInput,
            previousStepId: targetBlock?.id
          }
        }
      })
    }

    TagManager.dataLayer({
      dataLayer: {
        event: target === 'next' ? 'step_next' : 'step_prev',
        eventId: id,
        blockId: activeBlock.id,
        stepName,
        targetStepId: targetBlock?.id,
        targetStepName
      }
    })
  }

  function handleNav(direction: 'next' | 'prev'): void {
    if (direction === 'next') {
      handleNavigationEventCreate('next')
      nextActiveBlock()
    } else {
      handleNavigationEventCreate('prev')
      prevActiveBlock()
    }
  }

  // Issue using https://mui.com/material-ui/guides/right-to-left/#emotion-amp-styled-components for justifyContent
  const alignSx =
    variant === 'prev'
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
        // StepFooter heights
        bottom: { xs: '170px', sm: '133px', lg: '60.5px' },
        zIndex: 2,
        display: 'flex',
        width: { xs: 82, lg: 114 },
        height: {
          xs: 'calc(100vh - 275px)',
          sm: 'calc(100vh - 238px)',
          lg: 'calc(100% - 105px)'
        },
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
          onClick={() => handleNav(variant)}
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
