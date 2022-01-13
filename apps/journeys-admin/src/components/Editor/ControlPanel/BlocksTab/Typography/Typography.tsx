import { ReactElement } from 'react'
import TextFieldsRounded from '@mui/icons-material/TextFieldsRounded'
import { Button } from '../../Button'

export function Typography(): ReactElement {
  const handleClick = (): void => {
    console.log('typography clicked')
  }

  return (
    <Button icon={<TextFieldsRounded />} value="Text" onClick={handleClick} />
  )
}
