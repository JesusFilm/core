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
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import X2Icon from '@core/shared/ui/icons/X2'

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
  const {
    dispatch,
    state: { selectedComponent }
  } = useEditor()
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleClick = (url?: string): void => {
    dispatch({ type: 'SetSelectedComponentAction', component: url })
  }
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack
        sx={{
          gap: mdUp ? 12 : 4,
          mx: mdUp ? 8 : 0
        }}
        data-testid="ActionsList"
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
            <Typography variant="h1">{t('The Journey Goals')}</Typography>
            <Button
              variant="outlined"
              startIcon={
                <InformationCircleContainedIcon
                  sx={{ color: 'secondary.light' }}
                />
              }
              sx={{
                display: 'flex',
                color: 'secondary.main',
                borderColor: 'secondary.main',
                borderRadius: 2,
                alignSelf: mdUp ? 'none' : 'end',
                mb: mdUp ? 0 : 4
              }}
              onClick={() => handleClick()}
            >
              <Typography variant="subtitle2">{t('Learn More')}</Typography>
            </Button>
          </Box>
          <Typography>
            {t(
              'You can change them to your own clicking on the rows of this table'
            )}
          </Typography>
        </Stack>
        <ActionsListView
          actions={actions}
          selectedAction={selectedComponent}
          goalLabel={goalLabel}
          handleClick={handleClick}
        />
      </Stack>
    </>
  )
}
