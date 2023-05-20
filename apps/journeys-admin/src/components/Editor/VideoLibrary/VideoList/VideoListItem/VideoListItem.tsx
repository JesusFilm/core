import { ReactElement, useState } from 'react'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'
import { VideoDetails } from '../../VideoDetails'
import { MediaListItem } from '../../../../MediaListItem'

export interface VideoListItemProps {
  id: string
  title?: string
  description?: string
  image?: string
  duration?: number
  source: VideoBlockSource
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoListItem({
  id,
  title,
  description,
  image,
  source,
  duration: time,
  onSelect: handleSelect
}: VideoListItemProps): ReactElement {
  const [open, setOpen] = useState(false)

  const handleOpen = (): void => {
    setOpen(true)
  }

  const handleClose = (): void => {
    setOpen(false)
  }

  const duration =
    time != null
      ? new Date(time * 1000).toISOString().substring(time < 3600 ? 14 : 11, 19)
      : undefined

  return (
    <>
      <MediaListItem
        image={image ?? ''}
        onClick={handleOpen}
        title={title ?? ''}
        description={description ?? ''}
        duration={duration}
      />
      <VideoDetails
        id={id}
        open={open}
        source={source}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </>
  )
}
