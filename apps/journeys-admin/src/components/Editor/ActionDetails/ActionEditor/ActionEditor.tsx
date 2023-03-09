import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'

interface ActionEditorProps {
  url: string
}

export function ActionEditor({ url }: ActionEditorProps): ReactElement {
  return <Typography variant="body1">{url}</Typography>
}
