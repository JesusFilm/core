import { gql, useMutation } from '@apollo/client'
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
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { StepFields } from '../../../../__generated__/StepFields'
import { StepNextEventCreate } from '../../../../__generated__/StepNextEventCreate'
import { StepPrevEventCreate } from '../../../../__generated__/StepPrevEventCreate'

export const STEP_NEXT_EVENT_CREATE = gql`
  mutation StepNextEventCreate($input: StepNextEventCreateInput!) {
    stepNextEventCreate(input: $input) {
      id
    }
  }
`

export const STEP_PREV_EVENT_CREATE = gql`
  mutation StepPrevEventCreate($input: StepPrevEventCreateInput!) {
    stepPrevEventCreate(input: $input) {
      id
    }
  }
`

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
  const [stepPrevEventCreate] = useMutation<StepPrevEventCreate>(
    STEP_PREV_EVENT_CREATE
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

  function handleNext(): void {
    const id = uuidv4()
    const currentStepHeading = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const nextBlock = getNextBlock({ id: undefined, activeBlock })
    const nextStepHeading: string =
      nextBlock != null
        ? getStepHeading(nextBlock.id, nextBlock.children, treeBlocks, t)
        : t('Unknown step')

    void stepNextEventCreate({
      variables: {
        input: {
          id,
          blockId: activeBlock.id,
          nextStepId: nextBlock?.id,
          label: currentStepHeading,
          value: nextStepHeading
        }
      }
    })

    TagManager.dataLayer({
      dataLayer: {
        event: 'step_next',
        eventId: id
      }
    })

    nextActiveBlock()
  }

  function handlePrev(): void {
    const id = uuidv4()
    const prevStep = blockHistory[
      blockHistory.length - 2
    ] as TreeBlock<StepFields>
    const prevStepId = prevStep.id
    const currentStepHeading = getStepHeading(
      activeBlock.id,
      activeBlock.children,
      treeBlocks,
      t
    )
    const prevStepHeading = getStepHeading(
      prevStep.id,
      prevStep.children,
      treeBlocks,
      t
    )

    void stepPrevEventCreate({
      variables: {
        input: {
          id,
          blockId: activeBlock.id,
          prevStepId,
          label: currentStepHeading,
          value: prevStepHeading
        }
      }
    })

    TagManager.dataLayer({
      dataLayer: {
        event: 'step_prev',
        eventId: id
      }
    })

    prevActiveBlock()
  }

  function handleNav(direction: 'next' | 'prev'): void {
    if (direction === 'next') {
      handleNext()
    } else {
      handlePrev()
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
