'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

export const GET_VIDEO_BIBLE_CITATIONS = graphql(`
  query GetVideoBibleCitations($videoId: ID!, $languageId: ID!) {
    adminVideo(id: $videoId) {
      id
      bibleCitations {
        id
        osisId
        chapterStart
        chapterEnd
        verseStart
        verseEnd
        order
        bibleBook {
          id
          name(languageId: $languageId) {
            value
          }
        }
      }
    }
  }
`)

export const DELETE_BIBLE_CITATION = graphql(`
  mutation DeleteBibleCitation($id: ID!) {
    bibleCitationDelete(id: $id) {
      id
    }
  }
`)

interface VideoBibleCitationProps {
  videoId: string
}

export function VideoBibleCitation({
  videoId
}: VideoBibleCitationProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteBibleCitation] = useMutation(DELETE_BIBLE_CITATION)

  const { data } = useSuspenseQuery(GET_VIDEO_BIBLE_CITATIONS, {
    variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const bibleCitations = data?.adminVideo.bibleCitations ?? []

  const handleDelete = async (id: string): Promise<void> => {
    await deleteBibleCitation({
      variables: { id },
      update: (cache, { data }) => {
        if (data?.bibleCitationDelete == null) return

        cache.modify({
          id: cache.identify({
            __typename: 'Video',
            id: videoId
          }),
          fields: {
            bibleCitations(existingCitations = [], { readField }) {
              return existingCitations.filter(
                (citationRef) => readField('id', citationRef) !== id
              )
            }
          }
        })
      },
      onCompleted: () => {
        enqueueSnackbar('Bible citation deleted successfully', {
          variant: 'success'
        })
      },
      onError: () => {
        enqueueSnackbar('Failed to delete Bible citation', {
          variant: 'error'
        })
      }
    })
  }

  const handleAdd = (): void => {
    router.push(`/videos/${videoId}/bible-citations/add`, {
      scroll: false
    })
  }

  const formatVerse = (citation: {
    chapterStart: number
    chapterEnd?: number | null
    verseStart?: number | null
    verseEnd?: number | null
  }): string => {
    const { chapterStart, chapterEnd, verseStart, verseEnd } = citation

    if (chapterEnd == null || chapterEnd === chapterStart) {
      // Single chapter
      if (verseStart == null) {
        return `${chapterStart}`
      }
      if (verseEnd == null || verseEnd === verseStart) {
        return `${chapterStart}:${verseStart}`
      }
      return `${chapterStart}:${verseStart}-${verseEnd}`
    }

    // Multiple chapters
    if (verseStart == null) {
      return `${chapterStart}-${chapterEnd}`
    }
    if (verseEnd == null) {
      return `${chapterStart}:${verseStart}-${chapterEnd}`
    }
    return `${chapterStart}:${verseStart}-${chapterEnd}:${verseEnd}`
  }

  return (
    <Stack gap={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Bible Citations</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          data-testid="AddBibleCitationButton"
        >
          Add Bible Citation
        </Button>
      </Box>

      {bibleCitations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No Bible citations added yet
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Bible Book</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bibleCitations
                .sort((a, b) => a.order - b.order)
                .map((citation) => (
                  <TableRow key={citation.id}>
                    <TableCell>{citation.order}</TableCell>
                    <TableCell>
                      {citation.bibleBook.name[0]?.value ?? citation.osisId}
                    </TableCell>
                    <TableCell>{formatVerse(citation)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleDelete(citation.id)}
                        size="small"
                        aria-label="delete"
                        data-testid={`DeleteBibleCitation-${citation.id}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ mx: -4 }} />
    </Stack>
  )
}
