import { gql, useMutation, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import { darken, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Zoom from '@mui/material/Zoom'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useEffect, useState } from 'react'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import SettingsIcon from '@core/shared/ui/icons/Settings'

import type { getJourneyFlowBackButtonClicked } from '../../../../__generated__/getJourneyFlowBackButtonClicked'
import type { UpdateJourneyFlowBackButtonClicked } from '../../../../__generated__/UpdateJourneyFlowBackButtonClicked'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../../Drawer'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'

import { Content } from './Content'
import { JourneyFlow } from './JourneyFlow'
import { Settings } from './Settings'

export const UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED = gql`
  mutation UpdateJourneyFlowBackButtonClicked(
    $input: JourneyProfileUpdateInput!
  ) {
    journeyProfileUpdate(input: $input) {
      id
      journeyFlowBackButtonClicked
    }
  }
`

export const GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED = gql`
  query getJourneyFlowBackButtonClicked {
    getJourneyProfile {
      id
      journeyFlowBackButtonClicked
    }
  }
`

export function Slider(): ReactElement {
  const theme = useTheme()
  const [showBackButtonHelp, setShowBackButtonHelp] = useState<
    boolean | undefined
  >(undefined)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [snap, setSnap] = useState<number | string | null>('148px')
  const isMobile = useMediaQuery('@media (max-width: 899px)')
  const {
    state: { activeSlide, activeContent, selectedStep, showAnalytics },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const [updateBackButtonClick] =
    useMutation<UpdateJourneyFlowBackButtonClicked>(
      UPDATE_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
      {
        variables: {
          input: {
            journeyFlowBackButtonClicked: true
          }
        }
      }
    )
  useQuery<getJourneyFlowBackButtonClicked>(
    GET_JOURNEY_FLOW_BACK_BUTTON_CLICKED,
    {
      onCompleted: (data) =>
        setShowBackButtonHelp(
          data?.getJourneyProfile?.journeyFlowBackButtonClicked !== true
        )
    }
  )

  useEffect(() => {
    // Reset canvas focus when transitioning to JourneyFlow
    if (activeSlide === ActiveSlide.JourneyFlow) {
      dispatch({
        type: 'SetSelectedBlockOnlyAction',
        selectedBlock: selectedStep
      })
    }
  }, [activeSlide, selectedStep, dispatch])

  function handlePrev(): void {
    if (showBackButtonHelp === true) void updateBackButtonClick()

    if (
      activeSlide === ActiveSlide.Content &&
      activeContent === ActiveContent.Goals
    ) {
      dispatch({
        type: 'SetActiveContentAction',
        activeContent:
          selectedStep == null ? ActiveContent.Social : ActiveContent.Canvas
      })
    }
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: activeSlide - 1
    })
  }

  function handleMobileSettingsOpen(): void {
    setMobileDrawerOpen(true)
  }

  return (
    <Box
      data-testid="Slider"
      sx={{
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex'
      }}
      className="flex-col md:flex-row"
    >
      {/* back (mobile top) button */}
      <Box
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: activeSlide === ActiveSlide.Content ? 5 : -75,
          right: 0,
          height: 40,
          zIndex: 2,
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          transition: (theme) => theme.transitions.create('top')
        }}
        className="flex md:hidden"
      >
        <IconButton
          sx={{
            backgroundColor: 'background.paper',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'background.paper'
            }
          }}
        >
          <ChevronUpIcon data-testid="ChevronUpIcon" />
        </IconButton>
      </Box>

      {/* back (desktop left) button */}
      <Box
        onClick={handlePrev}
        sx={{
          position: 'fixed',
          top: EDIT_TOOLBAR_HEIGHT,
          bottom: 0,
          left: activeSlide > ActiveSlide.JourneyFlow ? 0 : -103,
          width: 103,
          zIndex: 2,
          cursor: 'pointer',
          alignItems: 'center',
          transition: (theme) =>
            theme.transitions.create('left', { duration: 300, delay: 300 })
        }}
        className="hidden md:flex"
      >
        <IconButton
          sx={{
            backgroundColor: 'background.paper',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider',
            borderRadius: '41px',
            marginLeft: '30px',
            transition: (theme) => theme.transitions.create('background-color'),
            '&:hover': {
              backgroundColor: (theme) =>
                darken(theme.palette.background.paper, 0.1)
            }
          }}
        >
          <ChevronLeftIcon data-testid="ChevronLeftIcon" />
          <Collapse
            in={
              showBackButtonHelp === true && activeSlide === ActiveSlide.Content
            }
            orientation="horizontal"
            style={{ transitionDelay: '300ms' }}
          >
            <Typography sx={{ color: 'primary.main' }} noWrap>
              {t('back to map')}
            </Typography>
          </Collapse>
        </IconButton>
      </Box>

      {/* Mobile view - vertical stack with slide transitions */}
      <Box
        sx={{
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          position: 'relative'
        }}
        className="flex lg:hidden relative flex-col h-full w-full"
      >
        {/* Journey Flow slide */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: activeSlide === ActiveSlide.JourneyFlow ? 1 : 0
          }}
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            activeSlide === ActiveSlide.JourneyFlow
              ? 'translate-y-0'
              : '-translate-y-full'
          }`}
        >
          <Box
            sx={{
              borderRadius: 4,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundSize: '20px 20px',
              backgroundColor: '#eff2f5',
              height: `calc(100% - 50px)`,
              overflow: 'hidden'
            }}
          >
            <JourneyFlow flowType="mobile" />
          </Box>
        </Box>

        {/* Content slide */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: activeSlide === ActiveSlide.Content ? 1 : 0,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: showAnalytics === true ? 'none' : 'auto'
          }}
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            activeSlide === ActiveSlide.Content
              ? 'translate-y-0'
              : 'translate-y-full'
          }`}
        >
          {/* slide bar (mobile bottom) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px'
            }}
          >
            <Zoom in={activeSlide === ActiveSlide.JourneyFlow}>
              <Box
                sx={{
                  width: 56,
                  height: 6,
                  bgcolor: '#AAACBB',
                  borderRadius: '3px'
                }}
              />
            </Zoom>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Content />
          </Box>
        </Box>

        {/* Mobile settings floating action button */}
        {isMobile && activeSlide === ActiveSlide.Content && (
          <Fab
            color="primary"
            onClick={handleMobileSettingsOpen}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
          >
            <SettingsIcon />
          </Fab>
        )}

        {/* Mobile settings drawer */}
        {isMobile && (
          <Drawer
            open={true}
            // onOpenChange={setMobileDrawerOpen}
            direction="bottom"
            data-testid="MobileSettingsDrawer"
            snapPoints={['148px', '355px', 1]}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            modal={false}
          >
            <DrawerContent className="fixed bottom-0 left-0 right-0 z-50">
              <DrawerHeader>
                <DrawerTitle>{t('Settings')}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <Settings />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </Box>

      {/* Desktop view - horizontal layout */}
      <Box
        sx={{
          height: '100%',
          width: '100%',
          position: 'relative'
        }}
        className="hidden lg:flex"
      >
        {/* Journey Flow */}
        <Box
          sx={{
            p: 4,
            width: 'calc(100% - 408px)',
            height: '100%'
          }}
        >
          <Box
            sx={{
              borderRadius: 4,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundSize: '20px 20px',
              backgroundColor: '#eff2f5',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <JourneyFlow flowType="mobile" />
          </Box>
        </Box>

        {/* Content and Settings - slide in from right */}
        <Box
          sx={{
            display: 'flex',
            width: 'calc(120px + 360px)',
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              width: '100%',
              pointerEvents: showAnalytics === true ? 'none' : 'auto'
            }}
            className={`transition-transform duration-300 ease-out ${
              activeSlide !== ActiveSlide.JourneyFlow
                ? 'translate-x-0'
                : 'translate-x-full'
            }`}
          >
            <Box
              sx={{
                p: 4,
                width: 'calc(100% - 120px - 360px)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <Content />
            </Box>
            <Box
              sx={{
                p: 4,
                pb: 0,
                width: DRAWER_WIDTH + 32, // 328 DRAWER_WIDTH + 16px * 2 (padding L & R)
                height: '100%'
              }}
            >
              <Settings />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
