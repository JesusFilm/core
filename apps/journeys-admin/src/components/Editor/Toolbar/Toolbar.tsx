import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveContent } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { setBeaconPageViewed } from '@core/journeys/ui/setBeaconPageViewed'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import ThumbsUpIcon from '@core/shared/ui/icons/ThumbsUp'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'
import logo from '../../../../public/taskbar-icon.svg'
import { HelpScoutBeacon } from '../../HelpScoutBeacon'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Items } from './Items'
import { CommandRedoItem } from './Items/CommandRedoItem'
import { CommandUndoItem } from './Items/CommandUndoItem'
import { Menu } from './Menu'

const TitleDescriptionDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Toolbar/TitleDescriptionDialog" */ './TitleDescriptionDialog/TitleDescriptionDialog'
    ).then((mod) => mod.TitleDescriptionDialog),
  { ssr: false }
)

interface ToolbarProps {
  user?: User
}

export function Toolbar({ user }: ToolbarProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { dispatch } = useEditor()
  const { commands } = useFlags()

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleSocialImageClick(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Social
    })
  }

  function handleDialogOpen(): void {
    setRoute('title')
    setDialogOpen(true)
  }

  function handleDialogClose(): void {
    setDialogOpen(false)
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
          {commands && (
            <>
              <CommandUndoItem variant="icon-button" />
              <CommandRedoItem variant="icon-button" />
            </>
          )}
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
              onClick={handleSocialImageClick}
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
              <Tooltip
                title="Click to edit"
                placement="bottom"
                arrow
                PopperProps={{
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: journey.description === '' ? [0, 2] : [0, -10.3]
                      }
                    }
                  ]
                }}
              >
                <Button
                  variant="text"
                  onClick={handleDialogOpen}
                  color="secondary"
                  sx={{
                    maxWidth: 'auto',
                    display: 'block',
                    textAlign: 'left',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    borderRadius: '8px',
                    flexShrink: 1
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
                      flexShrink: 1,
                      fontWeight: 'normal'
                    }}
                  >
                    {journey.description}
                  </Typography>
                </Button>
              </Tooltip>
            </Box>

            <TitleDescriptionDialog
              open={dialogOpen}
              onClose={handleDialogClose}
            />
          </Stack>
          <Items />
        </>
      )}
      <Menu user={user} />
      <Box
        sx={{
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <HelpScoutBeacon
          userInfo={{
            name: user?.displayName ?? '',
            email: user?.email ?? ''
          }}
        />
      </Box>
    </Stack>
  )
}
