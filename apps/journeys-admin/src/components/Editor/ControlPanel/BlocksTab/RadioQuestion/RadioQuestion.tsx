import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { ReactElement } from 'react'
import { Button } from '../../Button'

export function RadioQuestion(): ReactElement {
  const handleClick = (): void => {
    console.log('handleClick')
  }

  return (
    <Button
      icon={<ContactSupportRounded />}
      value="Poll"
      onClick={handleClick}
    />
  )
}
