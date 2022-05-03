import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useJourney } from '../../../libs/context'
import { DeleteBlock } from './DeleteBlock'
import { Menu } from './Menu'

export function EditToolbar(): ReactElement {
  const journey = useJourney()

  return (
    <>
      <IconButton
        aria-label="Preview"
        href={`/api/preview?slug=${journey?.slug ?? ''}`}
        target="_blank"
        disabled={journey == null}
      >
        <VisibilityIcon />
      </IconButton>
      <DeleteBlock variant="button" />
      <Menu />
    </>
  )
}
