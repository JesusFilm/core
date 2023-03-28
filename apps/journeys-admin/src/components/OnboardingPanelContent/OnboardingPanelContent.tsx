import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Link from '@mui/material/Link'
import NextLink from 'next/link'
import Stack from '@mui/material/Stack'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import Button from '@mui/material/Button'
import DashboardRounded from '@mui/icons-material/DashboardRounded'
import { useRouter } from 'next/router'
import { SidePanelContainer } from '../NewPageWrapper/SidePanelContainer'
import { MediaListItem } from '../MediaListItem'
import { GetOnboardingTemplate } from '../../../__generated__/GetOnboardingTemplate'

export const GET_ONBOARDING_TEMPLATE = gql`
  query GetOnboardingTemplate($id: ID!) {
    template: adminJourney(id: $id, idType: databaseId) {
      id
      title
      description
      primaryImageBlock {
        src
      }
    }
  }
`

export function OnboardingPanelContent(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { data: template1, loading: loading1 } =
    useQuery<GetOnboardingTemplate>(GET_ONBOARDING_TEMPLATE, {
      variables: { id: '014c7add-288b-4f84-ac85-ccefef7a07d3' }
    })
  const { data: template2, loading: loading2 } =
    useQuery<GetOnboardingTemplate>(GET_ONBOARDING_TEMPLATE, {
      variables: { id: 'c4889bb1-49ac-41c9-8fdb-0297afb32cd9' }
    })
  const { data: template3, loading: loading3 } =
    useQuery<GetOnboardingTemplate>(GET_ONBOARDING_TEMPLATE, {
      variables: { id: 'e978adb4-e4d8-42ef-89a9-79811f10b7e9' }
    })
  const { data: template4, loading: loading4 } =
    useQuery<GetOnboardingTemplate>(GET_ONBOARDING_TEMPLATE, {
      variables: { id: '178c01bd-371c-4e73-a9b8-e2bb95215fd8' }
    })
  const { data: template5, loading: loading5 } =
    useQuery<GetOnboardingTemplate>(GET_ONBOARDING_TEMPLATE, {
      variables: { id: '13317d05-a805-4b3c-b362-9018971d9b57' }
    })

  const templates = [template1, template2, template3, template4, template5]
  const loading = [loading1, loading2, loading3, loading4, loading5]

  const handleClick = (journeyId?: string): void => {
    if (journeyId != null) void router.push(`/templates/${journeyId}`)
  }

  const handleTemplatesRedirect = (): void => {
    void router.push('/templates')
  }

  return (
    <>
      <SidePanelContainer>Create Empty Icon Button Here</SidePanelContainer>
      <SidePanelContainer border={false}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">Use Template</Typography>
          <NextLink href="/templates" passHref>
            <Link
              underline="none"
              variant="subtitle2"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {t('See all')}
              <ChevronRightRounded />
            </Link>
          </NextLink>
        </Stack>
      </SidePanelContainer>
      {templates.map((template, index) => {
        return (
          template?.template != null && (
            <MediaListItem
              key={template.template.id}
              loading={loading[index]}
              title={template.template.title}
              description={template.template.description ?? ''}
              image={template.template.primaryImageBlock?.src ?? ''}
              overline={t('Template')}
              border
              onClick={() => handleClick(template?.template?.id)}
            />
          )
        )
      })}
      <SidePanelContainer border={false}>
        <Button
          variant="outlined"
          startIcon={<DashboardRounded />}
          sx={{ width: 'max-content', alignSelf: 'center' }}
          onClick={handleTemplatesRedirect}
        >
          {t('See all templates')}
        </Button>
      </SidePanelContainer>
    </>
  )
}
