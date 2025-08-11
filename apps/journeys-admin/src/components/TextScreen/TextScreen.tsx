import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useCallback, useState } from 'react'

const string = `This journey is in English. It's about {{sermon_topic: loneliness}}. It includes a video and reflection text. 
The out comes are: 
- Watch insightful stories on {{web_url: http:abc.com}}
- Chat with someone on {{WhatsApp:user1_abc}}
- Send a prayer request via {{Facebook:user2_abc}}
`

interface ReplacementItem {
  id: string
  key: string
  defaultValue: string
  value: string
}

const obj: ReplacementItem[] = [
  {
    id: '1',
    key: 'sermon_topic',
    defaultValue: 'loneliness',
    value: ''
  },
  {
    id: '2',
    key: 'web_url',
    defaultValue: 'http:abc.com',
    value: ''
  },
  {
    id: '3',
    key: 'WhatsApp',
    defaultValue: 'user1_abc',
    value: ''
  },
  {
    id: '4',
    key: 'Facebook',
    defaultValue: 'user2_abc',
    value: ''
  }
]

// Function to convert array to replacement object for the regex function
const convertArrayToReplacementObj = (
  items: ReplacementItem[]
): Record<string, string> => {
  const result: Record<string, string> = {}
  items.forEach((item) => {
    result[item.key] = item.value || item.defaultValue
  })
  return result
}

// Function to replace values in curly braces with values from the object
const replaceCurlyBracesWithValues = (
  text: string,
  replacementObj: Record<string, string>
): string => {
  return text.replace(
    /\{\{([^:]+):\s*([^}]+)\}\}/g,
    (match, key, defaultValue) => {
      const trimmedKey = key.trim()
      return replacementObj[trimmedKey] || defaultValue.trim()
    }
  )
}

// Function to render text with editable spans for replaceable parts
const renderEditableText = (
  text: string,
  replacementItems: ReplacementItem[],
  onValueChange: (key: string, value: string) => void
): ReactElement[] => {
  const parts: ReactElement[] = []
  let lastIndex = 0

  const regex = /\{\{([^:]+):\s*([^}]+)\}\}/g
  let match

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      )
    }

    const key = match[1].trim()
    const defaultValue = match[2].trim()

    // Find the replacement item for this key
    const replacementItem = replacementItems.find((item) => item.key === key)
    const currentValue = replacementItem
      ? replacementItem.value || replacementItem.defaultValue
      : defaultValue

    // Add editable span for the replaceable part
    parts.push(
      <span
        key={`editable-${key}`}
        contentEditable
        suppressContentEditableWarning
        style={{
          backgroundColor: '#f0f8ff',
          border: '1px solid #ccc',
          borderRadius: '3px',
          padding: '2px 4px',
          minWidth: '20px',
          maxWidth: '100%',
          display: 'inline-block',
          wordWrap: 'break-word',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        onBlur={(e) => {
          const newValue = e.currentTarget.textContent || ''
          onValueChange(key, newValue)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
      >
        {currentValue}
      </span>
    )

    lastIndex = regex.lastIndex
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return parts
}

export function TextScreen(): ReactElement {
  const [replacementItems, setReplacementItems] =
    useState<ReplacementItem[]>(obj)

  const handleValueChange = useCallback((key: string, value: string) => {
    setReplacementItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    )
  }, [])

  const replacementObj = convertArrayToReplacementObj(replacementItems)
  const editString = replaceCurlyBracesWithValues(string, replacementObj)
  const displayString = editString

  return (
    <Box
      sx={{
        border: '1px solid red',
        p: 10
      }}
    >
      <Typography variant="h1">Text Screen</Typography>
      {/* <Stack direction="row" gap={2} sx={{ width: '100%' }}>
        <TextField fullWidth multiline rows={7} value={string} />
        <TextField
          fullWidth
          multiline
          rows={30}
          value={JSON.stringify(replacementItems, null, 2)}
        />
      </Stack> */}
      <Stack direction="row" gap={2} sx={{ width: '100%' }}>
        <Box
          sx={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            p: 2,
            minHeight: '200px',
            width: '100%',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}
        >
          {renderEditableText(string, replacementItems, handleValueChange)}
        </Box>
        {/* <TextField fullWidth multiline rows={10} value={displayString} /> */}
      </Stack>
    </Box>
  )
}
