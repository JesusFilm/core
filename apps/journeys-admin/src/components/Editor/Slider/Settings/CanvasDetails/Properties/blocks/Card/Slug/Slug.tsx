import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StepBlockSlugUpdate } from '../../../../../../../../../../__generated__/StepBlockSlugUpdate'
import { useCustomDomainsQuery } from '../../../../../../../../../libs/useCustomDomainsQuery'
import { TextFieldForm } from '../../../../../../../../TextFieldForm'

export const STEP_BLOCK_SLUG_UPDATE = gql`
  mutation StepBlockSlugUpdate($id: ID!, $input: StepBlockUpdateInput!) {
    stepBlockUpdate(id: $id, input: $input) {
      id
      slug
    }
  }
`

export function Slug(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const {
    state: { selectedStep }
  } = useEditor()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })

  const [stepBlockUpdate] = useMutation<StepBlockSlugUpdate>(
    STEP_BLOCK_SLUG_UPDATE
  )

  const slug = selectedStep?.slug ?? selectedStep?.id

  function handleUpdate(value?: string): void {
    if (selectedStep == null) return
    const newSlug = value == null || value === '' ? selectedStep.id : value

    add({
      parameters: {
        execute: {
          slug: newSlug
        },
        undo: {
          slug
        }
      },
      execute({ slug }) {
        void stepBlockUpdate({
          variables: {
            id: selectedStep.id,
            input: {
              slug
            }
          },
          optimisticResponse: {
            stepBlockUpdate: {
              __typename: 'StepBlock',
              id: selectedStep.id,
              slug: newSlug
            }
          },

          onError: (_) => {
            enqueueSnackbar(t('Error updating, make sure slug is unique'), {
              variant: 'error',
              preventDuplicate: true
            })
          }
        })
      }
    })
  }

  async function handleCopyClick(): Promise<void> {
    if (slug == null || journey == null) return
    const cardUrl = `${
      hostname != null
        ? `https://${hostname}`
        : process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'https://your.nextstep.is'
    }/${journey.slug}/${slug}`

    await navigator.clipboard.writeText(cardUrl)
    enqueueSnackbar(`${t('Copied to clipboard:')} ${cardUrl}`, {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Stack spacing={4} sx={{ px: 4 }}>
      <TextFieldForm
        id="StepSlugEdit"
        label={t('Card URL edit')}
        initialValue={slug}
        onSubmit={async (value) => handleUpdate(value)}
      />
      <Button variant="contained" onClick={handleCopyClick}>
        {t('Copy Card URL')}
      </Button>
    </Stack>
  )
}
