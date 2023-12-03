import { gql, useMutation } from '@apollo/client'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { FormBlockUpdateCredentials } from '../../../../../../../../__generated__/FormBlockUpdateCredentials'
import { GetJourney_journey_blocks_FormBlock as FormBlock } from '../../../../../../../../__generated__/GetJourney'
import { TextFieldForm } from '../../../../../../TextFieldForm'

export const FORM_BLOCK_UPDATE = gql`
  mutation FormBlockUpdateCredentials(
    $id: ID!
    $journeyId: ID!
    $input: FormBlockUpdateInput!
  ) {
    formBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      form
    }
  }
`

export function Credentials(): ReactElement {
  const [formBlockUpdateCredentials] =
    useMutation<FormBlockUpdateCredentials>(FORM_BLOCK_UPDATE)

  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as TreeBlock<FormBlock> | undefined
  const initalProjectId = selectedBlock?.form.projectId ?? ''
  const initalFormSlug = selectedBlock?.form.slug ?? ''

  async function handleSubmitProjectId(projectId: string): Promise<void> {
    if (selectedBlock == null || projectId === initalProjectId) return
    await formBlockUpdateCredentials({
      variables: {
        id: selectedBlock.id,
        journeyId: journey?.id,
        input: {
          projectId
        }
      },
      update(cache, { data }) {
        if (data?.formBlockUpdate != null) {
          cache.modify({
            id: cache.identify({
              __typename: 'FormBlock',
              id: selectedBlock.id
            }),
            fields: {
              action: () => data.formBlockUpdate
            }
          })
        }
      }
    })
  }

  async function handleSubmitApiToken(apiToken: string): Promise<void> {
    if (selectedBlock == null) return
    await formBlockUpdateCredentials({
      variables: {
        id: selectedBlock.id,
        journeyId: journey?.id,
        input: {
          apiToken
        }
      },
      update(cache, { data }) {
        if (data?.formBlockUpdate != null) {
          cache.modify({
            id: cache.identify({
              __typename: 'FormBlock',
              id: selectedBlock.id
            }),
            fields: {
              action: () => data.formBlockUpdate
            }
          })
        }
      }
    })
  }

  async function handleSubmitFormSlug(formSlug: string): Promise<void> {
    if (selectedBlock == null || formSlug === initalFormSlug) return
    await formBlockUpdateCredentials({
      variables: {
        id: selectedBlock.id,
        journeyId: journey?.id,
        input: {
          formSlug
        }
      },
      update(cache, { data }) {
        if (data?.formBlockUpdate != null) {
          cache.modify({
            id: cache.identify({
              __typename: 'FormBlock',
              id: selectedBlock.id
            }),
            fields: {
              action: () => data.formBlockUpdate
            }
          })
        }
      }
    })
  }

  return (
    <Stack spacing={6} sx={{ px: 6, py: 4 }}>
      <TextFieldForm
        id="projectId"
        label="Project Id"
        initialValue={initalProjectId}
        onSubmit={handleSubmitProjectId}
      />
      <TextFieldForm
        id="apiToken"
        label="Api Token"
        type="password"
        initialValue=""
        placeholder="Tokens are displayed only once"
        onSubmit={handleSubmitApiToken}
      />
      <TextFieldForm
        id="formSlug"
        label="Form Slug"
        initialValue={initalFormSlug}
        onSubmit={handleSubmitFormSlug}
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
            Click here for formium docs on finding your credentials
          </Link>
        </NextLink>
      </Stack>
    </Stack>
  )
}
