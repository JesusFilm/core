import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import capitalize from 'lodash/capitalize'
import last from 'lodash/last'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useBlocks } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { ThemeMode } from '../../../../__generated__/globalTypes'
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
  themeMode?: ThemeMode
}

export function NavigationButton({
  variant,
  alignment,
  themeMode
}: NavigationButtonProps): ReactElement {
  const { variant: journeyVariant } = useJourney()
  const {
    setShowNavigation,
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

  function handleNav(direction: 'next' | 'prev'): void {
    if (direction === 'next') {
      nextActiveBlock()
    } else {
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
        top: '50%',
        transform: 'translate(0%, -50%)',
        // StepFooter heights
        zIndex: 2,
        display: 'flex',
        width: { xs: 82, lg: 114 },
        height: '100%',
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
            mx: { xs: 0, lg: 8 },
            p: { xs: 0, lg: 2 },
            color: (theme) =>
              themeMode === ThemeMode.light
                ? theme.palette.common.black
                : theme.palette.common.white
          }}
        >
          {alignment === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Fade>
    </NavigationContainer>
  )
}
