import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ClientRedirectUserToEditorToolProps {
  part: ToolInvocationUIPart
}

export function ClientRedirectUserToEditorTool({
  part
}: ClientRedirectUserToEditorToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()

  switch (part.toolInvocation.state) {
    case 'call':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {part.toolInvocation.args.message}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() => {
                void router.push(
                  `/journeys/${part.toolInvocation.args.journeyId}`
                )
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
