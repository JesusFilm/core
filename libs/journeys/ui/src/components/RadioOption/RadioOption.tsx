import { useRouter } from 'next/router'
import { MouseEvent, ReactElement } from 'react'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { useJourney } from '../../libs/JourneyProvider'
import { useGetValueFromJourneyCustomizationString } from '../../libs/useGetValueFromJourneyCustomizationString'

import { RadioOptionFields } from './__generated__/RadioOptionFields'
import { GridVariant } from './GridVariant/GridVariant'
import { ListVariant } from './ListVariant/ListVariant'

export interface RadioOptionProps extends TreeBlock<RadioOptionFields> {
  selected?: boolean
  disabled?: boolean
  onClick?: (selectedId: string, selectedLabel: string) => void
  editableLabel?: ReactElement
  gridView?: boolean | null
}

export function RadioOption({
  label,
  action,
  id,
  disabled = false,
  selected = false,
  onClick,
  editableLabel,
  gridView = false,
  pollOptionImageBlockId,
  children
}: RadioOptionProps): ReactElement {
  const { journey } = useJourney()
  const router = useRouter()

  const resolvedLabel = useGetValueFromJourneyCustomizationString(label)

  const handleClick = (e: MouseEvent): void => {
    e.stopPropagation()
    onClick?.(id, resolvedLabel)
    const nextStepSlug = getNextStepSlug(journey, action)
    handleAction(router, action, nextStepSlug)
  }

  return gridView === true ? (
    <GridVariant
      label={resolvedLabel}
      disabled={disabled}
      selected={selected}
      handleClick={handleClick}
      editableLabel={editableLabel}
      pollOptionImageBlockId={pollOptionImageBlockId}
      children={children}
    />
  ) : (
    <ListVariant
      label={resolvedLabel}
      disabled={disabled}
      selected={selected}
      handleClick={handleClick}
      editableLabel={editableLabel}
    />
  )
}
