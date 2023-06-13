import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import { useJourney } from '../../../libs/JourneyProvider'

// remove once backend changes are in
const chatButtons = [
  {
    id: '1',
    link: 'm.me/user',
    platform: 'facebook'
  },
  {
    id: '2',
    link: 'm.me/user2',
    platform: 'facebook'
  }
]

export function ChatButtons(): ReactElement {
  const { journey, admin } = useJourney()
  // it should open the link in a new tab to the desired messaging platform
  // it should retain the position regardless if RTL, should be on the footer but floats right
  // it should trigger a chat event and a GTM (google tag manager) event
  // it should be able to display two chat widgets max
  // it displays platform icon

  return (
    <>
      {chatButtons.map((chatButton) => (
        <IconButton key={chatButton?.id} />
      ))}
    </>
  )
}
