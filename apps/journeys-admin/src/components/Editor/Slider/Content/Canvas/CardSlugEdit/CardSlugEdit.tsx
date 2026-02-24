import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { enqueueSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { StepBlockSlugUpdate } from '../../../../../../../__generated__/StepBlockSlugUpdate'
import { TextFieldForm } from '../../../../../TextFieldForm'

export const STEP_BLOCK_SLUG_UPDATE = gql`
  mutation StepBlockSlugUpdate($id: ID!, $input: StepBlockUpdateInput!) {
    stepBlockUpdate(id: $id, input: $input) {
      id
      slug
    }
  }
`

interface CardSlugEditProps {
  visible?: boolean
}

export function CardSlugEdit({
  visible = true
}: CardSlugEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep }
  } = useEditor()
  const { add } = useCommand()
  const [stepBlockUpdate] = useMutation<StepBlockSlugUpdate>(
    STEP_BLOCK_SLUG_UPDATE
  )
  const slug = selectedStep?.slug

  function handleUpdate(value?: string): void {
    if (selectedStep == null || value == null) return
    const newSlug = value === '' ? null : value

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
              slug
            }
          },
          onError: (e) => {
            console.error(e)
            enqueueSnackbar(
              t(
                'This link name is already in use. Please choose a different one.'
              ),
              {
                variant: 'error',
                preventDuplicate: true
              }
            )
          }
        })
      }
    })
  }

  return (
    <Fade in={visible} appear timeout={{ enter: 500, exit: 250 }}>
      <Box
        sx={{
          width: '100%',
          pointerEvents: visible ? 'auto' : 'none'
        }}
        aria-hidden={!visible}
      >
        <TextFieldForm
          id={`card-slug-edit-${selectedStep?.id}`}
          placeholder={t('your-card-link')}
          initialValue={slug ?? undefined}
          onSubmit={async (value) => handleUpdate(value)}
          variant="outlined"
          size="small"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'default',
              '&.Mui-focused': {
                bgcolor: 'common.white'
              }
            }
          }}
          slotProps={{
            htmlInput: {
              'aria-label': 'card-slug-edit'
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Typography fontSize={26}>/</Typography>
                </InputAdornment>
              )
            }
          }}
        />
      </Box>
    </Fade>
  )
}
