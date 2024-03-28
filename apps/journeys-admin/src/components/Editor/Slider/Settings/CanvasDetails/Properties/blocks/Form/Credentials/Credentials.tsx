import { gql, useQuery } from '@apollo/client'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { BlockFields_FormBlock as FormBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  GetFormBlock,
  GetFormBlockVariables
} from '../../../../../../../../../../__generated__/GetFormBlock'

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
        apiTokenExists
      }
    }
  }
`

export function Credentials(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as TreeBlock<FormBlock> | undefined
  const { data, loading } = useQuery<GetFormBlock, GetFormBlockVariables>(
    GET_FORM_BLOCK,
    {
      variables: { id: selectedBlock?.id ?? '' }
    }
  )

  return data?.block.__typename === 'FormBlock' ? (
    <Stack spacing={6} sx={{ p: 4, pt: 0 }} data-testid="Credentials">
      <ApiTokenTextField
        id={selectedBlock?.id}
        apiTokenExists={data.block.apiTokenExists}
        loading={loading}
      />
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
        color="text.secondary"
      >
        <InformationCircleContainedIcon />
        <NextLink
          href="https://formium.io/docs/react/frameworks/next-js#add-your-credentials"
          passHref
          legacyBehavior
        >
          <Link underline="none" variant="body2" target="_blank" rel="noopener">
            {t('Click here for formium docs on finding your api token')}
          </Link>
        </NextLink>
      </Stack>
    </Stack>
  ) : (
    <></>
  )
}
