'use client'

import { useMutation, useQuery } from '@apollo/client'
import { DragEndEvent } from '@dnd-kit/core'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { graphql } from 'gql.tada'
import { usePathname, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { OrderedList } from '../../../../../components/OrderedList'
import { OrderedItem } from '../../../../../components/OrderedList/OrderedItem'
import { Section } from '../../../../../components/Section'
import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

export const GET_VIDEO_BIBLE_CITATIONS = graphql(`
  query GetVideoBibleCitations($videoId: ID!, $languageId: ID!) {
    bibleCitations(videoId: $videoId) {
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
`)

export const UPDATE_BIBLE_CITATION_ORDER = graphql(`
  mutation UpdateBibleCitationOrder($input: MutationBibleCitationUpdateInput!) {
    bibleCitationUpdate(input: $input) {
      id
      order
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
  const [reloadOnPathChange, setReloadOnPathChange] = useState(false)
  const pathname = usePathname()
  const [updateBibleCitationOrder] = useMutation(UPDATE_BIBLE_CITATION_ORDER, {
    onError: (error) => {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  })

  const { data, refetch } = useQuery(GET_VIDEO_BIBLE_CITATIONS, {
    variables: { videoId, languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

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

  async function updateOrderOnDrag(e: DragEndEvent): Promise<void> {
    const { active, over } = e
    if (over == null || data == null) return
    if (e.active.id !== over.id) {
      const oldIndex = data.bibleCitations.findIndex(
        (item) => item.id === active.id
      )
      const newIndex = data.bibleCitations.findIndex(
        (item) => item.id === over.id
      )

      const citationToMove = data.bibleCitations.find((q) => q.id === active.id)
      if (!citationToMove) return

      // Create a new array with the reordered items
      const updatedCitations = [...data.bibleCitations]
      const [movedItem] = updatedCitations.splice(oldIndex, 1)
      updatedCitations.splice(newIndex, 0, movedItem)

      try {
        // Update all citations in sequence
        for (let i = 0; i < updatedCitations.length; i++) {
          const citation = updatedCitations[i]
          await updateBibleCitationOrder({
            variables: {
              input: { id: citation.id, order: i + 1 }
            }
          })
        }
        enqueueSnackbar('Citation order updated', { variant: 'success' })
        void refetch()
      } catch (_error) {
        enqueueSnackbar('Error updating bible citation order:', {
          variant: 'error'
        })
        void refetch()
      }
    }
  }

  useEffect(() => {
    if (reloadOnPathChange) void refetch()
    setReloadOnPathChange(pathname?.includes('citation') ?? false)
  }, [pathname])

  return (
    <Section title="Bible Citations" variant="outlined">
      {data == null || data.bibleCitations.length === 0 ? (
        <Section.Fallback>No Bible citations</Section.Fallback>
      ) : (
        <OrderedList
          onOrderUpdate={updateOrderOnDrag}
          items={data.bibleCitations}
        >
          {data.bibleCitations.map((citation) => (
            <OrderedItem
              key={citation.id}
              id={citation.id}
              label={`${citation.bibleBook.name[0]?.value ?? citation.osisId} ${formatVerse(citation)}`}
              idx={citation.order - 1}
              menuActions={[
                {
                  label: 'Edit',
                  handler: (id) =>
                    router.push(`/videos/${videoId}/citation/${id}`, {
                      scroll: false
                    })
                },
                {
                  label: 'Delete',
                  handler: (id) =>
                    router.push(`/videos/${videoId}/citation/${id}/delete`, {
                      scroll: false
                    })
                }
              ]}
            />
          ))}
        </OrderedList>
      )}
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() =>
            router.push(`/videos/${videoId}/citation/add`, {
              scroll: false
            })
          }
          size="small"
          color="secondary"
        >
          Add
        </Button>
      </Stack>
    </Section>
  )
}
