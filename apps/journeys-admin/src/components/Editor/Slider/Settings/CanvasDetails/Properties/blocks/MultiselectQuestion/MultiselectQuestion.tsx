import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { MULTISELECT_QUESTION_FIELDS } from '@core/journeys/ui/MultiselectQuestion/multiselectQuestionFields'

import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../../../../../../__generated__/BlockFields'

export const MULTISELECT_BLOCK_UPDATE = gql`
  ${MULTISELECT_QUESTION_FIELDS}
  mutation MultiselectBlockUpdate(
    $id: ID!
    $input: MultiselectBlockUpdateInput!
  ) {
    multiselectBlockUpdate(id: $id, input: $input) {
      ...MultiselectQuestionFields
    }
  }
`

export function MultiselectQuestion({
  id,
  min,
  max,
  children
}: TreeBlock<MultiselectBlock>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [updateBlock] = useMutation(MULTISELECT_BLOCK_UPDATE)

  const optionCount = (children ?? []).filter(
    (c) => c.__typename === 'MultiselectOptionBlock'
  ).length

  const [localMin, setLocalMin] = useState<number | ''>(min ?? 0)
  const [localMax, setLocalMax] = useState<number | ''>(
    max ?? (optionCount > 0 ? optionCount : 0)
  )

  useEffect(() => {
    setLocalMin(min ?? 0)
    setLocalMax(max ?? (optionCount > 0 ? optionCount : 0))
  }, [min, max, optionCount])

  const commitUpdate = useCallback(
    (next: { min?: number | null; max?: number | null }) => {
      add({
        parameters: {
          execute: next,
          undo: { min, max }
        },
        execute(variables) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlock,
            selectedStep,
            selectedAttributeId: `${id}-multiselect-settings`
          })
          // Build input with only the fields explicitly provided.
          // This avoids unintentionally resetting unrelated fields to null.
          const input: {
            min?: number | null
            max?: number | null
          } = {}
          if ('min' in variables) input.min = variables.min ?? null
          if ('max' in variables) input.max = variables.max ?? null
          void updateBlock({
            variables: {
              id,
              input
            },
            optimisticResponse: {
              multiselectBlockUpdate: {
                __typename: 'MultiselectBlock',
                id,
                parentBlockId: selectedBlock?.parentBlockId ?? null,
                parentOrder: selectedBlock?.parentOrder ?? 0,
                min: variables.min ?? min ?? null,
                max: variables.max ?? max ?? null
              }
            }
          })
        }
      })
    },
    [add, dispatch, id, min, max, selectedBlock, selectedStep, updateBlock]
  )

  function handleMinChange(value: string): void {
    const parsed = value === '' ? '' : Number(value)
    if (parsed === '' || Number.isNaN(parsed)) {
      setLocalMin('')
      return
    }
    let nextMin = parsed as number
    if (typeof localMax === 'number' && nextMin > localMax) {
      nextMin = localMax
    }
    setLocalMin(nextMin)
    commitUpdate({ min: nextMin })
  }

  function handleMaxChange(value: string): void {
    const parsed = value === '' ? '' : Number(value)
    if (parsed === '' || Number.isNaN(parsed)) {
      setLocalMax('')
      return
    }
    let nextMax = parsed as number
    if (typeof localMin === 'number' && nextMax < localMin) {
      nextMax = localMin
    }
    setLocalMax(nextMax)
    commitUpdate({ max: nextMax })
  }

  const handleBlurCommit = useCallback(() => {
    const nextMinRaw = localMin === '' ? null : (localMin as number)
    const nextMaxRaw = localMax === '' ? null : (localMax as number)

    const bothNumbers =
      nextMinRaw !== null &&
      nextMinRaw !== undefined &&
      nextMaxRaw !== null &&
      nextMaxRaw !== undefined

    const normalizedMin = bothNumbers
      ? Math.min(nextMinRaw as number, nextMaxRaw as number)
      : nextMinRaw
    const normalizedMax = bothNumbers
      ? Math.max(nextMinRaw as number, nextMaxRaw as number)
      : nextMaxRaw

    if (normalizedMin === min && normalizedMax === max) return

    // keep local state in a consistent, non-overlapping configuration
    setLocalMin(normalizedMin ?? '')
    setLocalMax(normalizedMax ?? '')

    commitUpdate({ min: normalizedMin, max: normalizedMax })
  }, [commitUpdate, localMin, localMax, min, max])

  const handleRangeChange = useCallback(
    (_event: Event, newValue: number | number[]): void => {
      if (!Array.isArray(newValue)) return
      const [newMin, newMax] = newValue
      setLocalMin(newMin)
      setLocalMax(newMax)
    },
    []
  )

  const handleRangeCommit = useCallback(
    (_event: Event, newValue: number | number[]): void => {
      if (!Array.isArray(newValue)) return
      const [newMin, newMax] = newValue
      if (newMin === min && newMax === max) return
      commitUpdate({ min: newMin, max: newMax })
    },
    [commitUpdate, min, max]
  )

  return (
    <Box data-testid="MultiselectQuestionProperties">
      <Box sx={{ p: 4 }}>
        <Typography>
          {t('To edit multiselect content, choose each option individually')}
        </Typography>
      </Box>

      <Box sx={{ p: 4, display: 'grid', gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2 }}>
          <Typography variant="subtitle2">{t('Selection Limit')}</Typography>
          <Tooltip
            title={t('Maximum number of selections allowed.')}
            placement="top"
          >
            <Box
              component="span"
              tabIndex={0}
              aria-label={t('Maximum number of selections allowed.')}
              sx={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <InfoOutlined fontSize="small" color="action" />
            </Box>
          </Tooltip>
        </Box>
        <Box sx={{ px: 2 }}>
          <Slider
            value={(() => {
              const optionMax = optionCount > 0 ? optionCount : 0
              const minValue = typeof localMin === 'number' ? localMin : 0
              const maxValue =
                typeof localMax === 'number' ? localMax : optionMax
              const clampedMin = Math.max(0, Math.min(minValue, optionMax))
              const clampedMax = Math.max(0, Math.min(maxValue, optionMax))
              const orderedMin = Math.min(clampedMin, clampedMax)
              const orderedMax = Math.max(clampedMin, clampedMax)
              return [orderedMin, orderedMax]
            })()}
            min={0}
            max={optionCount > 0 ? optionCount : 0}
            disabled={(optionCount ?? 0) === 0}
            onChange={handleRangeChange}
            onChangeCommitted={handleRangeCommit}
            valueLabelDisplay="auto"
            getAriaLabel={(index) =>
              index === 0 ? t('Min selections') : t('Max selections')
            }
            getAriaValueText={(value) => `${value}`}
            aria-label={t('Selections range')}
          />
        </Box>
        <Box
          sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              type="number"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              onBlur={handleBlurCommit}
              slotProps={{
                input: {
                  inputProps: {
                    '-moz-appearance': 'textfield',
                    min: 0,
                    max:
                      typeof localMax === 'number'
                        ? localMax
                        : optionCount > 0
                          ? optionCount
                          : 0,
                    'aria-label': t('Min selections')
                  }
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" align="center">
              {t('Min')}
            </Typography>
          </Box>
          <Box />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <TextField
              type="number"
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              onBlur={handleBlurCommit}
              slotProps={{
                input: {
                  inputProps: {
                    '-moz-appearance': 'textfield',
                    min: typeof localMin === 'number' ? localMin : 0,
                    max: optionCount > 0 ? optionCount : 0,
                    'aria-label': t('Max selections')
                  }
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" align="center">
              {t('Max')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
