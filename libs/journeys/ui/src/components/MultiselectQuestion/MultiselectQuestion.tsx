import { gql } from '@apollo/client'
import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useFormikContext } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import AddSquare4Icon from '@core/shared/ui/icons/AddSquare4'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import type { TreeBlock } from '../../libs/block'
import { isActiveBlockOrDescendant, useBlocks } from '../../libs/block'
import { getStepHeading } from '../../libs/getStepHeading'
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
  min,
  max,
  wrappers,
  addOption
}: MultiselectQuestionProps): ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { blockHistory } = useBlocks()
  const { t } = useTranslation('libs-journeys-ui')
  const formik = useFormikContext<{ [key: string]: string[] }>()

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
      // sync with Card Formik so submit button acts like TextResponse
      formik?.setFieldValue(blockId, next)
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
    </>
  )
}
