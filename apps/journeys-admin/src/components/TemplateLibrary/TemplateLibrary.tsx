import { ReactElement, useEffect } from 'react'
import Container from '@mui/material/Container'
import TagManager from 'react-gtm-module'
import { useMutation, gql } from '@apollo/client'
import { GetPublishedTemplates_journeys as Journey } from '../../../__generated__/GetPublishedTemplates'
import { TemplateLibraryViewEventCreate } from '../../../__generated__/TemplateLibraryViewEventCreate'
import { TemplateCard } from '../TemplateCard'

export const TEMPLATE_LIBRARY_VIEW_EVENT_CREATE = gql`
  mutation TemplateLibraryViewEventCreate {
    templateLibraryViewEventCreate {
      id
    }
  }
`

interface TemplateLibraryProps {
  journeys?: Journey[]
}

export function TemplateLibrary({
  journeys
}: TemplateLibraryProps): ReactElement {
  const [templateLibraryViewEventCreate] =
    useMutation<TemplateLibraryViewEventCreate>(
      TEMPLATE_LIBRARY_VIEW_EVENT_CREATE
    )

  useEffect(() => {
    async function handleEventCreation(): Promise<void> {
      const { data } = await templateLibraryViewEventCreate()
      if (data?.templateLibraryViewEventCreate != null) {
        TagManager.dataLayer({
          dataLayer: {
            event: 'template_library_view',
            eventId: data.templateLibraryViewEventCreate.id
          }
        })
      }
    }
    void handleEventCreation()
  }, [templateLibraryViewEventCreate])

  return (
    <Container
      sx={{
        pt: 6,
        px: { xs: 0, sm: 8 }
      }}
    >
      {journeys != null ? (
        <>
          {journeys.map((journey) => (
            <TemplateCard key={journey.id} journey={journey} />
          ))}
        </>
      ) : (
        <>
          {[1, 2, 3].map((index) => (
            <TemplateCard key={`templateCard${index}`} />
          ))}
        </>
      )}
    </Container>
  )
}
