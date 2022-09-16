import { ReactElement } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import { Button } from '../../Button'

export function NewTextResponseButton(): ReactElement {
  const handleClick = async (): Promise<void> => {
    console.log('logic here')
  }
  return <Button icon={<LinkIcon />} value="Text Field" onClick={handleClick} />
}
