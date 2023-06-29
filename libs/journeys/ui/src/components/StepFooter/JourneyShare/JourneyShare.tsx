import { ReactElement } from 'react'
import Button from '@mui/material/Button'

export function JourneyShare(): ReactElement {
  async function handleShare(): Promise<void> {
    const shareDetails = {
      url: 'https://google.com',
      title: 'Share test',
      text: 'Testing hpw this displays on different platforms and devices'
    }

    try {
      await navigator.share(shareDetails)
    } catch (error) {
      console.log(error.message)
    }
  }

  return <Button onClick={handleShare}>Share Test</Button>
}
