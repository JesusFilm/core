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
import { AudioLanguageButton } from '../../VideoContentPage/AudioLanguageButton'

interface ContainerHeroProps {
  openDialog: () => void
}

export function ContainerHero({
  openDialog
}: ContainerHeroProps): ReactElement {
  const { label: videoLabel, title, childrenCount, images } = useVideo()
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
      data-testid="ContainerHero"
    >
      {images[0]?.mobileCinematicHigh != null && (
        <Image
          src={images[0].mobileCinematicHigh}
          alt="Home Hero"
          fill
          sizes="100vw"
          style={{
            objectFit: 'cover'
          }}
        />
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
              {`${label} \u2022 ${childCountLabel.toLowerCase()}`}
            </Typography>
            <Typography
              variant="h1"
              color="secondary.contrastText"
              sx={{
                zIndex: 2,
                fontSize: { xs: 28, sm: 36, md: 48, xl: 64 }
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
              maxWidth: '100%',
              zIndex: 1
            }}
          >
            <Box sx={{ mb: 1 }}>
              <AudioLanguageButton componentVariant="button" />
            </Box>
            <IconButton
              sx={{
                display: { xs: 'flex', sm: 'none' },
                ml: 'auto'
              }}
              onClick={() => openDialog()}
              aria-label="share"
            >
              <ShareOutlinedIcon
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
