'use client'

import { useMutation, useSuspenseQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Form, Formik, FormikValues } from 'formik'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'
import { number, object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../../constants'

const GET_BIBLE_BOOKS = graphql(`
  query GetBibleBooks($languageId: ID!) {
    bibleBooks {
      id
      osisId
      name(languageId: $languageId) {
        value
      }
      isNewTestament
      order
    }
  }
`)

const CREATE_BIBLE_CITATION = graphql(`
  mutation CreateBibleCitation($input: BibleCitationCreateInput!) {
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

const GET_VIDEO_BIBLE_CITATIONS_COUNT = graphql(`
  query GetVideoBibleCitationsCount($id: ID!) {
    adminVideo(id: $id) {
      id
      bibleCitations {
        id
      }
    }
  }
`)

interface AddBibleCitationProps {
  params: {
    videoId: string
  }
}

const validationSchema = object().shape({
  bibleBookId: string().required('Bible book is required'),
  chapterStart: number()
    .required('Start chapter is required')
    .min(1, 'Start chapter must be at least 1'),
  chapterEnd: number()
    .nullable()
    .min(1, 'End chapter must be at least 1')
    .test(
      'greater-than-start',
      'End chapter must be greater than or equal to start chapter',
      function (value) {
        if (value === null || value === undefined) return true
        const { chapterStart } = this.parent
        return value >= chapterStart
      }
    ),
  verseStart: number().nullable().min(1, 'Start verse must be at least 1'),
  verseEnd: number()
    .nullable()
    .min(1, 'End verse must be at least 1')
    .test(
      'greater-than-start',
      'End verse must be greater than or equal to start verse',
      function (value) {
        if (value === null || value === undefined) return true
        const { verseStart, chapterStart, chapterEnd } = this.parent
        // If same chapter or single chapter, verify verseEnd >= verseStart
        if (
          verseStart !== null &&
          verseStart !== undefined &&
          (chapterEnd === null ||
            chapterEnd === undefined ||
            chapterEnd === chapterStart)
        ) {
          return value >= verseStart
        }
        return true
      }
    )
})

const initialValues: FormikValues = {
  bibleBookId: '',
  chapterStart: '',
  chapterEnd: '',
  verseStart: '',
  verseEnd: ''
}

export default function AddBibleCitation({
  params: { videoId }
}: AddBibleCitationProps): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [createBibleCitation] = useMutation(CREATE_BIBLE_CITATION)

  const { data: bibleBookData } = useSuspenseQuery(GET_BIBLE_BOOKS, {
    variables: { languageId: DEFAULT_VIDEO_LANGUAGE_ID }
  })

  const { data: citationsData } = useSuspenseQuery(
    GET_VIDEO_BIBLE_CITATIONS_COUNT,
    {
      variables: { id: videoId }
    }
  )

  const nextOrder = citationsData?.adminVideo.bibleCitations.length ?? 0

  const bibleBooks = bibleBookData?.bibleBooks ?? []

  const returnUrl = `/videos/${videoId}`

  const handleSubmit = async (values: FormikValues): Promise<void> => {
    try {
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
            chapterStart: Number(values.chapterStart),
            chapterEnd: values.chapterEnd ? Number(values.chapterEnd) : null,
            verseStart: values.verseStart ? Number(values.verseStart) : null,
            verseEnd: values.verseEnd ? Number(values.verseEnd) : null,
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
        },
        update: (cache, { data }) => {
          if (data?.bibleCitationCreate == null) return

          // Update the cache to include the new bible citation
          cache.modify({
            id: cache.identify({
              __typename: 'Video',
              id: videoId
            }),
            fields: {
              bibleCitations(existingCitations = []) {
                const newCitationRef = cache.writeFragment({
                  data: data.bibleCitationCreate,
                  fragment: graphql(`
                    fragment NewBibleCitation on BibleCitation {
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
                  `)
                })
                return [...existingCitations, newCitationRef]
              }
            }
          })
        }
      })
    } catch (error) {
      console.error('Error creating Bible citation:', error)
      enqueueSnackbar(
        `Error creating Bible citation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        { variant: 'error' }
      )
    }
  }

  return (
    <Dialog
      open={true}
      onClose={() => router.push(returnUrl, { scroll: false })}
      dialogTitle={{
        title: 'Add Bible Citation',
        closeButton: true
      }}
      divider
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, isSubmitting, isValid }) => (
          <Form>
            <Stack gap={3}>
              <FormControl
                fullWidth
                error={touched.bibleBookId && Boolean(errors.bibleBookId)}
              >
                <InputLabel id="bible-book-label">Bible Book</InputLabel>
                <Select
                  labelId="bible-book-label"
                  id="bibleBookId"
                  name="bibleBookId"
                  value={values.bibleBookId}
                  onChange={handleChange}
                  label="Bible Book"
                  error={touched.bibleBookId && Boolean(errors.bibleBookId)}
                >
                  <MenuItem value="" disabled>
                    <em>Select a Bible book</em>
                  </MenuItem>
                  <Divider />
                  <MenuItem disabled>
                    <Typography variant="subtitle2">Old Testament</Typography>
                  </MenuItem>
                  {bibleBooks
                    .filter((book) => !book.isNewTestament)
                    .sort((a, b) => a.order - b.order)
                    .map((book) => (
                      <MenuItem key={book.id} value={book.id}>
                        {book.name[0]?.value ?? book.osisId}
                      </MenuItem>
                    ))}
                  <Divider />
                  <MenuItem disabled>
                    <Typography variant="subtitle2">New Testament</Typography>
                  </MenuItem>
                  {bibleBooks
                    .filter((book) => book.isNewTestament)
                    .sort((a, b) => a.order - b.order)
                    .map((book) => (
                      <MenuItem key={book.id} value={book.id}>
                        {book.name[0]?.value ?? book.osisId}
                      </MenuItem>
                    ))}
                </Select>
                <FormHelperText>
                  {touched.bibleBookId && errors.bibleBookId
                    ? errors.bibleBookId
                    : ''}
                </FormHelperText>
              </FormControl>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  name="chapterStart"
                  label="Start Chapter"
                  type="number"
                  value={values.chapterStart}
                  onChange={handleChange}
                  error={touched.chapterStart && Boolean(errors.chapterStart)}
                  helperText={
                    touched.chapterStart && errors.chapterStart
                      ? errors.chapterStart
                      : ''
                  }
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  name="chapterEnd"
                  label="End Chapter (optional)"
                  type="number"
                  value={values.chapterEnd}
                  onChange={handleChange}
                  error={touched.chapterEnd && Boolean(errors.chapterEnd)}
                  helperText={
                    touched.chapterEnd && errors.chapterEnd
                      ? errors.chapterEnd
                      : ''
                  }
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  name="verseStart"
                  label="Start Verse (optional)"
                  type="number"
                  value={values.verseStart}
                  onChange={handleChange}
                  error={touched.verseStart && Boolean(errors.verseStart)}
                  helperText={
                    touched.verseStart && errors.verseStart
                      ? errors.verseStart
                      : ''
                  }
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  name="verseEnd"
                  label="End Verse (optional)"
                  type="number"
                  value={values.verseEnd}
                  onChange={handleChange}
                  error={touched.verseEnd && Boolean(errors.verseEnd)}
                  helperText={
                    touched.verseEnd && errors.verseEnd ? errors.verseEnd : ''
                  }
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                Note: For an entire chapter, leave verses blank. For a single
                verse, use the same number for start and end verses.
              </Typography>

              <Divider />

              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isValid}
                >
                  Add Bible Citation
                </Button>
              </Box>
            </Stack>
          </Form>
        )}
      </Formik>
    </Dialog>
  )
}
