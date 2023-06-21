import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Container from '@mui/material/Container'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { GetPublishedTemplates_journeys as Template } from '../../../__generated__/GetPublishedTemplates'
import { TemplateCard } from '../TemplateCard'
import { ContactSupport } from '../ContactSupport'

interface TemplateLibraryProps {
  isPublisher?: boolean
  journeys?: Journey[]
  templates?: Template[]
}

export function TemplateLibrary({
  templates
}: TemplateLibraryProps): ReactElement {
  return (
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
  )
}
