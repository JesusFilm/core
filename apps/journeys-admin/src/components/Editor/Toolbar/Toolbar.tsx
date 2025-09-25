import { gql, useApolloClient, useMutation } from '@apollo/client'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import {
  openBeacon,
  setBeaconPageViewed,
  setBeaconRoute
} from '@core/journeys/ui/beaconHooks'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useNavigationState } from '@core/journeys/ui/useNavigationState'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'

import { GetPlausibleJourneyFlowViewed } from '../../../../__generated__/GetPlausibleJourneyFlowViewed'
import {
  UpdatePlausibleJourneyFlowViewed,
  UpdatePlausibleJourneyFlowViewedVariables
} from '../../../../__generated__/UpdatePlausibleJourneyFlowViewed'
import logo from '../../../../public/taskbar-icon.svg'
import { HelpScoutBeacon } from '../../HelpScoutBeacon'
import { NotificationPopover } from '../../NotificationPopover'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'

import { Items } from './Items'
import { CommandRedoItem } from './Items/CommandRedoItem'
import { CommandUndoItem } from './Items/CommandUndoItem'
import { PreviewItem } from './Items/PreviewItem'
import { JourneyDetails } from './JourneyDetails'
import { Menu } from './Menu'

const JourneyDetailsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Toolbar/JourneyDetails/JourneyDetailsDialog" */ './JourneyDetails/JourneyDetailsDialog/JourneyDetailsDialog'
    ).then((mod) => mod.JourneyDetailsDialog),
  { ssr: false }
)

interface ToolbarProps {
  user?: User
}

export const GET_PLAUSIBLE_JOURNEY_FLOW_VIEWED = gql`
  query GetPlausibleJourneyFlowViewed {
    getJourneyProfile {
      id
      plausibleJourneyFlowViewed
    }
  }
`

export const UPDATE_PLAUSIBLE_JOURNEY_FLOW_VIEWED = gql`
  mutation UpdatePlausibleJourneyFlowViewed(
    $input: JourneyProfileUpdateInput!
  ) {
    journeyProfileUpdate(input: $input) {
      id
      plausibleJourneyFlowViewed
    }
  }
`

export function Toolbar({ user }: ToolbarProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { showAnalytics },
    dispatch
  } = useEditor()
  const { editorAnalytics } = useFlags()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const isNavigating = useNavigationState()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [dialogOpen, setDialogOpen] = useState<boolean | null>(null)

  const helpScoutRef = useRef(null)
  const menuRef = useRef(null)
  const client = useApolloClient()

  const [updatePlausibleJourneyFlowViewed] = useMutation<
    UpdatePlausibleJourneyFlowViewed,
    UpdatePlausibleJourneyFlowViewedVariables
  >(UPDATE_PLAUSIBLE_JOURNEY_FLOW_VIEWED, {
    variables: {
      input: {
        plausibleJourneyFlowViewed: true
      }
    }
  })

  const fetchPlausibleData = useCallback(async () => {
    const { data } = await client.query<GetPlausibleJourneyFlowViewed>({
      query: GET_PLAUSIBLE_JOURNEY_FLOW_VIEWED
    })
    if (showAnalytics === true) {
      setBeaconRoute('/ask/')
      if (smUp) {
        setAnchorEl(helpScoutRef.current)
      } else {
        setAnchorEl(menuRef.current)
      }
      if (data.getJourneyProfile?.plausibleJourneyFlowViewed === true) {
        setAnchorEl(null)
      }
    }
  }, [client, showAnalytics, smUp])

  useEffect(() => {
    if (showAnalytics === true) {
      void fetchPlausibleData()
    }
  }, [showAnalytics, smUp, setAnchorEl, fetchPlausibleData])

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleSocialImageClick(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  }

  function handleDialogOpen(): void {
    setRoute('journeyDetails')
    setDialogOpen(true)
  }

  function handleDialogClose(): void {
    setDialogOpen(false)
  }

  return (
    <Stack
      data-testid="Toolbar"
      direction="row"
      alignItems="center"
      spacing={{ xs: 2, sm: 4 }}
      sx={{
        height: EDIT_TOOLBAR_HEIGHT,
        backgroundColor: 'background.paper',
        px: { xs: 2, sm: 4 },
        flexShrink: 0
      }}
    >
      <IconButton
        component={NextLink}
        href="/"
        data-testid="NextStepsLogo"
        disableRipple
      >
        <Image
          src={logo}
          alt="Next Steps"
          height={32}
          width={32}
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </IconButton>
      <Tooltip title={t('See all journeys')} placement="bottom" arrow>
        <IconButton
          component={NextLink}
          href="/"
          data-testid="ToolbarBackButton"
          disabled={isNavigating}
        >
          <FormatListBulletedIcon />
        </IconButton>
      </Tooltip>
      <Stack
        gap={2}
        direction="row"
        data-testid="CommandUndoRedo"
        sx={{ mr: 1 }}
      >
        <CommandUndoItem variant="icon-button" />
        <CommandRedoItem variant="icon-button" />
      </Stack>
      <Stack
        direction="row"
        gap={2}
        data-testid="JourneyDetails"
        sx={{ minWidth: 0, display: { xs: 'none', md: 'inline-flex' } }}
      >
        <Tooltip
          title={t('Social Image')}
          arrow
          PopperProps={{
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -11]
                }
              }
            ]
          }}
        >
          <Button
            onClick={handleSocialImageClick}
            data-testid="ToolbarSocialImage"
            style={{ backgroundColor: 'transparent', minWidth: 'auto' }}
            disableRipple
            sx={{ px: 0 }}
          >
            <Box
              bgcolor={(theme) => theme.palette.background.default}
              borderRadius="4px"
              width={50}
              height={50}
              justifyContent="center"
              alignItems="center"
              sx={{ display: { xs: 'none', sm: 'flex' }, overflow: 'hidden' }}
            >
              {journey?.primaryImageBlock?.src == null ? (
                <GridEmptyIcon color="secondary" />
              ) : (
                <Box width={50} height={50} sx={{ position: 'relative' }}>
                  <Image
                    src={journey.primaryImageBlock.src}
                    alt={journey.primaryImageBlock.alt}
                    fill
                    style={{
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Button>
        </Tooltip>
        {journey != null ? (
          <Stack flexGrow={1} flexShrink={1} sx={{ minWidth: 0 }}>
            <Box
              flexShrink={1}
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              <Tooltip
                title={t('Click to edit')}
                placement="bottom"
                arrow
                PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: journey.description === '' ? [0, 2] : [0, -10.3]
                      }
                    }
                  ]
                }}
              >
                <Button
                  variant="text"
                  onClick={handleDialogOpen}
                  color="secondary"
                  sx={{
                    maxWidth: 'auto',
                    display: 'block',
                    textAlign: 'left',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    borderRadius: '8px',
                    flexShrink: 1
                  }}
                >
                  <JourneyDetails />
                </Button>
              </Tooltip>
            </Box>
            {dialogOpen != null && (
              <JourneyDetailsDialog
                open={dialogOpen}
                onClose={handleDialogClose}
              />
            )}
          </Stack>
        ) : (
          <Stack flexGrow={1}>
            <Typography
              variant="subtitle1"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              <Skeleton width="40%" />
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: { xs: 'none', md: 'block' } }}
            >
              <Skeleton width="80%" />
            </Typography>
          </Stack>
        )}
      </Stack>
      <Stack
        flexDirection="row"
        gap={2}
        flexGrow={1}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Items />
        <PreviewItem variant="icon-button" />
        <Box ref={menuRef}>
          <Menu user={user} />
        </Box>
        <Box
          ref={helpScoutRef}
          sx={{
            display: { xs: 'none', md: 'block' }
          }}
        >
          <HelpScoutBeacon
            userInfo={{
              name: user?.displayName ?? '',
              email: user?.email ?? ''
            }}
          />
        </Box>
      </Stack>
      {editorAnalytics && (
        <NotificationPopover
          title={t('New Feature Feedback')}
          description={t(
            'We are collecting feedback on the new analytics feature. Please take a moment to share your thoughts.'
          )}
          open={Boolean(anchorEl)}
          currentRef={anchorEl}
          pointerPosition={smUp ? '92%' : '94%'}
          handleClose={() => {
            void updatePlausibleJourneyFlowViewed()
            setAnchorEl(null)
          }}
          popoverAction={{
            label: t('Feedback'),
            handleClick: () => {
              openBeacon()
            }
          }}
        />
      )}
    </Stack>
  )
}
