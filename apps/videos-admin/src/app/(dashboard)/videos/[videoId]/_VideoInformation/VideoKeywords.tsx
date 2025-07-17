import { useMutation, useQuery } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormLabel from '@mui/material/FormLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
import { useEffect, useMemo, useState } from 'react'

import { graphql } from '@core/shared/gql'

interface VideoKeywordsProps {
  primaryLanguageId: string
  initialKeywords: { id: string; value: string }[]
  onChange: (keywords: { id: string; value: string }[]) => void
}

export const GET_KEYWORDS = graphql(`
  query GetKeywords {
    keywords {
      id
      value
    }
  }
`)

export const CREATE_KEYWORD = graphql(`
  mutation CreateKeyword($value: String!, $languageId: String!) {
    createKeyword(value: $value, languageId: $languageId) {
      id
      value
    }
  }
`)

// Helper type guard
function isKeywordObject(item: unknown): item is { id: string; value: string } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'value' in item &&
    typeof (item as any).value === 'string' &&
    'id' in item &&
    typeof (item as any).id === 'string'
  )
}

export function VideoKeywords({
  primaryLanguageId,
  initialKeywords,
  onChange
}: VideoKeywordsProps) {
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useQuery(GET_KEYWORDS)
  const [createKeyword] = useMutation(CREATE_KEYWORD)
  const [selected, setSelected] = useState(initialKeywords)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    setSelected(initialKeywords)
  }, [initialKeywords])

  const options = useMemo(() => data?.keywords ?? [], [data])

  // Add keyword on Enter or comma
  const handleInputKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      const value = inputValue.trim().replace(/,$/, '')
      if (
        !value ||
        selected.some((k) => k.value.toLowerCase() === value.toLowerCase())
      ) {
        setInputValue('')
        return
      }
      try {
        const res = await createKeyword({
          variables: { value, languageId: primaryLanguageId }
        })
        const newKeyword = res.data?.createKeyword ?? {
          id: `temp-${value}`,
          value
        }
        // Ensure type safety
        if (isKeywordObject(newKeyword)) {
          const newSelected = [...selected, newKeyword]
          setSelected(newSelected)
          onChange(newSelected)
        }
      } catch {
        enqueueSnackbar('Failed to create keyword', { variant: 'error' })
      }
      setInputValue('')
    }
  }

  // Remove keyword
  const handleDelete = (id: string) => {
    const newSelected = selected.filter((k) => k.id !== id)
    setSelected(newSelected)
    onChange(newSelected)
  }

  // Filter suggestions for inline list (optimized)
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return []
    const lowerInput = inputValue.trim().toLowerCase()
    const selectedSet = new Set(selected.map((s) => s.value.toLowerCase()))
    return options
      .filter(
        (k) =>
          !selectedSet.has(k.value.toLowerCase()) &&
          k.value.toLowerCase().includes(lowerInput)
      )
      .slice(0, 10) // Limit to top 10 suggestions
  }, [inputValue, options, selected])

  // Handle suggestion click (optimized)
  const handleSuggestionClick = (keyword: { id: string; value: string }) => {
    if (selected.some((s) => s.id === keyword.id)) return
    const newSelected = [...selected, keyword]
    setSelected(newSelected)
    onChange(newSelected)
    setInputValue('')
  }

  return (
    <>
      <FormLabel sx={{ mb: 1 }}>Keywords</FormLabel>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 1,
          p: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper',
          minHeight: 56
        }}
      >
        {selected.map((option) => (
          <Chip
            key={option.id}
            label={option.value}
            onDelete={() => handleDelete(option.id)}
            deleteIcon={<CloseIcon />}
            sx={{ my: 0.25 }}
          />
        ))}
        <TextField
          placeholder="Add keyword"
          variant="standard"
          multiline
          minRows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          sx={{
            flex: 1,
            minWidth: 120,
            border: 'none',
            background: 'transparent',
            '& .MuiInputBase-root': { p: 0 },
            '& textarea': { p: 0, background: 'transparent' }
          }}
          InputProps={{
            disableUnderline: true
          }}
        />
      </Box>
      {suggestions.length > 0 && (
        <List
          sx={{
            mt: 0.5,
            mb: 1,
            boxShadow: 1,
            borderRadius: 1,
            bgcolor: 'background.paper',
            maxHeight: 200,
            overflow: 'auto',
            p: 0
          }}
        >
          {suggestions.map((s) => (
            <ListItem key={s.id} disablePadding>
              <ListItemButton onClick={() => handleSuggestionClick(s)}>
                <ListItemText primary={s.value} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </>
  )
}
