import { gql, useMutation } from '@apollo/client'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { MULTISELECT_QUESTION_FIELDS } from '@core/journeys/ui/MultiselectQuestion/multiselectQuestionFields'

import { BlockFields_MultiselectBlock as MultiselectBlock } from '../../../../../../../../../__generated__/BlockFields'

export const MULTISELECT_BLOCK_UPDATE = gql`
  ${MULTISELECT_QUESTION_FIELDS}
  mutation MultiselectBlockUpdate_SettingsPanel(
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
  const [limitEnabled, setLimitEnabled] = useState<boolean>(
    min != null || max != null
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
    const optionMax = optionCount > 0 ? optionCount : 0
    const clampedLocalMax =
      typeof localMax === 'number'
        ? Math.max(0, Math.min(optionMax, localMax))
        : optionMax
    let nextMin = parsed
    if (nextMin > clampedLocalMax) {
      nextMin = clampedLocalMax
    }
    const clampedMin = Math.max(0, Math.min(optionMax, nextMin))
    setLocalMin(clampedMin)
    if (!limitEnabled) setLimitEnabled(true)
    commitUpdate({ min: clampedMin })
  }

  function handleMaxChange(value: string): void {
    const parsed = value === '' ? '' : Number(value)
    if (parsed === '' || Number.isNaN(parsed)) {
      setLocalMax('')
      return
    }
    const optionMax = optionCount > 0 ? optionCount : 0
    const lowerBound = optionCount > 0 ? 1 : 0
    const clampedLocalMin =
      typeof localMin === 'number'
        ? Math.max(0, Math.min(optionMax, localMin))
        : 0
    let nextMax = parsed
    if (nextMax < clampedLocalMin) {
      nextMax = clampedLocalMin
    }
    const clampedMax = Math.max(lowerBound, Math.min(optionMax, nextMax))
    setLocalMax(clampedMax)
    if (!limitEnabled) setLimitEnabled(true)
    commitUpdate({ max: clampedMax })
  }

  const handleBlurCommit = useCallback(() => {
    const nextMinRaw = localMin === '' ? null : localMin
    const nextMaxRaw = localMax === '' ? null : localMax

    const bothNumbers =
      nextMinRaw !== null &&
      nextMinRaw !== undefined &&
      nextMaxRaw !== null &&
      nextMaxRaw !== undefined

    let normalizedMin = bothNumbers
      ? Math.min(nextMinRaw, nextMaxRaw)
      : nextMinRaw
    let normalizedMax = bothNumbers
      ? Math.max(nextMinRaw, nextMaxRaw)
      : nextMaxRaw

    // Enforce max lower bound of 1 when there are options
    const optionMax = optionCount > 0 ? optionCount : 0
    const lowerBound = optionCount > 0 ? 1 : 0
    if (normalizedMax != null) {
      normalizedMax = Math.max(lowerBound, Math.min(optionMax, normalizedMax))
    }
    if (normalizedMin != null) {
      normalizedMin = Math.max(0, Math.min(optionMax, normalizedMin))
    }
    if (
      normalizedMin != null &&
      normalizedMax != null &&
      normalizedMin > normalizedMax
    ) {
      normalizedMin = normalizedMax
    }

    if (normalizedMin === min && normalizedMax === max) return

    // keep local state in a consistent, non-overlapping configuration
    setLocalMin(normalizedMin ?? '')
    setLocalMax(normalizedMax ?? '')

    commitUpdate({ min: normalizedMin, max: normalizedMax })
  }, [commitUpdate, localMin, localMax, min, max, optionCount])

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
      let [newMin, newMax] = newValue
      const optionMax = optionCount > 0 ? optionCount : 0
      const lowerBound = optionCount > 0 ? 1 : 0
      newMax = Math.max(lowerBound, Math.min(optionMax, newMax))
      if (newMin > newMax) newMin = newMax
      if (newMin === min && newMax === max) return
      commitUpdate({ min: newMin, max: newMax })
    },
    [commitUpdate, min, max, optionCount]
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
          <Switch
            color="primary"
            checked={limitEnabled}
            onChange={(_e, checked) => {
              setLimitEnabled(checked)
              if (!checked) {
                // When disabled, hide controls and clear limits
                setLocalMin('')
                setLocalMax('')
                commitUpdate({ min: null, max: null })
              } else {
                // When enabled, set sensible defaults if missing
                const optionMax = optionCount > 0 ? optionCount : 0
                const defaultMin = typeof localMin === 'number' ? localMin : 0
                let defaultMax =
                  typeof localMax === 'number' ? localMax : optionMax
                const lowerBound = optionCount > 0 ? 1 : 0
                defaultMax = Math.max(
                  lowerBound,
                  Math.min(optionMax, defaultMax)
                )
                const normalizedMin = Math.min(defaultMin, defaultMax)
                setLocalMin(defaultMin)
                setLocalMax(defaultMax)
                commitUpdate({ min: normalizedMin, max: defaultMax })
              }
            }}
            inputProps={{ 'aria-label': t('Selection Limit') }}
            sx={{ ml: 'auto' }}
          />
        </Box>
        {limitEnabled && (
          <Box sx={{ px: 2 }}>
            <Slider
              value={(() => {
                const optionMax = optionCount > 0 ? optionCount : 0
                const minValue = typeof localMin === 'number' ? localMin : 0
                const maxValue =
                  typeof localMax === 'number' ? localMax : optionMax
                const lowerBound = optionCount > 0 ? 1 : 0
                const clampedMin = Math.max(0, Math.min(minValue, optionMax))
                const clampedMax = Math.max(
                  lowerBound,
                  Math.min(maxValue, optionMax)
                )
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
        )}
        {limitEnabled && (
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
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
              >
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
                      min: Math.max(
                        typeof localMin === 'number' ? localMin : 0,
                        optionCount > 0 ? 1 : 0
                      ),
                      max: optionCount > 0 ? optionCount : 0,
                      'aria-label': t('Max selections')
                    }
                  }
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
              >
                {t('Max')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
