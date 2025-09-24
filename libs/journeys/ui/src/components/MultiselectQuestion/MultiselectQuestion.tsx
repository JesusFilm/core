import { gql, useMutation } from '@apollo/client'
import Box, { BoxProps } from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { sendGTMEvent } from '@next/third-parties/google'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { getStepHeading } from '../../libs/getStepHeading'
import { useJourney } from '../../libs/JourneyProvider'
// eslint-disable-next-line import/no-cycle
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { MultiselectOption } from '../MultiselectOption/MultiselectOption'

import { getPollOptionBorderStyles } from './utils/getPollOptionBorderStyles'
import { StyledListMultiSelectOption } from '../MultiselectOption'

export const MULTISELECT_SUBMISSION_EVENT_CREATE = gql`
  mutation MultiselectSubmissionEventCreate(
    $input: MultiselectSubmissionEventCreateInput!
  ) {
    multiselectSubmissionEventCreate(input: $input) {
      id
    }
  }
`

const StyledListMultiselectQuestion = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiButtonGroup-root': {
    boxShadow: 'none',
    gap: theme.spacing(2),
    '& .MuiButtonGroup-grouped': {
      border: 'none',
      borderBottom: 'none',
      borderRight: 'none',
      borderRadius: '12px',
      margin: '0 !important',
      '&:not(:last-of-type)': {
        borderBottom: 'none'
      },
      '& .MuiButtonGroup-firstButton': {
        ...getPollOptionBorderStyles(theme)
      },
      '& .MuiButtonGroup-middleButton': {
        ...getPollOptionBorderStyles(theme)
      },
      '& .MuiButtonGroup-lastButton': {
        ...getPollOptionBorderStyles(theme)
      }
    }
  }
}))

interface MultiselectQuestionProps extends TreeBlock<any> {
  uuid?: () => string
  wrappers?: WrappersProps
  addOption?: () => void
}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

export function MultiselectQuestion({
  id: blockId,
  children,
  label,
  submitLabel,
  min,
  max,
  action,
  uuid = uuidv4,
  wrappers,
  addOption
}: MultiselectQuestionProps): ReactElement {
  const [multiselectSubmissionEventCreate] = useMutation<any, any>(
    MULTISELECT_SUBMISSION_EVENT_CREATE
  )
  const { variant, journey } = useJourney()
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { blockHistory, treeBlocks } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')
  const activeBlock = blockHistory[blockHistory.length - 1]

  useEffect(() => {
    if (!isActiveBlockOrDescendant(blockId)) setSelectedIds([])
  }, [blockId, blockHistory])

  const heading =
    activeBlock != null
      ? getStepHeading(activeBlock.id, activeBlock.children, treeBlocks, t)
      : 'None'

  function toggleSelect(optionId: string): void {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(optionId)
      if (isSelected) return prev.filter((id) => id !== optionId)
      const limit = typeof max === 'number' ? max : undefined
      if (limit != null && prev.length >= limit) return prev
      return [...prev, optionId]
    })
  }

  const selectedLabels = useMemo(() => {
    return (
      children
        ?.filter((c: any) => c.__typename === 'MultiselectOptionBlock')
        .filter((c: any) => selectedIds.includes(c.id))
        .map((c: any) => c.label) ?? []
    )
  }, [children, selectedIds])

  async function handleSubmit(): Promise<void> {
    if (
      (variant !== 'default' && variant !== 'embed') ||
      selectedIds.length === 0
    )
      return
    const id = uuid()
    await multiselectSubmissionEventCreate({
      variables: {
        input: {
          id,
          blockId,
          stepId: activeBlock?.id,
          label: heading,
          values: selectedLabels
        }
      }
    })
    sendGTMEvent({
      event: 'multiselect_submission',
      eventId: id,
      blockId,
      stepName: heading
    })
    // trigger action after submit
    const nextStepSlug = getNextStepSlug(journey, action)
    handleAction(router, action, nextStepSlug)
  }

  const options = children?.map((option: any) => {
    if (option.__typename !== 'MultiselectOptionBlock') return false
    const isSelected = selectedIds.includes(option.id)
    const atMax = typeof max === 'number' && selectedIds.length >= max
    const disabled = atMax && !isSelected
    return wrappers != null ? (
      <BlockRenderer block={option} wrappers={wrappers} key={option.id} />
    ) : (
      <MultiselectOption
        {...option}
        key={option.id}
        selected={isSelected}
        disabled={disabled}
        onClick={() => toggleSelect(option.id)}
      />
    )
  })

  return (
    <>
      <StyledListMultiselectQuestion
        data-testid={`JourneysMultiselectQuestionList-${blockId}`}
      >
        <ButtonGroup orientation="vertical" variant="contained" fullWidth>
          {options}
          {addOption && (
            <Box>
              <StyledListMultiSelectOption
                data-testid={`${blockId}-add-option`}
                variant="contained"
                fullWidth
                disableRipple
                startIcon={
                  <AddSquare4Icon sx={{ color: `${adminPrimaryColor.main}` }} />
                }
                onClick={addOption}
                sx={(theme) => ({
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  ...getPollOptionBorderStyles(theme, { important: true })
                })}
              >
                <Typography variant="body1">{t('Add Option')}</Typography>
              </StyledListMultiSelectOption>
            </Box>
          )}
        </ButtonGroup>
      </StyledListMultiselectQuestion>
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          disabled={
            selectedIds.length === 0 ||
            (typeof min === 'number' && selectedIds.length < min)
          }
          onClick={handleSubmit}
        >
          {submitLabel ?? t('Submit')}
        </Button>
      </Box>
    </>
  )
}
