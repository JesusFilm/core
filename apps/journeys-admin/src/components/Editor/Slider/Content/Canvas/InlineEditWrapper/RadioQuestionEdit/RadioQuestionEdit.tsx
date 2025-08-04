import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { WrappersProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { StyledRadioOption } from '@core/journeys/ui/RadioOption'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'
import { getPollOptionBorderStyles } from '@core/journeys/ui/RadioQuestion/utils/getPollOptionBorderStyles'
import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { BlockFields_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  RadioOptionBlockCreate,
  RadioOptionBlockCreateVariables
} from '../../../../../../../../__generated__/RadioOptionBlockCreate'
import { RadioQuestionFields } from '../../../../../../../../__generated__/RadioQuestionFields'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

export const RADIO_OPTION_BLOCK_CREATE = gql`
  ${BLOCK_FIELDS}
  mutation RadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
    radioOptionBlockCreate(input: $input) {
      id
      label
      ...BlockFields
    }
  }
`

interface RadioQuestionEditProps extends TreeBlock<RadioQuestionFields> {
  wrappers?: WrappersProps
}

export function RadioQuestionEdit({
  id,
  wrappers,
  ...props
}: RadioQuestionEditProps): ReactElement {
  const [radioOptionBlockCreate] = useMutation<
    RadioOptionBlockCreate,
    RadioOptionBlockCreateVariables
  >(RADIO_OPTION_BLOCK_CREATE)
  const { journey } = useJourney()
  const { addBlock } = useBlockCreateCommand()
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  function handleCreateOption(): void {
    if (journey == null) return

    const radioOptionBlock: RadioOptionBlock = {
      id: uuidv4(),
      label: '',
      parentBlockId: id,
      parentOrder: selectedBlock?.children?.length ?? 0,
      action: null,
      pollOptionImageBlockId: null,
      __typename: 'RadioOptionBlock'
    }

    addBlock({
      block: radioOptionBlock,
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlockId: radioOptionBlock.id
        })
        void radioOptionBlockCreate({
          variables: {
            input: {
              id: radioOptionBlock.id,
              journeyId: journey.id,
              parentBlockId: radioOptionBlock.parentBlockId ?? id,
              label: radioOptionBlock.label
            }
          },
          optimisticResponse: {
            radioOptionBlockCreate: radioOptionBlock
          },
          update(cache, { data }) {
            if (data?.radioOptionBlockCreate != null) {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs = []) {
                    const newBlockRef = cache.writeFragment({
                      data: data.radioOptionBlockCreate,
                      fragment: gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
                    })
                    return [...existingBlockRefs, newBlockRef]
                  }
                }
              })
            }
          }
        })
      }
    })
  }

  const { t } = useTranslation('apps-journeys-admin')

  const addRadioOption = (
    // Box mimics wrappers on RadioOptions so all ButtonGroup children have same type for class styling
    <Box>
      <StyledRadioOption
        data-testid={`${id}-add-option`}
        variant="contained"
        fullWidth
        disableRipple
        startIcon={
          <AddSquare4Icon sx={{ color: `${adminPrimaryColor.main}` }} />
        }
        onClick={handleCreateOption}
        sx={(theme) => ({
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          ...getPollOptionBorderStyles(theme, { important: true })
        })}
      >
        <Typography variant="body1">{t('Add Option')}</Typography>
      </StyledRadioOption>
    </Box>
  )

  return (
    <RadioQuestion
      {...props}
      id={id}
      addOption={props.children.length < 12 ? addRadioOption : undefined}
      wrappers={wrappers}
    />
  )
}
