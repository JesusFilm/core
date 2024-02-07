import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'

import logo from '../../../../public/taskbar-icon.svg'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'
import { JourneyLink } from '../Properties/JourneyLink'

import { Analytics } from './Analytics'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={{ xs: 2, sm: 6 }}
      sx={{
        height: EDIT_TOOLBAR_HEIGHT,
        backgroundColor: 'background.paper',
        px: { xs: 2, sm: 4 },
        flexShrink: 0
      }}
    >
      <Image
        src={logo}
        alt="Next Steps"
        height={32}
        width={32}
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
      <NextLink href="/" passHref legacyBehavior>
        <IconButton>
          <ChevronLeftIcon />
        </IconButton>
      </NextLink>
      {journey != null && (
        <>
          <Box
            bgcolor={(theme) => theme.palette.background.default}
            borderRadius="4px"
            width={50}
            height={50}
            justifyContent="center"
            alignItems="center"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            {journey?.primaryImageBlock?.src == null ? (
              <ThumbsUpIcon color="error" />
            ) : (
              <Image
                src={journey.primaryImageBlock.src}
                alt={journey.primaryImageBlock.src}
                width={50}
                height={50}
                style={{
                  borderRadius: '4px',
                  objectFit: 'cover'
                }}
              />
            )}
          </Box>
          <Stack flexGrow={1} sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {journey.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {journey.description}
            </Typography>
          </Stack>
          <Analytics journey={journey} variant="button" />
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LightbulbOutlinedIcon />}
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          >
            {t('Strategy')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LinkAngled />}
            onClick={handleShowMenu}
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          >
            {t('Share')}
          </Button>
          <IconButton
            component="a"
            href={`/api/preview?slug=${journey.slug}`}
            target="_blank"
            color="secondary"
            sx={{
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          >
            <PlayArrowOutlinedIcon />
          </IconButton>
          <IconButton
            aria-label="Preview"
            href={`/api/preview?slug=${journey.slug}`}
            target="_blank"
            sx={{
              display: {
                xs: 'flex',
                md: 'none'
              }
            }}
          >
            <PlayArrowOutlinedIcon />
          </IconButton>
          <MuiMenu
            id="share-journey-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem>
              <JourneyLink isMenu />
            </MenuItem>
          </MuiMenu>
        </>
      )}
      <Menu />
    </Stack>
  )
}
