import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreVert from '@mui/icons-material/MoreVert'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import BeenHereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { useSnackbar } from 'notistack'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { TemplatePublish } from '../../../../__generated__/TemplatePublish'

export const TEMPLATE_PUBLISH = gql`
  mutation TemplatePublish($id: ID!) {
    journeyPublish(id: $id) {
      id
      status
    }
  }
`

interface MenuProps {
  forceOpen?: boolean
}

export function Menu({ forceOpen }: MenuProps): ReactElement {
  const { journey } = useJourney()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openMenu = forceOpen ?? Boolean(anchorEl)
  const { enqueueSnackbar } = useSnackbar()

  const [templatePublish] = useMutation<TemplatePublish>(TEMPLATE_PUBLISH)

  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  const handleTemplatePublish = async (): Promise<void> => {
    if (journey == null) return

    await templatePublish({
      variables: { id: journey.id },
      optimisticResponse: {
        journeyPublish: {
          id: journey.id,
          __typename: 'Journey',
          status: JourneyStatus.published
        }
      }
    })
    setAnchorEl(null)
    enqueueSnackbar('Template Published', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <>
      {journey != null && (
        <>
          <IconButton
            id="single-journey-actions"
            edge="end"
            aria-controls="single-journey-actions"
            aria-haspopup="true"
            aria-expanded={openMenu ? 'true' : undefined}
            onClick={handleShowMenu}
          >
            <MoreVert />
          </IconButton>
          <MuiMenu
            id="single-journey-actions"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'journey-actions'
            }}
          >
            <MenuItem
              disabled={journey.status === JourneyStatus.published}
              onClick={handleTemplatePublish}
            >
              <ListItemIcon>
                <BeenHereRoundedIcon />
              </ListItemIcon>
              <ListItemText>Publish</ListItemText>
            </MenuItem>
          </MuiMenu>
        </>
      )}
    </>
  )
}
