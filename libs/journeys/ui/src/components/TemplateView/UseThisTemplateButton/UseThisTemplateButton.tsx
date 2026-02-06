import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useEffect, useState } from 'react'

import LayoutTopIcon from '@core/shared/ui/icons/LayoutTop'

import { useJourney } from '../../../libs/JourneyProvider'
import { AccountCheckDialog } from '../AccountCheckDialog'

interface UseThisTemplateButtonProps {
  variant?: 'menu-item' | 'button'
  signedIn?: boolean
}

export function UseThisTemplateButton({
  variant = 'button',
  signedIn = false
}: UseThisTemplateButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const router = useRouter()
  const { journey } = useJourney()
  const [openAccountDialog, setOpenAccountDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCustomizeNavigation(): Promise<void> {
    void router.push(`/templates/${journey?.id ?? ''}/customize`, undefined, {
      shallow: true
    })
  }

  const handleCheckSignIn = async (): Promise<void> => {
    // For menu-item variant, assume user is signed in
    // if (variant === 'menu-item' || signedIn) {
    setLoading(true)
    await handleCustomizeNavigation()
    // } else {
    //   setOpenAccountDialog(true)
    // }
  }

  const handleSignIn = (login: boolean): void => {
    // Use env var if outside journeys-admin project
    const domain =
      process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? window.location.origin
    const url = `${domain}/templates/${journey?.id ?? ''}`

    void router.push(
      {
        pathname: `${domain}/users/sign-in`,
        query: {
          redirect: url.includes('createNew') ? url : `${url}?createNew=true`,
          login: login ?? false
        }
      },
      undefined,
      {
        shallow: true
      }
    )
  }

  useEffect(() => {
    if (!signedIn && variant === 'button') {
      // Prefetch the dashboard page
      void router.prefetch('/users/sign-in')
    }
  }, [signedIn, router, variant])

  if (variant === 'menu-item') {
    return (
      <MenuItem
        onClick={handleCheckSignIn}
        data-testid="UseThisTemplateMenuItem"
      >
        <ListItemIcon sx={{ color: 'secondary.main' }}>
          <LayoutTopIcon />
        </ListItemIcon>
        <ListItemText>{t('Use This Template')}</ListItemText>
      </MenuItem>
    )
  }

  return (
    <>
      <Button
        onMouseEnter={() => {
          if (signedIn) {
            void router.prefetch(`/templates/${journey?.id ?? ''}/customize`)
          }
        }}
        onClick={handleCheckSignIn}
        variant="contained"
        sx={{ flex: 'none', minWidth: 180 }}
        disabled={journey == null}
        data-testid="UseThisTemplateButton"
      >
        {loading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          t('Use This Template')
        )}
      </Button>
      <AccountCheckDialog
        open={openAccountDialog}
        handleSignIn={handleSignIn}
        onClose={() => setOpenAccountDialog(false)}
      />
    </>
  )
}
