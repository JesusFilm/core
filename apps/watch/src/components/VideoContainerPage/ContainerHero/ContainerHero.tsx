import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement } from 'react'

import { getLabelDetails } from '../../../libs/utils/getLabelDetails/getLabelDetails'
import { useVideo } from '../../../libs/videoContext'
import { HeroOverlay } from '../../HeroOverlay'

interface Props {
  openDialog: () => void
}

export function ContainerHero({ openDialog }: Props): ReactElement {
  const { label: videoLabel, title, childrenCount, image } = useVideo()
  const { label, childCountLabel } = getLabelDetails(videoLabel, childrenCount)

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
      {image != null && (
        <Image src={image} alt="Home Hero" layout="fill" objectFit="cover" />
      )}
      <HeroOverlay />
      <Container
        maxWidth="xxl"
        sx={{
          display: 'flex'
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ width: '100%', pb: { xs: 4, sm: 11 } }}
        >
          <Stack direction="column" sx={{ pb: { xs: 4, sm: 0 } }}>
            <Typography
              variant="overline1"
              color="secondary.contrastText"
              sx={{
                opacity: 0.7,
                zIndex: 2
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="h1"
              color="secondary.contrastText"
              sx={{
                zIndex: 2
              }}
            >
              {title[0].value}
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
              color="secondary.contrastText"
              sx={{
                zIndex: 2,
                opacity: 0.7
              }}
            >
              {childCountLabel.toLowerCase()}
            </Typography>
            <IconButton
              sx={{
                display: { xs: 'flex', sm: 'none' },
                ml: 'auto'
              }}
              onClick={() => openDialog()}
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
