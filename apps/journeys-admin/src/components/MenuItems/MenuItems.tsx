import { gql, useQuery } from '@apollo/client'
import { ReactElement } from 'react'

import { GetRole } from '../../../__generated__/GetRole'
import { Role, UserJourneyRole } from '../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'

import { CopyMenuItem } from './CopyMenuItem'
import { CreateTemplateMenuItem } from './CreateTemplateMenuItem'
import { DescriptionMenuItem } from './DescriptionMenuItem'
import { EditMenuItem } from './EditMenuItem'
import { LanguageMenuItem } from './LanguageMenuItem'
import { PreviewMenuItem } from './PreviewMenuItem'
import { PublishMenuItem } from './PublishMenuItem'
import { ReportMenuItem } from './ReportMenuItem'
import { TemplateMenuItem } from './TemplateMenuItem'
import { TitleDescriptionMenuItem } from './TitleDescriptionMenuItem'
import { TitleMenuItem } from './TitleMenuItem'

export const GET_ROLE = gql`
  query GetRole {
    getUserRole {
      id
      userId
      roles
    }
  }
`

interface MenuItemsProps {
  journey: Journey
  onClose: () => void
}

export function MenuItems({
  journey,
  onClose: handleCloseMenu
}: MenuItemsProps): ReactElement {
  const { data } = useQuery<GetRole>(GET_ROLE)

  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)
  const isOwner =
    journey?.userJourneys?.find(
      (userJourney) => userJourney.user?.id === data?.getUserRole?.userId
    )?.role === UserJourneyRole.owner

  return (
    <>
      <PreviewMenuItem journey={journey} onClose={handleCloseMenu} />
      <PublishMenuItem
        journey={journey}
        isOwner={isOwner}
        isVisible={journey.template !== true || isPublisher}
      />
      <TemplateMenuItem
        journey={journey}
        isVisible={journey.template === true}
      />
      <TitleDescriptionMenuItem
        isVisible={journey.template === true && isPublisher}
      />
      <TitleMenuItem isVisible={journey.template !== true} />
      <DescriptionMenuItem isVisible={journey.template !== true} />
      <LanguageMenuItem isVisible={journey.template !== true || isPublisher} />
      <ReportMenuItem journey={journey} />
      <CreateTemplateMenuItem
        isVisible={journey.template !== true && isPublisher === true}
      />
      <EditMenuItem
        journey={journey}
        isPublisher={isPublisher}
        isVisible={journey.template !== true || isPublisher}
      />
      <CopyMenuItem journey={journey} isVisible={journey.template !== true} />
    </>
  )
}
