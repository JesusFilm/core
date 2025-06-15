import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface AgentGenerateImageToolProps {
  part: ToolInvocationUIPart
}

export function AgentGenerateImageTool({
  part
}: AgentGenerateImageToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  switch (part.toolInvocation.state) {
    case 'call':
      return (
        <Typography variant="body2" color="text.secondary">
          {t('Generating image...')}
        </Typography>
      )
    case 'result':
      return (
        <Stack gap={2} direction="row">
          {part.toolInvocation.result.map((image) => (
            <Image
              src={image.src}
              alt="Generated image"
              width={256}
              height={256}
              style={{
                borderRadius: 5
              }}
            />
          ))}
        </Stack>
      )
    default: {
      return null
    }
  }
}
