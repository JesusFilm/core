import { gql } from '@apollo/client'
import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
// eslint-disable-next-line import/no-cycle
import { BlockRenderer, WrappersProps } from '../BlockRenderer'
import { MultiselectOption } from '../MultiselectOption/MultiselectOption'

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
    gap: 0,
    '& .MuiButtonGroup-grouped': {
      border: 'none',
      borderBottom: 'none',
      borderRight: 'none',
      borderRadius: 0,
      margin: '0 !important',
      '&:not(:last-of-type)': {
        borderBottom: 'none'
      },
      '&.MuiButtonGroup-grouped': {
        borderColor:
          theme.palette.mode === 'dark'
            ? 'rgba(150, 150, 150, 0.2)'
            : 'rgba(225, 225, 225, 0.3)'
      },
      '&.MuiButtonGroup-firstButton': {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
      },
      '&.MuiButtonGroup-middleButton': {
        borderRadius: 0
      },
      '&.MuiButtonGroup-lastButton': {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16
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
  min,
  max,
  wrappers,
  addOption
}: MultiselectQuestionProps): ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { blockHistory } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')
  const formik = useFormikContext<{ [key: string]: string[] }>()

  const idToLabel = useMemo(() => {
    const map = new Map<string, string>()
    children?.forEach((option: any) => {
      if (option.__typename === 'MultiselectOptionBlock') {
        map.set(option.id, option.label as string)
      }
    })
    return map
  }, [children])

  useEffect(() => {
    if (!isActiveBlockOrDescendant(blockId)) setSelectedIds([])
  }, [blockId, blockHistory])

  function toggleSelect(optionId: string): void {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(optionId)
      const next = isSelected
        ? prev.filter((id) => id !== optionId)
        : (() => {
            const limit = typeof max === 'number' ? max : undefined
            if (limit != null && prev.length >= limit) return prev
            return [...prev, optionId]
          })()
      // sync with Card Formik using labels (not ids) so submissions send labels
      const nextLabels = next.map((id) => idToLabel.get(id) ?? id)
      formik?.setFieldValue(blockId, nextLabels)
      return next
    })
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
                borderWidth: '1px !important',
                borderStyle: 'solid !important'
              })}
            >
              <Typography variant="body1">{t('Add Option')}</Typography>
            </StyledListMultiSelectOption>
          )}
        </ButtonGroup>
      </StyledListMultiselectQuestion>
    </>
  )
}
