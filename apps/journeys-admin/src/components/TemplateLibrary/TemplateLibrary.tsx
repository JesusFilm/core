import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Container from '@mui/material/Container'
import TagManager from 'react-gtm-module'
import { useMutation, gql } from '@apollo/client'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { GetPublishedTemplates_journeys as Template } from '../../../__generated__/GetPublishedTemplates'
import { TemplateCard } from '../TemplateCard'
import { ContactSupport } from '../ContactSupport'
import { TemplateLibraryViewEventCreate } from '../../../__generated__/TemplateLibraryViewEventCreate'

export const TEMPLATE_LIBRARY_VIEW_EVENT_CREATE = gql`
  mutation TemplateLibraryViewEventCreate {
    templateLibraryViewEventCreate {
      id
    }
  }
`
interface TemplateLibraryProps {
  isPublisher?: boolean
  journeys?: Journey[]
  templates?: Template[]
}

export function TemplateLibrary({
  isPublisher = false,
  journeys,
  templates
}: TemplateLibraryProps): ReactElement {
  const [templateLibraryViewEventCreate] =
    useMutation<TemplateLibraryViewEventCreate>(
      TEMPLATE_LIBRARY_VIEW_EVENT_CREATE
    )

  const { t } = useTranslation('apps-journeys-admin')

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

  // journey == null is journey loading
  const showLibrary = journeys == null || journeys?.length > 0 || isPublisher

  return (
    <>
      {showLibrary ? (
        <Container
          sx={{
            pt: 6,
            px: { xs: 0, sm: 8 }
          }}
        >
          {templates != null ? (
            <>
              {templates.map((template) => (
                <TemplateCard key={template.id} journey={template} />
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
      ) : (
        <ContactSupport
          title={t('You need to be invited to use your first template')}
          description={t(
            'Someone with a full account should add you to their journey as an editor, after that you will have full access'
          )}
        />
      )}
    </>
  )
}
