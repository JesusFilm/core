import ViewCarouselIcon from '@mui/icons-material/ViewCarousel'
import Divider from '@mui/material/Divider'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { JourneyFields as Journey } from '../../../../__generated__/JourneyFields'
import { MenuItem } from '../../MenuItem'

interface Props {
  journey: Journey
  isPublisher?: boolean
  isVisible?: boolean
}

export function EditMenuItem({
  journey,
  isPublisher,
  isVisible
}: Props): ReactElement {
  let editLink
  if (journey != null) {
    if (journey.template === true && isPublisher === true) {
      editLink = `/publisher/${journey.id}/edit`
    } else {
      editLink = `/journeys/${journey.id}/edit`
    }
  }

  return (
    <>
      {isVisible === true && (
        <>
          <Divider />
          <NextLink href={editLink != null ? editLink : ''} passHref>
            <MenuItem label="Edit Cards" icon={<ViewCarouselIcon />} />
          </NextLink>
        </>
      )}
    </>
  )
}
