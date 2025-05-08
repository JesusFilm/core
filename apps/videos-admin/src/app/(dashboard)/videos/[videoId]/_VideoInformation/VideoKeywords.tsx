import { useMutation, useQuery } from '@apollo/client'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { useEffect, useMemo, useState } from 'react'

interface VideoKeywordsProps {
  videoId: string
  primaryLanguageId: string
  initialKeywords: { id: string; value: string }[]
  onChange: (keywords: { id: string; value: string }[]) => void
}

const GET_KEYWORDS = graphql(`
  query GetKeywords {
    keywords {
      id
      value
    }
  }
`)

const CREATE_KEYWORD = graphql(`
  mutation CreateKeyword($value: String!, $languageId: String!) {
    createKeyword(value: $value, languageId: $languageId) {
      id
      value
    }
  }
`)

export function VideoKeywords({
  videoId,
  primaryLanguageId,
  initialKeywords,
  onChange
}: VideoKeywordsProps) {
  const { enqueueSnackbar } = useSnackbar()
  const { data, loading } = useQuery(GET_KEYWORDS)
  const [createKeyword] = useMutation(CREATE_KEYWORD)
  const [selected, setSelected] = useState(initialKeywords)

  useEffect(() => {
    setSelected(initialKeywords)
  }, [initialKeywords])

  const options = useMemo(() => data?.keywords ?? [], [data])

  const handleChange = async (
    _event: unknown,
    values: { id?: string; value: string }[]
  ) => {
    // Check for new keywords (no id)
    const newKeywords = await Promise.all(
      values.map(async (item) => {
        if (item.id) return item
        try {
          const res = await createKeyword({
            variables: { value: item.value, languageId: primaryLanguageId }
          })
          return res.data?.createKeyword ?? item
        } catch (e) {
          enqueueSnackbar('Failed to create keyword', { variant: 'error' })
          return item
        }
      })
    )
    setSelected(newKeywords)
    onChange(newKeywords)
  }

  return (
    <Stack>
      <Autocomplete
        multiple
        freeSolo
        options={options}
        getOptionLabel={(option) => option.value}
        value={selected}
        onChange={handleChange}
        filterSelectedOptions
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Keywords"
            placeholder="Add keyword"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option.value}
              {...getTagProps({ index })}
              key={option.id ?? option.value}
            />
          ))
        }
      />
    </Stack>
  )
}
