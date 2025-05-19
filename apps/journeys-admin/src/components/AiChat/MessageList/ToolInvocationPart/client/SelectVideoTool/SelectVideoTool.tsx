import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { VideoLibrary } from '../../../../../Editor/Slider/Settings/Drawer/VideoLibrary'

interface ClientSelectVideoToolProps {
  part: ToolInvocationUIPart
  addToolResult: ({
    toolCallId,
    result
  }: {
    toolCallId: string
    result: any
  }) => void
}

export function ClientSelectVideoTool({
  part,
  addToolResult
}: ClientSelectVideoToolProps): ReactElement | null {
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
            <Button variant="outlined" onClick={() => setOpen(true)}>
              {t('Open Video Library')}
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
            <VideoLibrary
              open={open}
              onClose={() => setOpen(false)}
              selectedBlock={null}
              onSelect={async (selectedVideo) => {
                addToolResult({
                  toolCallId: part.toolInvocation.toolCallId,
                  result: `here is the video: ${JSON.stringify(selectedVideo)}`
                })
              }}
            />
          </Box>
        </Box>
      )
    default: {
      return null
    }
  }
}
