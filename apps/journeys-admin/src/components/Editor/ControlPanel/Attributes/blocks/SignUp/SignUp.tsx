import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import ArrowDropDownCircleRoundedIcon from '@mui/icons-material/ArrowDropDownCircleRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Attribute } from '../..'
import { GetJourneyForEdit_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourneyForEdit'

export function SignUp({
  id,
  submitLabel,
  action,
  submitIcon
}: TreeBlock<SignUpBlock>): ReactElement {
  return (
    <>
      <Attribute
        id={`${id}-submit-label`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Submit Label"
        value={submitLabel ?? 'None'}
        description="Submit Label"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-submit-action`}
        icon={<ArrowDropDownCircleRoundedIcon />}
        name="Submit Action"
        value={action?.__typename.toString() ?? 'None'}
        description="Submit Action"
        // onClick to open drawer
      />

      <Attribute
        id={`${id}-submit-icon`}
        icon={<InfoOutlinedIcon />}
        name="Submit Icon"
        value={submitIcon?.name.toString() ?? 'None'}
        description="Submit Icon"
        // onClick to open drawer
      />
    </>
  )
}
