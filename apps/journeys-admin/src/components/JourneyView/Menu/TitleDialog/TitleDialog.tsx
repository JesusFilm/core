import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import TextField from '@mui/material/TextField'
import { useSnackbar } from 'notistack'
import { useFormik } from 'formik'
import { JourneyTitleUpdate } from '../../../../../__generated__/JourneyTitleUpdate'
import { useJourney } from '../../../../libs/context'
import { Dialog } from '../../../Dialog'

export const JOURNEY_TITLE_UPDATE = gql`
  mutation JourneyTitleUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      title
    }
  }
`

interface TitleDialogProps {
  open: boolean
  onClose: () => void
}

export function TitleDialog({ open, onClose }: TitleDialogProps): ReactElement {
  const [journeyUpdate] = useMutation<JourneyTitleUpdate>(JOURNEY_TITLE_UPDATE)
  const journey = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (): Promise<void> => {
    if (journey == null) return

    const updatedJourney = { title: formik.values.title }

    try {
      await journeyUpdate({
        variables: { id: journey.id, input: updatedJourney },
        optimisticResponse: {
          journeyUpdate: {
            id: journey.id,
            __typename: 'Journey',
            ...updatedJourney
          }
        }
      })
    } catch (error) {
      enqueueSnackbar('There was an error updating title', { variant: 'error' })
    }
  }

  const handleClose = (): void => {
    formik.resetForm()
    onClose()
  }

  const formik = useFormik({
    initialValues: {
      title: journey?.title ?? ''
    },
    onSubmit: handleSubmit,
    enableReinitialize: true
  })

  return (
    <>
      <Dialog
        open={open}
        handleClose={handleClose}
        dialogTitle={{ title: 'Edit Title' }}
        dialogAction={{
          onSubmit: handleSubmit,
          closeLabel: 'Cancel'
        }}
      >
        <form onSubmit={handleSubmit}>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" aria-label="form-update-title" />
            <TextField
              id="title"
              name="title"
              hiddenLabel
              value={formik.values.title}
              variant="filled"
              onChange={formik.handleChange}
            />
          </FormControl>
        </form>
      </Dialog>
    </>
  )
}
