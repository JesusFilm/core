import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { JourneyDuplicate } from '../../../../../../__generated__/JourneyDuplicate'

interface DuplicateJourneyMenuItemProps {
  journeyId?: string
}

export const JOURNEY_DUPLICATE = gql`
  mutation JourneyDuplicate($id: ID!) {
    journeyDuplicate(id: $id) {
      id
    }
  }
`

export function DuplicateJourneyMenuItem({
  journeyId
}: DuplicateJourneyMenuItemProps): ReactElement {
  const [journeyDuplicate] = useMutation<JourneyDuplicate>(JOURNEY_DUPLICATE)
  const { enqueueSnackbar } = useSnackbar()

  const handleDuplicateJourney = async (): Promise<void> => {
    if (journeyId == null) return

    await journeyDuplicate({
      variables: {
        id: journeyId
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
    enqueueSnackbar(`Journey Duplicated`, {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <MenuItem
      onClick={handleDuplicateJourney}
      sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
    >
      <ListItemIcon>
        <ContentCopyRounded color="secondary" />
      </ListItemIcon>
      <ListItemText>
        <Typography variant="body1" sx={{ pl: 2 }}>
          Duplicate
        </Typography>
      </ListItemText>
    </MenuItem>
  )
}
