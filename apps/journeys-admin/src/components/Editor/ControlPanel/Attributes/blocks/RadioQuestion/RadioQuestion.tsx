import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import ArrowDropDownCircleRoundedIcon from '@mui/icons-material/ArrowDropDownCircleRounded'
import { GetJourneyForEdit_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import { Attribute } from '../..'

export function RadioQuestion({
  id,
  label,
  description
}: TreeBlock<RadioQuestionBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-radio-question-label`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Label"
        value={label}
        description="Radio Question Label"
      />

      <Attribute
        id={`${id}-radio-question-description`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Description"
        value={description ?? 'None'}
        description="Radio Question Description"
      />
    </>
  )
}
