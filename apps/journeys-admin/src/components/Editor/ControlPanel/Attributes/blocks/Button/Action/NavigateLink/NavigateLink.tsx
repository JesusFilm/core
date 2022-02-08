import { ReactElement, useState, ChangeEvent } from 'react'
import TextField from '@mui/material/TextField'

export function NavigateLink(): ReactElement {
  // get default value from store or nothing
  const [link, setLink] = useState('')

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setLink(event.target.value)
  }

  // update mutation on un select to send link

  return (
    <TextField
      placeholder="Past URL here..."
      variant="filled"
      hiddenLabel
      value={link}
      onChange={handleChange}
    />
  )
}
