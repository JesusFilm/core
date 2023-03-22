import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Image from 'next/image'
import Button from '@mui/material/Button'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import goal from '../../../../../public/goal.svg'

export function ActionsBanner(): ReactElement {
  const theme = useTheme()

  return (
    <Box
      sx={{
        mx: 10,
        gap: 10,
        display: 'flex',
        flexDirection: 'row',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column-reverse',
          mx: 4
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
              [theme.breakpoints.up('md')]: {
                width: '85%'
              }
            }}
          >
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
