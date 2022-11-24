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
            'linear-gradient(180.21deg, rgba(50, 50, 51, 0) 52.73%, rgba(38, 38, 38, 0.174648) 68.58%, rgba(27, 27, 28, 0.321668) 81.42%, rgba(0, 0, 0, 0.7) 99.82%), linear-gradient(89.75deg, rgba(20, 20, 20, 0.3) 7.11%, rgba(10, 10, 10, 0.148691) 27.28%, rgba(4, 4, 4, 0.0587687) 44.45%, rgba(0, 0, 0, 0) 66.08%)'
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
          <Stack direction="column" sx={{ pb: { xs: 13, sm: 0 } }}>
            <Typography
              variant="overline1"
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
              sx={{
                zIndex: 2
              }}
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
              color="background.default"
              sx={{
                zIndex: 2,
                opacity: 0.7
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
