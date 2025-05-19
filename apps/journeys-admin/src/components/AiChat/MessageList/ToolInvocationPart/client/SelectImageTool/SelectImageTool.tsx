import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { ImageLibrary } from '../../../../../Editor/Slider/Settings/Drawer/ImageLibrary'

interface ClientSelectImageToolProps {
  part: ToolInvocationUIPart
  addToolResult: ({
    toolCallId,
    result
  }: {
    toolCallId: string
    result: any
  }) => void
}

export function ClientSelectImageTool({
  part,
  addToolResult
}: ClientSelectImageToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [open, setOpen] = useState(false)

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
                setOpen(true)
              }}
            >
              {t('Open Image Library')}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              sx={{ ml: 2 }}
              aria-label={t('Cancel')}
              onClick={() => {
                addToolResult({
                  toolCallId: part.toolInvocation.toolCallId,
                  result: { cancelled: true }
                })
              }}
            >
              {t('Cancel')}
            </Button>
            <ImageLibrary
              open={open}
              onClose={() => {
                setOpen(false)
              }}
              onChange={async (selectedImage) => {
                addToolResult({
                  toolCallId: part.toolInvocation.toolCallId,
                  result: `here is the image the new image. Update the old image block to this image: ${JSON.stringify(
                    selectedImage
                  )}`
                })
              }}
              selectedBlock={null}
            />
          </Box>
        </Box>
      )
    default: {
      return null
    }
  }
}
