import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'

import logo from '../../../../public/taskbar-icon.svg'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'

import { ActiveContent } from '@core/journeys/ui/EditorProvider'
import { setBeaconPageViewed } from '@core/journeys/ui/setBeaconPageViewed'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { Divider } from '@mui/material'
import Button from '@mui/material/Button'
import { typography } from '@mui/system'
import {
  ButtonColor,
  TypographyColor
} from 'libs/journeys/ui/__generated__/globalTypes'
import { n } from 'msw/lib/core/GraphQLHandler-COiPfZ8k'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { Background } from 'reactflow'
import { transpile } from 'typescript'
import { BackgroundColor } from '../Slider/Settings/CanvasDetails/Properties/blocks/Card/BackgroundColor'
import { Items } from './Items'
import { Menu } from './Menu'
import { TitleDescriptionDialog } from './TitleDescriptionDialog'

export function Toolbar(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [titleDialogOpen, setTitleDialogOpen] = useState<boolean | undefined>()
  const { dispatch } = useEditor()

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleSelectSocialImage(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  }

  function handleSelectTitle(): void {
    setRoute('title')
    setTitleDialogOpen(true)
    // onClose?.()   // may need to add this
  }

  function handleCloseTitle(): void {
    setTitleDialogOpen(false)
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
          <Tooltip title={t('Social Image')} arrow>
            <Button
              onClick={handleSelectSocialImage}
              data-testid="ToolbarSocialImage"
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

          <Stack flexGrow={1} flexShrink={1} sx={{ minWidth: 0 }}>
            <Box
              flexShrink={1}
              sx={{
                display: 'inline-flex',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              <ThemeProvider
                themeName={ThemeName.journeysAdmin}
                themeMode={ThemeMode.dark}
              >
                <Tooltip
                  title="Click to edit"
                  placement="bottom"
                  arrow
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset:
                            journey.description === '' ? [0, 2] : [0, -10.5]
                        }
                      }
                    ]
                  }}
                >
                  <Button
                    variant="text"
                    onClick={handleSelectTitle}
                    sx={{
                      maxWidth: 'auto',
                      display: 'block',
                      textAlign: 'left',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      borderRadius: '8px',
                      flexShrink: 1,
                      color: ButtonColor.inherit,
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        flexShrink: 1
                      }}
                    >
                      {journey.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        maxWidth: 'auto',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        flexShrink: 1
                      }}
                    >
                      {journey.description}
                    </Typography>
                  </Button>
                </Tooltip>
              </ThemeProvider>
            </Box>
            <Typography>
              {journey?.id != null && titleDialogOpen != null && (
                <TitleDescriptionDialog
                  open={titleDialogOpen}
                  onClose={handleCloseTitle}
                />
              )}
            </Typography>
          </Stack>
          <Items />
        </>
      )}
      <Menu />
    </Stack>
  )
}
