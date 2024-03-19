import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, MouseEvent, ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import ShareIcon from '@core/shared/ui/icons/Share'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { Item } from '../Item/Item'

const EmbedJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/EmbedJourneyDialog" */
      './EmbedJourneyDialog'
    ).then((mod) => mod.EmbedJourneyDialog),
  { ssr: false }
)
const SlugDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/SlugDialog" */
      './SlugDialog'
    ).then((mod) => mod.SlugDialog),
  { ssr: false }
)

interface ShareItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function ShareItem({ variant }: ShareItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const [showSlugDialog, setShowSlugDialog] = useState<boolean | undefined>()
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }
  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router, undefined, { shallow: true })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  return (
    <Box data-testId="Share-Item">
      <Item
        variant={variant}
        label={t('Share')}
        icon={<ShareIcon />}
        onClick={handleShowMenu}
        ButtonProps={{
          variant: 'contained'
        }}
      />
      <Dialog open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <Stack direction="column" spacing={4}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Share This Journey')}
          </Typography>
          <CopyTextField
            value={
              journey?.slug != null
                ? `${
                    process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                    'https://your.nextstep.is'
                  }/${journey.slug}`
                : undefined
            }
          />
          <Stack direction="row" spacing={6}>
            <Button
              onClick={() => {
                setShowSlugDialog(true)
                setRoute('edit-url')
              }}
              size="small"
              startIcon={<Edit2Icon />}
              disabled={journey == null}
            >
              {t('Edit URL')}
            </Button>
            <Button
              onClick={() => {
                setShowEmbedDialog(true)
                setRoute('embed-journey')
              }}
              size="small"
              startIcon={<Code1Icon />}
              disabled={journey == null}
            >
              {t('Embed Journey')}
            </Button>
          </Stack>
        </Stack>
      </Dialog>
      {showSlugDialog != null && (
        <SlugDialog
          open={showSlugDialog}
          onClose={() => setShowSlugDialog(false)}
        />
      )}
      {showEmbedDialog != null && (
        <EmbedJourneyDialog
          open={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
        />
      )}
    </Box>
  )
}
