'use client'

import { gql, useMutation } from '@apollo/client'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

export const REINDEX_LANGUAGES_IN_ALGOLIA = gql`
  mutation ReindexLanguagesInAlgolia {
    reindexLanguagesInAlgolia {
      count
    }
  }
`

interface ReindexLanguagesInAlgoliaData {
  reindexLanguagesInAlgolia: {
    count: number
  }
}

export function LanguageDebug(): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [lastReindexedCount, setLastReindexedCount] = useState<number | null>(
    null
  )
  const [reindexLanguagesInAlgolia, { loading }] =
    useMutation<ReindexLanguagesInAlgoliaData>(REINDEX_LANGUAGES_IN_ALGOLIA)

  const handleReindex = async (): Promise<void> => {
    try {
      const { data } = await reindexLanguagesInAlgolia()
      const count = data?.reindexLanguagesInAlgolia.count ?? 0
      setLastReindexedCount(count)
      enqueueSnackbar(`Reindexed ${count} languages in Algolia`, {
        variant: 'success'
      })
    } catch {
      enqueueSnackbar('Failed to reindex languages in Algolia', {
        variant: 'error'
      })
    }
  }

  return (
    <Paper sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={2} sx={{ maxWidth: 640 }}>
        <Typography component="h3" variant="h6">
          Reindex languages in Algolia
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Pushes every language that has videos into the Algolia languages
          index. Use this to repair languages that are playable and appear in
          the language list but return no results in the search bar.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            void handleReindex()
          }}
          disabled={loading}
          aria-label="Reindex languages in Algolia"
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{ alignSelf: 'flex-start' }}
        >
          {loading ? 'Reindexing…' : 'Reindex languages'}
        </Button>
        {lastReindexedCount != null && !loading ? (
          <Alert severity="success">
            Last run reindexed {lastReindexedCount} languages.
          </Alert>
        ) : null}
      </Stack>
    </Paper>
  )
}
