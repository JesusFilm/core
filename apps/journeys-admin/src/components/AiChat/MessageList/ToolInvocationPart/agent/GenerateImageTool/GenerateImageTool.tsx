import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { LegacyToolInvocationPart } from '../../../MessageList'

interface AgentGenerateImageToolProps {
  part: LegacyToolInvocationPart
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
          {(Array.isArray(part.toolInvocation.result)
            ? part.toolInvocation.result
            : []
          ).map((image: { url: string; width?: number; height?: number; blurhash?: string }) => (
            <Image
              src={image.url}
              alt="Generated image"
              width={image.width ?? 100}
              height={image.height ?? 100}
              blurDataURL={image.blurhash}
              style={{
                borderRadius: 5,
                maxWidth: '60%'
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
