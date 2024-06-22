import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ShareDialog } from '@core/journeys/ui/StepFooter/FooterButtonList/ShareButton/ShareDialog'
import ShareIcon from '@core/shared/ui/icons/Share'

import { Item } from '../Editor/Toolbar/Items/Item'
import { PreviewItem } from '../Editor/Toolbar/Items/PreviewItem'
import { JourneyQuickSettingsChat } from './JourneyQuickSettingsChat'
import { JourneyQuickSettingsGoals } from './JourneyQuickSettingsGoals'
import { JourneyQuickSettingsTabs } from './JourneyQuickSettingsTabs'

export function JourneyQuickSettings(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const viewportHeight = use100vh()
  const [tabValue, setTabValue] = useState(0)
  const theme = useTheme()

  const url =
    typeof window !== 'undefined' && journey?.slug != null
      ? window.location.href
      : undefined
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        height: viewportHeight ?? '100vh',
        backgroundColor: { xs: 'background.default', md: 'background.paper' }
      }}
    >
      <Stack
        justifyContent="safe center"
        alignItems="center"
        gap={{ xs: 4, sm: 12 }}
        sx={{
          m: { xs: 0, sm: 4 },
          pt: 8,
          overflowY: 'auto',
          flexGrow: 1,
          borderColor: 'divider',
          borderWidth: 'medium',
          borderRadius: { xs: 2, sm: 4 },
          borderStyle: { xs: 'none', sm: 'solid' },
          backgroundColor: { xs: 'background.paper', md: 'background.default' }
        }}
      >
        <Stack
          sx={{
            alignSelf: { xs: 'flex-start', sm: 'center' },
            alignItems: { sm: 'center' }
          }}
        >
          <Typography
            variant="h2"
            sx={{
              px: { xs: 8, sm: 0 },
              overflowWrap: 'break-word'
            }}
          >
            {t('Express Setup')}
          </Typography>
          {journey?.title != null && (
            <Typography
              sx={{
                px: { xs: 8, sm: 0 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
                overflowWrap: 'break-word'
              }}
            >
              {journey.title}
            </Typography>
          )}
        </Stack>
        <Stack
          alignItems="center"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            maxWidth: { xs: '100%', sm: 397 }
          }}
        >
          <Card
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              p: 4,
              borderBottomLeftRadius: { xs: 0, sm: 8 },
              borderBottomRightRadius: { xs: 0, sm: 8 },
              width: { xs: '100vw', sm: 418 },
              [theme.breakpoints.down('md')]: {
                boxShadow: 'none'
              }
            }}
          >
            <Box sx={{ mx: -4, mt: -4, pb: 3 }}>
              <JourneyQuickSettingsTabs
                tabValue={tabValue}
                setTabValue={setTabValue}
              />
            </Box>
            <CardContent
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              {tabValue === 0 && <JourneyQuickSettingsChat />}
              {tabValue === 1 && <JourneyQuickSettingsGoals />}
            </CardContent>
            <CardActions
              sx={{
                px: 0,
                flexDirection: 'row',
                gap: 2,
                justifyContent: 'flex-end'
              }}
            >
              <PreviewItem variant="button" />
              <Item
                variant="button"
                label={t('Share')}
                icon={<ShareIcon />}
                onClick={() => setShareDialogOpen(true)}
                ButtonProps={{
                  variant: 'contained'
                }}
              />
              <ShareDialog
                url={url}
                open={shareDialogOpen}
                closeDialog={() => setShareDialogOpen(false)}
              />
            </CardActions>
          </Card>
        </Stack>
      </Stack>
    </Stack>
  )
}
