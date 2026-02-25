import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { LegacyToolInvocationPart } from '../../../MessageList'

interface RedirectArgs {
  message?: string
  journeyId?: string
}

interface ClientRedirectUserToEditorToolProps {
  part: LegacyToolInvocationPart
}

export function ClientRedirectUserToEditorTool({
  part
}: ClientRedirectUserToEditorToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const args = part.toolInvocation.args as RedirectArgs

  switch (part.toolInvocation.state) {
    case 'call':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {args.message}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                void router.push(`/journeys/${args.journeyId}`)
              }}
            >
              {t('See My Journey!')}
            </Button>
          </Box>
        </Box>
      )
    default: {
      return null
    }
  }
}
