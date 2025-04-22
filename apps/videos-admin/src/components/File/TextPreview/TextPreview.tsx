import Box from '@mui/material/Box'
import { ReactElement, useEffect, useState } from 'react'

export function TextPreview({ file }: { file: File }): ReactElement {
  const [content, setContent] = useState<string | null>(null)

  useEffect(() => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      setContent(fileReader.result as string)
    }

    fileReader.readAsText(file)
  }, [file])

  return (
    <Box
      sx={{
        borderRadius: 1,
        bgcolor: 'background.default',
        p: 2,
        maxHeight: 640,
        overflowY: 'auto'
      }}
    >
      <pre style={{ whiteSpace: 'pre-wrap' }}>{content}</pre>
    </Box>
  )
}
