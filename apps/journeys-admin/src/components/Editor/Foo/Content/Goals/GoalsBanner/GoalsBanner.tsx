import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import goal from './assets/goal.svg'

interface ListItemProps {
  children: string
}

function ListItem({ children }: ListItemProps): ReactElement {
  return (
    <Stack direction="row" gap={1} alignItems="center">
      <Typography variant="subtitle2" color="secondary.light">
        &#x2022;
      </Typography>
      <Typography variant="subtitle2" color="secondary.light">
        {children}
      </Typography>
    </Stack>
  )
}

export function GoalsBanner(): ReactElement {
  const theme = useTheme()
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  function handleClick(): void {
    dispatch({ type: 'SetActiveSlideAction', activeSlide: ActiveSlide.Drawer })
  }

  return (
    <Box
      sx={{
        mx: 8,
        gap: 10,
        display: 'flex'
      }}
      data-testid="ActionsBanner"
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Image
          src={goal}
          alt="goal"
          height={504}
          width={464}
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Box>
      <Stack gap={3} justifyContent="center">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          pb={3}
        >
          <Typography variant="overline" color="secondary.light">
            {t('Goals')}
          </Typography>
        </Stack>
        <Box pb={6}>
          <Typography variant="h1" gutterBottom>
            {t('Every Journey has a goal')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              width: '90%',
              [theme.breakpoints.down('md')]: {
                width: '100%'
              }
            }}
          >
            {t(
              'On this screen you will see all your goals and actions listed in a ' +
                'single table. Create cards with some actions like buttons. We will ' +
                'list all your links and actions here so you can:'
            )}
          </Typography>
        </Box>
        <ListItem>
          {t('Check all URLs and actions used in the journey')}
        </ListItem>
        <ListItem>{t('Assign a goal to each action and monitor it')}</ListItem>
        <ListItem>{t('Change all URLs in a single place')}</ListItem>
        <Button
          variant="outlined"
          startIcon={
            <InformationCircleContainedIcon sx={{ color: 'secondary.light' }} />
          }
          sx={{
            display: { xs: 'block', sm: 'none' },
            color: 'secondary.main',
            borderColor: 'secondary.main',
            borderRadius: 2
          }}
          onClick={handleClick}
        >
          <Typography variant="subtitle2">{t('Learn More')}</Typography>
        </Button>
      </Stack>
    </Box>
  )
}
