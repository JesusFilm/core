import { ReactElement } from 'react'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { ContainedIconButton } from '../../../../ContainedIconButton'

interface SourceEmptyProps {
  onClick: () => void
}
export function SourceEmpty({ onClick }: SourceEmptyProps): ReactElement {
  return (
    <ContainedIconButton
      onClick={onClick}
      thumbnailIcon={<VideocamRoundedIcon />}
      label="Select Video"
      actionIcon={<AddRoundedIcon color="primary" />}
    />
  )
}
