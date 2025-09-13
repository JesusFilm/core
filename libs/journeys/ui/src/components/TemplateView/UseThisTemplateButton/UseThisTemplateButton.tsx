import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useEffect, useState } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'
import { AccountCheckDialog } from '../AccountCheckDialog'

interface UseThisTemplateButtonProps {
  signedIn?: boolean
}

export function UseThisTemplateButton({
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
    if (signedIn) {
      setLoading(true)
      await handleCustomizeNavigation()
    } else {
      setOpenAccountDialog(true)
    }
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
    if (!signedIn) {
      // Prefetch the dashboard page
      void router.prefetch('/users/sign-in')
    }
  }, [signedIn, router])

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
