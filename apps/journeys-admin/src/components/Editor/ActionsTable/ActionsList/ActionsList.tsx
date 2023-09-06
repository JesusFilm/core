import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Box from '@mui/system/Box'
import { ReactElement, useEffect, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContained from '@core/shared/ui/icons/InformationCircleContained'
import X2 from '@core/shared/ui/icons/X2'

import { ActionDetails } from '../../ActionDetails'
import { ActionInformation } from '../../ActionDetails/ActionInformation'
import type { Actions } from '../ActionsTable'

import { ActionsListView } from './ActionsListView'

interface ActionsListProps {
  actions: Actions[]
  goalLabel: (url: string) => string
}

export function ActionsList({
  actions,
  goalLabel
}: ActionsListProps): ReactElement {
  const { dispatch } = useEditor()
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const [selectedAction, setSelectedAction] = useState<string | undefined>(
    actions[0]?.url
  )
  const [open, setOpen] = useState(false)

  const openActionDetails = (url: string): void => {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Goal Details',
      children: (
        <ActionDetails
          url={url}
          goalLabel={goalLabel}
          setSelectedAction={setSelectedAction}
        />
      )
    })
  }

  const handleClick = (url: string): void => {
    setSelectedAction(url)
    if (selectedAction != null) openActionDetails(selectedAction)
  }

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSelectedAction(selectedAction)
    }

    function handleResize(): void {
      if (window.innerWidth > 768 && selectedAction != null) {
        openActionDetails(selectedAction)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction])

  return (
    <>
      <Stack
        sx={{
          gap: mdUp ? 12 : 4,
          mx: mdUp ? 8 : 0
        }}
      >
        <Stack
          sx={{
            mx: mdUp ? 0 : 6
          }}
        >
          <Box
            sx={{
              pb: 3,
              display: 'flex',
              flexDirection: mdUp ? 'row' : 'column-reverse',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h1">The Journey Goals</Typography>
            <Button
              variant="outlined"
              startIcon={
                <InformationCircleContained sx={{ color: 'secondary.light' }} />
              }
              sx={{
                display: 'flex',
                color: 'secondary.main',
                borderColor: 'secondary.main',
                borderRadius: 2,
                alignSelf: mdUp ? 'none' : 'end',
                mb: mdUp ? 0 : 4
              }}
              onClick={() => setOpen(true)}
            >
              <Typography variant="subtitle2">Learn More</Typography>
            </Button>
          </Box>
          <Typography>
            You can change them to your own clicking on the rows of this table
          </Typography>
        </Stack>
        <ActionsListView
          actions={actions}
          selectedAction={selectedAction}
          goalLabel={goalLabel}
          handleClick={handleClick}
        />
      </Stack>
      <Drawer
        anchor={mdUp ? 'right' : 'bottom'}
        variant="temporary"
        open={open}
        elevation={mdUp ? 1 : 0}
        hideBackdrop
        sx={{
          left: {
            xs: 0,
            sm: 'unset'
          },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: mdUp ? 328 : '100%',
            height: '100%',
            display: 'flex'
          }
        }}
      >
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Information
            </Typography>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <X2 />
            </IconButton>
          </Toolbar>
        </AppBar>
        <ActionInformation />
      </Drawer>
    </>
  )
}
