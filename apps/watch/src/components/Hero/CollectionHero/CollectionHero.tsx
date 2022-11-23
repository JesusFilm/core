import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import IconButton from '@mui/material/IconButton'

interface Props {
  title: string
  imageSrc: string
  type: 'collection' | 'series'
  length: number
}

export function CollectionHero({
  title,
  imageSrc,
  type,
  length
}: Props): ReactElement {
  return (
    <Box
      sx={{
        height: { xs: 280, lg: 340 },
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative'
      }}
    >
      <Image src={imageSrc} alt="Home Hero" layout="fill" objectFit="cover" />
      <Box
        sx={{
          zIndex: 1,
          position: 'absolute',
          height: '100%',
          width: '100%',
          background:
            'linear-gradient(180deg, rgba(50, 50, 51, 0) 64%, rgba(38, 38, 38, 0.3) 76%, rgba(27, 27, 28, 0.46) 86%, #000000 100%), linear-gradient(90deg, #141414 16%, rgba(10, 10, 10, 0.5) 24%, rgba(4, 4, 4, 0.2) 31%, rgba(0, 0, 0, 0) 40%)' // TODO: update gradient
        }}
      />
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex'
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ width: '100%', pb: { xs: 5, sm: 11 } }}
        >
          <Stack direction="column">
            <Typography
              variant="overline1" // TODO: typogs variants should change when mobile
              color="secondary.contrastText"
              sx={{
                opacity: 0.7,
                zIndex: 2
              }}
            >
              {type}
            </Typography>
            <Typography
              variant="h1"
              color="secondary.contrastText"
              sx={{ zIndex: 2 }}
            >
              {title}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            sx={{
              alignSelf: { sm: 'flex-end' },
              alignItems: 'center',
              ml: { sm: 'auto' },
              maxWidth: '100%'
            }}
          >
            <Typography
              variant="overline1"
              align="center"
              color="secondary.contrastText" // TODO: check with Ziwei about updating theme to include #DCDDE5
              sx={{
                zIndex: 2
              }}
            >
              {`${length} ${type === 'collection' ? 'Chapters' : 'Episodes'}`}
            </Typography>
            <IconButton
              sx={{
                display: { xs: 'flex', sm: 'none' },
                ml: 'auto'
              }}
            >
              <ShareOutlinedIcon
                color="primary"
                sx={{
                  zIndex: 2
                }}
              />
            </IconButton>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
