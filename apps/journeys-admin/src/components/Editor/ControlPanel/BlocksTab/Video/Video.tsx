import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { ReactElement } from 'react'
import { Button } from '../../Button'

export function Video(): ReactElement {
  const handleClick = () => {
    console.log('hello')
  }

  return (
    <Button icon={<VideocamRounded />} value="Video" onClick={handleClick} />
  )
}
