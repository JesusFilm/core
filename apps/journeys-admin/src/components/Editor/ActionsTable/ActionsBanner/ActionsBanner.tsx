import InfoOutlined from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement, useEffect } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import goal from '../../../../../public/goal.svg'
import { ActionDetails } from '../../ActionDetails'

export function ActionsBanner(): ReactElement {
  const theme = useTheme()
  const { dispatch } = useEditor()

  const ActionPoint = ({
    description
  }: {
    description: string
  }): ReactElement => (
    <Stack direction="row" gap={1} alignItems="center">
      <Typography variant="subtitle2" color="secondary.light">
        &#x2022;
      </Typography>
      <Typography variant="subtitle2" color="secondary.light">
        {description}
      </Typography>
    </Stack>
  )

  const openActionDetails = (): void => {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Information',
      children: <ActionDetails />
    })
  }

  useEffect(() => {
    function handleResize(): void {
      if (window.innerWidth > 768) {
        openActionDetails()
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // runs the useEffect once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box
      sx={{
        mx: 8,
        gap: 10,
        display: 'flex',
        flexDirection: 'row',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column-reverse'
        }
      }}
    >
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
      <Stack gap={3}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          pb={3}
        >
          <Typography variant="overline" color="secondary.light">
            Goals
          </Typography>
          <Button
            variant="outlined"
            startIcon={<InfoOutlined sx={{ color: 'secondary.light' }} />}
            sx={{
              [theme.breakpoints.up('md')]: { display: 'none' },
              color: 'secondary.main',
              borderColor: 'secondary.main',
              borderRadius: 2
            }}
            onClick={openActionDetails}
          >
            <Typography variant="subtitle2">Learn More</Typography>
          </Button>
        </Stack>
        <Box pb={6}>
          <Typography variant="h1" gutterBottom>
            Every Journey has a goal
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
            On this screen you will see all your goals and actions listed in a
            single table. Create cards with some actions like buttons. We will
            list all your links and actions here so you can:
          </Typography>
        </Box>
        <ActionPoint description="Check all URLs and actions used in the journey" />
        <ActionPoint description="Assign a goal to each action and monitor it" />
        <ActionPoint description="Change all URLs in a single place" />
      </Stack>
    </Box>
  )
}
