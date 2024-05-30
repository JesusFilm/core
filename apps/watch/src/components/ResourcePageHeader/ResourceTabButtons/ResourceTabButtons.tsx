import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next'
import React, { ReactElement } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'

interface ResourceTabButtonsProps {
  selectedTab: string
  handleTabChange: (
    _event: React.MouseEvent<HTMLLIElement>,
    newTab: string
  ) => void
}

export function ResourceTabButtons({
  selectedTab,
  handleTabChange
}: ResourceTabButtonsProps): ReactElement {
  const theme = useTheme()
  console.log(theme.spacing(2))
  const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    borderRadius: '40px !important',
    borderColor: 'transparent',
    // marginLeft: '8px !important',
    // '&.Mui-selected': {
    //   borderColor: theme.palette.primary.main
    // },
    '&:not(:first-of-type)': {
      borderTopLeftRadius: '40px',
      borderBottomLeftRadius: '40px'
    },
    '&:not(:last-of-type)': {
      borderTopRightRadius: '40px',
      borderBottomRightRadius: '40px'
    }

    // margin: '4px'
  }))
  const { t } = useTranslation('apps-watch')

  return (
    <>
      <Container maxWidth="xxl" disableGutters>
        <ToggleButtonGroup
          value={selectedTab}
          onChange={handleTabChange}
          exclusive
          size="large"
          fullWidth
          // sx={{ width: '100%' }}
        >
          <CustomToggleButton
            value="journeys"
            onClick={() => console.log('Journeys click')}
          >
            <Stack sx={{ ml: 1, mr: 2 }}>
              <JourneysIcon />
            </Stack>
            {t('journeys')}
          </CustomToggleButton>
          <CustomToggleButton value="videos">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <Play1Icon />
            </Stack>
            {t('Videos')}
          </CustomToggleButton>
          <CustomToggleButton value="strategies">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <BulbIcon />
            </Stack>
            {t('Strategies')}
          </CustomToggleButton>
          <CustomToggleButton value="calendar">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <Calendar1Icon />
            </Stack>
            {t('Calendar')}
          </CustomToggleButton>
          <CustomToggleButton value="apps">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <Grid1Icon />
            </Stack>
            {t('Apps')}
          </CustomToggleButton>
        </ToggleButtonGroup>
      </Container>
    </>
  )
}
