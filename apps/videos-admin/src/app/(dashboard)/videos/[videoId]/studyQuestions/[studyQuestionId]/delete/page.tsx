'use client'

import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

const DELETE_STUDY_QUESTION = graphql(`
  mutation DeleteStudyQuestion($id: ID!) {
    videoStudyQuestionDelete(id: $id) {
      id
    }
  }
`)

interface StudyQuestionDeletePageProps {
  params: {
    videoId: string
    studyQuestionId: string
  }
}

export default function StudyQuestionDeletePage({
  params: { videoId, studyQuestionId }
}: StudyQuestionDeletePageProps) {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [deleteStudyQuestion, { loading: deleteLoading }] = useMutation(
    DELETE_STUDY_QUESTION,
    {
      onCompleted: () => {
        enqueueSnackbar('Study question deleted', { variant: 'success' })
        router.push(`/videos/${videoId}`)
      },
      onError: (error) => {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  )

  const handleDeleteQuestion = async (): Promise<void> => {
    await deleteStudyQuestion({
      variables: {
        id: studyQuestionId
      }
    })
  }

  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}`)}
      aria-labelledby="delete-study-question-dialog-title"
    >
      <DialogTitle id="delete-study-question-dialog-title">
        Delete Study Question
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this study question? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => router.push(`/videos/${videoId}`)}
          disabled={deleteLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeleteQuestion}
          color="error"
          disabled={deleteLoading}
          autoFocus
        >
          {deleteLoading ? <CircularProgress size={20} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
