import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { JourneyLanguageUpdate } from '../../../../../__generated__/JourneyLanguageUpdate'
import { useJourney } from '../../../../libs/context'
import { Dialog } from '../../../Dialog'
import { LanguageSelect } from '../../../LanguageSelect'

export const JOURNEY_LANGUAGE_UPDATE = gql`
  mutation JourneyLanguageUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`

interface LanguageDialogProps {
  open: boolean
  onClose: () => void
}

export function LanguageDialog({
  open,
  onClose
}: LanguageDialogProps): ReactElement {
  const [journeyUpdate] = useMutation<JourneyLanguageUpdate>(
    JOURNEY_LANGUAGE_UPDATE
  )
  const journey = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [value, setValue] = useState(journey?.language?.id)

  const handleSubmit = async (): Promise<void> => {
    if (journey == null) return

    try {
      await journeyUpdate({
        variables: {
          id: journey.id,
          input: { languageId: value }
        }
      })
    } catch (error) {
      enqueueSnackbar('There was an error updating language', {
        variant: 'error'
      })
    }
  }

  const handleChange = (value?: string): void => {
    setValue(value)
  }

  return (
    <>
      <Dialog
        open={open}
        handleClose={onClose}
        dialogTitle={{ title: 'Edit Language' }}
        dialogAction={{
          onSubmit: handleSubmit,
          closeLabel: 'Cancel'
        }}
      >
        <form onSubmit={handleSubmit}>
          <LanguageSelect
            onChange={handleChange}
            value={value}
            currentLanguageId="529"
          />
        </form>
      </Dialog>
    </>
  )
}
