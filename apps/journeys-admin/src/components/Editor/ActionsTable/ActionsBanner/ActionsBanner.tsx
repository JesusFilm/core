import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import Button from '@mui/material/Button'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import goal from '../../../../../public/goal.svg'
import { ActionDetails } from '../../ActionDetails'

export function ActionsBanner(): ReactElement {
  const theme = useTheme()
  const { dispatch } = useEditor()

  return (
    <Box
      sx={{
        mx: 4,
        gap: 10,
        display: 'flex',
        flexDirection: 'row',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column-reverse'
        }
      }}
    >
      <Image src={goal} alt="goal" height={504} width={464} />
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
            disabled
            startIcon={<InfoOutlined />}
            sx={{ [theme.breakpoints.down('md')]: { display: 'none' } }}
          >
            Learn More
          </Button>
          <Button
            variant="outlined"
            startIcon={<InfoOutlined sx={{ color: 'secondary.light' }} />}
            sx={{
              [theme.breakpoints.up('md')]: { display: 'none' },
              color: 'secondary.main',
              borderColor: 'secondary.main',
              borderRadius: 2
            }}
            onClick={() => {
              dispatch({
                type: 'SetDrawerPropsAction',
                mobileOpen: true,
                title: 'Information',
                children: <ActionDetails />
              })
            }}
          >
            <Typography variant="subtitle2">Learn More</Typography>
          </Button>
        </Stack>
        <Box pb={6}>
          <Typography variant="h1" gutterBottom>
            Every Journey has a goal
          </Typography>
          <Typography variant="body2">
            On this screen you will see all your goals and actions listed in a
            single table. Create cards with some actions like buttons. We will
            list all your links and actions here so you can:
          </Typography>
        </Box>
        <Typography variant="subtitle2" color="secondary.light">
          &#x2022; Check all URLs and actions used in the journey
        </Typography>
        <Typography variant="subtitle2" color="secondary.light">
          &#x2022; Assign a goal to each action and monitor it
        </Typography>
        <Typography variant="subtitle2" color="secondary.light">
          &#x2022; Change all URLs in a single place
        </Typography>
      </Stack>
    </Box>
  )
}
