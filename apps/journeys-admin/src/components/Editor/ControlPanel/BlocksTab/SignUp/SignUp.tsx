import DraftsRounded from '@mui/icons-material/DraftsRounded'
import { ReactElement } from 'react'
import { Button } from '../../Button'

export function SignUp(): ReactElement {
  const handleClick = () => {
    console.log('SignUp')
  }

  return (
    <Button icon={<DraftsRounded />} value="Subscribe" onClick={handleClick} />
  )
}
