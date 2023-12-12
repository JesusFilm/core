import { gql, useQuery } from '@apollo/client'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../../../../../__generated__/GetJourney'

import { ApiTokenTextField } from './ApiTokenTextField'
import { FormSlugSelect } from './FormSlugSelect'
import { ProjectIdSelect } from './ProjectIdSelect'

export const GET_FORM_BLOCK = gql`
  query GetFormBlock($id: ID!) {
    block(id: $id) {
      id
      ... on FormBlock {
        id
        projects {
          id
          name
        }
        projectId
        formSlug
        forms {
          slug
          name
        }
      }
    }
  }
`

export function Credentials(): ReactElement {
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as TreeBlock<FormBlock> | undefined
  const { data, loading } = useQuery(GET_FORM_BLOCK, {
    variables: { id: selectedBlock?.id }
  })
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack spacing={6} sx={{ px: 6, py: 4 }}>
      <ApiTokenTextField id={selectedBlock?.id} />
      <ProjectIdSelect
        id={selectedBlock?.id}
        currentProjectId={data?.block?.projectId}
        projects={data?.block?.projects}
        loading={loading}
      />
      <FormSlugSelect
        id={selectedBlock?.id}
        currentFormSlug={data?.block?.formSlug}
        forms={data?.block?.forms}
        loading={loading}
      />

      <Stack
        direction="row"
        alignItems="center"
        spacing={3}
        sx={{ pt: 8 }}
        color="text.secondary"
      >
        <InformationCircleContainedIcon />
        <NextLink
          href="https://formium.io/docs/react/frameworks/next-js#add-your-credentials"
          passHref
          legacyBehavior
        >
          <Link underline="none" variant="body2" target="_blank" rel="noopener">
            {t('Click here for formium docs on finding your credentials')}
          </Link>
        </NextLink>
      </Stack>
    </Stack>
  )
}
