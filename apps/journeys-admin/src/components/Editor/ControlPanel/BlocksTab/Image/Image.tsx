import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import { ReactElement } from 'react'
import { Button } from '../../Button'

export function Image(): ReactElement {
  const handleClick = () => {
    console.log('Image clicked')
  }

  return (
    <Button icon={<InsertPhotoRounded />} value="Image" onClick={handleClick} />
  )
}
