'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Form, Formik, FormikValues } from 'formik'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { number, object, string } from 'yup'

import { graphql } from '@core/shared/gql'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../constants'

const GET_BIBLE_CITATION = graphql(`
  query GetBibleCitation($id: ID!) {
    bibleCitation(id: $id) {
      id
      bibleBook {
        id
      }
      chapterStart
      chapterEnd
      verseStart
      verseEnd
    }
  }
`)

const GET_BIBLE_BOOKS = graphql(`
  query GetBibleBooks($languageId: ID!) {
    bibleBooks {
      id
      osisId
      name(languageId: $languageId) {
        value
      }
    }
  }
`)

const UPDATE_BIBLE_CITATION = graphql(`
  mutation UpdateBibleCitation($input: MutationBibleCitationUpdateInput!) {
    bibleCitationUpdate(input: $input) {
      id
      osisId
      chapterStart
      chapterEnd
      verseStart
      verseEnd
      order
      bibleBook {
        id
        name {
          value
        }
      }
    }
  }
`)

const GET_VIDEO_BIBLE_CITATIONS_COUNT = graphql(`
  query GetVideoBibleCitationsCount($videoId: ID!) {
    bibleCitations(videoId: $videoId) {
      id
      order
    }
  }
`)

const CREATE_BIBLE_CITATION = graphql(`
  mutation CreateBibleCitation($input: MutationBibleCitationCreateInput!) {
    bibleCitationCreate(input: $input) {
      id
      osisId
      chapterStart
      chapterEnd
      verseStart
      verseEnd
      order
      bibleBook {
        id
        name {
          value
        }
      }
    }
  }
`)

type CitationFormProps =
  | {
      videoId: string
      citationId?: undefined
      variant?: 'create'
    }
  | {
      videoId: string
      citationId: string
      variant: 'edit'
    }

export function CitationForm({
  videoId,
  citationId,
  variant = 'create'
}: CitationFormProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const returnUrl = `/videos/${videoId}`
  const { data: bibleBookData } = useSuspenseQuery(GET_BIBLE_BOOKS, {
    variables: { languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const { data: citationData } = useSuspenseQuery(GET_BIBLE_CITATION, {
    variables: { id: citationId ?? '' },
    skip: !citationId
  })
  const { data: citationsData } = useSuspenseQuery(
    GET_VIDEO_BIBLE_CITATIONS_COUNT,
    {
      variables: { videoId }
    }
  )

  const [createBibleCitation, { loading: createLoading }] = useMutation(
    CREATE_BIBLE_CITATION
  )
  const [updateBibleCitation, { loading }] = useMutation(UPDATE_BIBLE_CITATION)

  const nextOrder =
    citationsData.bibleCitations.length > 0
      ? Math.max(
          ...citationsData.bibleCitations.map((citation) => citation.order ?? 0)
        ) + 1
      : 1

  const bibleBooks = bibleBookData.bibleBooks
  const validationSchema = object().shape({
    bibleBookId: string().required('Bible book is required'),
    chapterStart: number()
      .typeError('Chapter must be a number')
      .required('Start chapter is required')
      .positive('Start chapter must be a positive number'),
    chapterEnd: number()
      .typeError('Chapter must be a number')
      .nullable()
      .test(
        'greaterThanChapterStart',
        'End chapter must be greater than or equal to start chapter',
        function (value) {
          const { chapterStart } = this.parent
          return !value || value >= chapterStart
        }
      ),
    verseStart: number()
      .typeError('Verse must be a number')
      .nullable()
      .positive('Start verse must be a positive number'),
    verseEnd: number()
      .typeError('Verse must be a number')
      .nullable()
      .test(
        'greaterThanVerseStart',
        'End verse must be greater than or equal to start verse',
        function (value) {
          const { verseStart } = this.parent
          return !value || !verseStart || value >= verseStart
        }
      )
  })

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    if (citationId) {
      // Find the selected book to get its osisId
      const selectedBook = bibleBooks.find(
        (book) => book.id === values.bibleBookId
      )

      if (!selectedBook) {
        enqueueSnackbar('Selected Bible book not found', {
          variant: 'error'
        })
        return
      }

      await updateBibleCitation({
        variables: {
          input: {
            id: citationId,
            bibleBookId: values.bibleBookId,
            osisId: selectedBook.osisId,
            chapterStart: values.chapterStart,
            chapterEnd:
              values.chapterEnd === '' ? null : (values.chapterEnd ?? null),
            verseStart:
              values.verseStart === '' ? null : (values.verseStart ?? null),
            verseEnd: values.verseEnd === '' ? null : (values.verseEnd ?? null)
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Bible citation updated successfully', {
            variant: 'success'
          })
          router.push(returnUrl, {
            scroll: false
          })
        },
        onError: (error) => {
          enqueueSnackbar(`Error updating Bible citation: ${error.message}`, {
            variant: 'error'
          })
        }
      })
    } else {
      const selectedBook = bibleBooks.find(
        (book) => book.id === values.bibleBookId
      )

      if (!selectedBook) {
        enqueueSnackbar('Selected Bible book not found', { variant: 'error' })
        return
      }

      await createBibleCitation({
        variables: {
          input: {
            videoId,
            bibleBookId: values.bibleBookId,
            osisId: selectedBook.osisId,
            chapterStart: values.chapterStart,
            chapterEnd:
              values.chapterEnd === '' ? null : (values.chapterEnd ?? null),
            verseStart:
              values.verseStart === '' ? null : (values.verseStart ?? null),
            verseEnd: values.verseEnd === '' ? null : (values.verseEnd ?? null),
            order: nextOrder
          }
        },
        onCompleted: () => {
          enqueueSnackbar('Bible citation added successfully', {
            variant: 'success'
          })
          router.push(returnUrl, {
            scroll: false
          })
        },
        onError: (error) => {
          enqueueSnackbar(`Error adding Bible citation: ${error.message}`, {
            variant: 'error'
          })
        }
      })
    }
  }

  return (
    <Formik
      initialValues={
        citationData != null
          ? {
              bibleBookId: citationData.bibleCitation.bibleBook.id,
              chapterStart: citationData.bibleCitation.chapterStart,
              chapterEnd: citationData.bibleCitation.chapterEnd,
              verseStart: citationData.bibleCitation.verseStart,
              verseEnd: citationData.bibleCitation.verseEnd
            }
          : {
              bibleBookId: '',
              chapterStart: '',
              chapterEnd: '',
              verseStart: '',
              verseEnd: ''
            }
      }
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      {({ values, errors, handleChange, isValid, isSubmitting, dirty }) => (
        <Form>
          <Stack gap={3}>
            <FormControl fullWidth>
              <InputLabel id="bibleBookId-label">Bible Book</InputLabel>
              <Select
                labelId="bibleBookId-label"
                id="bibleBookId"
                name="bibleBookId"
                value={values.bibleBookId}
                label="Bible Book"
                onChange={handleChange}
                error={Boolean(errors.bibleBookId)}
              >
                {bibleBookData.bibleBooks.map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    {book.name[0].value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                id="chapterStart"
                name="chapterStart"
                label="Start Chapter"
                type="number"
                value={values.chapterStart}
                onChange={handleChange}
                error={Boolean(errors.chapterStart)}
                helperText={errors.chapterStart as string}
                fullWidth
              />
              <TextField
                id="chapterEnd"
                name="chapterEnd"
                label="End Chapter (optional)"
                type="number"
                value={values.chapterEnd}
                onChange={handleChange}
                error={Boolean(errors.chapterEnd)}
                helperText={errors.chapterEnd as string}
                fullWidth
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                id="verseStart"
                name="verseStart"
                label="Start Verse (optional)"
                type="number"
                value={values.verseStart}
                onChange={handleChange}
                error={Boolean(errors.verseStart)}
                helperText={errors.verseStart as string}
                fullWidth
              />
              <TextField
                id="verseEnd"
                name="verseEnd"
                label="End Verse (optional)"
                type="number"
                value={values.verseEnd}
                onChange={handleChange}
                error={Boolean(errors.verseEnd)}
                helperText={errors.verseEnd as string}
                fullWidth
              />
            </Stack>

            <Stack direction="row" gap={2} justifyContent="flex-end">
              <Button
                type="submit"
                variant="outlined"
                color="secondary"
                disabled={
                  !isValid || !dirty || isSubmitting || loading || createLoading
                }
              >
                {variant === 'create' ? 'Add' : 'Update'}
              </Button>
            </Stack>
          </Stack>
        </Form>
      )}
    </Formik>
  )
}
