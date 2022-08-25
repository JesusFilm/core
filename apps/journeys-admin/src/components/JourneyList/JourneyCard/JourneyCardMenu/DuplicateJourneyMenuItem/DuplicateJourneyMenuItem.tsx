import { ReactElement } from 'react'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { JourneyDuplicate } from '../../../../../../__generated__/JourneyDuplicate'
import { MenuItem } from '../../../../MenuItem'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export const JOURNEY_DUPLICATE = gql`
  mutation JourneyDuplicate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export function DuplicateJourneyMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const [journeyDuplicate] = useMutation<JourneyDuplicate>(JOURNEY_DUPLICATE)
  const { enqueueSnackbar } = useSnackbar()

  const handleDuplicateJourney = async (): Promise<void> => {
    if (id == null) return

    await journeyDuplicate({
      variables: {
        id
      },
      update(cache, { data }) {
        if (data?.journeyDuplicate != null) {
          cache.modify({
            fields: {
              adminJourneys(existingAdminJourneyRefs = []) {
                const duplicatedJourneyRef = cache.writeFragment({
                  data: data.journeyDuplicate,
                  fragment: gql`
                    fragment DuplicatedJourney on Journey {
                      id
                    }
                  `
                })
                return [...existingAdminJourneyRefs, duplicatedJourneyRef]
              }
            }
          })
        }
      }
    })
    handleCloseMenu()
    enqueueSnackbar(`Journey Duplicated`, {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <MenuItem
      label="Duplicate"
      icon={<ContentCopyRounded color="secondary" />}
      onClick={handleDuplicateJourney}
    />
  )
}
