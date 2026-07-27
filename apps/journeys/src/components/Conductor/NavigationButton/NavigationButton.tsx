import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import capitalize from 'lodash/capitalize'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useBlocks } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useStepNavigationEvents } from '@core/journeys/ui/useStepNavigationEvents'
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
  variant: 'previous' | 'next'
  alignment: 'left' | 'right'
}

export function NavigationButton({
  variant,
  alignment
}: NavigationButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const { renderMode: journeyVariant } = useJourney()
  const {
    handleNextNavigationEventCreate,
    handlePreviousNavigationEventCreate
  } = useStepNavigationEvents({ t })
  const {
    setShowNavigation,
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
      (activeBlock?.children?.length ?? 0) > 0 &&
      activeBlock?.children?.[0]?.children?.length === 1 &&
      activeBlock?.children?.[0]?.children?.[0]?.__typename === 'VideoBlock'

    if (showNavigation && !isVideoOnlyBlock) {
      setTimeout(() => {
        setShowNavigation(false)
      }, 3000)
    }
  }, [showNavigation, setShowNavigation, activeBlock])

  function handleNavigation(direction: 'next' | 'previous'): void {
    if (journeyVariant === 'admin') return
    if (direction === 'next' && !activeBlock.locked) {
      handleNextNavigationEventCreate(activeBlock)
      nextActiveBlock()
    } else if (direction === 'previous') {
      handlePreviousNavigationEventCreate(activeBlock)
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
