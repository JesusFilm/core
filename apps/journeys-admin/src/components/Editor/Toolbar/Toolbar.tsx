import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'

import logo from '../../../../public/taskbar-icon.svg'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'

import { ActiveContent } from '@core/journeys/ui/EditorProvider'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import { HelpScoutBeacon } from '../../HelpScoutBeacon'
import { Items } from './Items'
import { Menu } from './Menu'

export function Toolbar(): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('journeys-admin')

  const { dispatch } = useEditor()

  function handleSelect(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  }

  return (
    <Stack
      data-testid="Toolbar"
      direction="row"
      alignItems="center"
      spacing={{ xs: 2, sm: 4 }}
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
        <Tooltip title="See all journeys" placement="bottom" arrow>
          <IconButton data-testid="ToolbarBackButton">
            <FormatListBulletedIcon />
          </IconButton>
        </Tooltip>
      </NextLink>
      {journey != null && (
        <>
          <Tooltip
            title={t('Social Image')}
            arrow
            PopperProps={{
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, -11]
                  }
                }
              ]
            }}
          >
            <Button
              onClick={handleSelect}
              data-testid="ToolbarSocialImage"
              style={{ backgroundColor: 'transparent' }}
              disableRipple
            >
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
                    alt={journey.primaryImageBlock.alt}
                    width={50}
                    height={50}
                    style={{
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </Box>
            </Button>
          </Tooltip>

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
          <Items />
        </>
      )}
      <Menu />
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <HelpScoutBeacon variant="iconButton" />
      </Box>
    </Stack>
  )
}
