import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { VideoLibrary } from '../../../../../Editor/Slider/Settings/Drawer/VideoLibrary'

import type { AddToolResultChildArg } from '../../ToolInvocationPart'
import type { LegacyToolInvocationPart } from '../../MessageList'

interface ClientSelectVideoToolProps {
  part: LegacyToolInvocationPart
  addToolResult: (arg: AddToolResultChildArg) => void
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
