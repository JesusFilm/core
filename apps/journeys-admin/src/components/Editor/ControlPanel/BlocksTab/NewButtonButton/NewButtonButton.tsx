import { ReactElement } from 'react'
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded'
import { Button } from '../../Button'

export function NewButtonButton(): ReactElement {
  return <Button icon={<RadioButtonCheckedRounded />} value="Button" />
}
