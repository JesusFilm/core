import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useUser } from 'next-firebase-auth'
import { getAuth, signInAnonymously } from 'firebase/auth'

interface CustomizeTemplateButtonProps {
  journeyId?: string
}

export function CustomizeTemplateButton({
  journeyId
}: CustomizeTemplateButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const user = useUser()
  const router = useRouter()
  const isSignedIn = user?.email != null

  async function handleClick(): Promise<void> {
    if (journeyId == null) return
    if (isSignedIn) {
      router.push(`/templates/${journeyId ?? ''}/customize`)
    } else {
      const auth = getAuth()
      signInAnonymously(auth)
      await router.push(`/templates/${journeyId ?? ''}/customize?redirect=true`)
    }
  }

  return (
    <Button
      variant="outlined"
      color="secondary"
      disabled={journeyId == null}
      data-testid="CustomizeTemplateButton"
      onClick={handleClick}
    >
      {t('Customize')}
    </Button>
  )
}
