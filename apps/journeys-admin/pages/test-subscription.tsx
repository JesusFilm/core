import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

export default function TestSubscription() {
  const [isConnected, setIsConnected] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (log: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${log}`])
  }

  const handleTestSubscription = () => {
    setIsConnected(true)
    setProgress(null)
    setMessage(null)
    setLogs([])
    addLog('Starting SSE subscription test...')

    const subscriptionQuery = `
      subscription TestSubscription {
        journeyAiTranslateCreate(
          input: {
            journeyId: "test-journey-id"
            name: "Test Journey"
            journeyLanguageName: "English"
            textLanguageId: "529"
            textLanguageName: "Spanish"
          }
        ) {
          progress
          message
          journey {
            id
            title
          }
        }
      }
    `

    const body = JSON.stringify({
      query: subscriptionQuery,
      variables: {}
    })

    addLog('Connecting to /api/test-subscription...')

    fetch('/api/test-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache'
      },
      body
    })
      .then((response) => {
        addLog(`Response status: ${response.status}`)
        addLog(
          `Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const readStream = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                addLog('Stream completed')
                setIsConnected(false)
                return
              }

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')

              // Keep the last incomplete line in the buffer
              buffer = lines.pop() || ''

              for (const line of lines) {
                addLog(`Raw line: ${line}`)
                if (line.startsWith('data: ')) {
                  const data = line.slice(6).trim()
                  if (data && data !== '') {
                    try {
                      const parsed = JSON.parse(data)
                      addLog(`Parsed data: ${JSON.stringify(parsed)}`)

                      if (parsed.data?.journeyAiTranslateCreate) {
                        const result = parsed.data.journeyAiTranslateCreate
                        setProgress(result.progress)
                        setMessage(result.message)
                        addLog(
                          `Progress: ${result.progress}%, Message: ${result.message}`
                        )
                      }

                      if (parsed.errors) {
                        addLog(`Errors: ${JSON.stringify(parsed.errors)}`)
                      }
                    } catch (e) {
                      addLog(`Failed to parse SSE data: ${data}, Error: ${e}`)
                    }
                  }
                } else if (line.startsWith('event: complete')) {
                  addLog('Received complete event')
                  setIsConnected(false)
                  return
                }
              }

              readStream()
            })
            .catch((error) => {
              addLog(`Stream error: ${error.message}`)
              setIsConnected(false)
            })
        }

        readStream()
      })
      .catch((error) => {
        addLog(`Fetch error: ${error.message}`)
        setIsConnected(false)
      })
  }

  const pageTitle = 'SSE Subscription Test'
  const pageDescription =
    'This page tests the SSE subscription via a Next.js API proxy to the journeys-modern service without authentication.'
  const progressLabel = `Progress: ${progress}%`
  const logsLabel = 'Logs:'
  const buttonText = isConnected ? 'Testing...' : 'Test Subscription'

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {pageTitle}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {pageDescription}
      </Typography>

      <Button
        variant="contained"
        onClick={handleTestSubscription}
        disabled={isConnected}
        sx={{ mb: 3 }}
      >
        {buttonText}
      </Button>

      {progress !== null && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {progressLabel}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 2 }}
          />
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Paper>
      )}

      <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          {logsLabel}
        </Typography>
        {logs.map((log, index) => (
          <Typography
            key={index}
            variant="body2"
            component="div"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              mb: 0.5,
              wordBreak: 'break-all'
            }}
          >
            {log}
          </Typography>
        ))}
      </Paper>
    </Box>
  )
}
