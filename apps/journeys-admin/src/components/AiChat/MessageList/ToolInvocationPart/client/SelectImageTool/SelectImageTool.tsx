import { ToolInvocationUIPart } from '@ai-sdk/ui-utils'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
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
  part: {
    toolInvocation: { toolCallId, args, state }
  },
  addToolResult
}: ClientSelectImageToolProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const [open, setOpen] = useState(false)

  switch (state) {
    case 'call':
      return (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {args.message}
          </Typography>
          <Box>
            <Stack direction="row" gap={2}>
              {args.generatedImageUrls?.map((url) => (
                <Image
                  src={url}
                  alt="Generated image"
                  width={100}
                  height={100}
                  style={{ borderRadius: 5 }}
                  onClick={() => {
                    addToolResult({
                      toolCallId,
                      result: `update the image block to use this url: ${url}`
                    })
                  }}
                />
              ))}
            </Stack>
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
                  toolCallId,
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
                  toolCallId,
                  result: `update the image block using this object: ${JSON.stringify(
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
