import { TreeBlock } from "../../../libs/transformer/transformer"
import { ReactElement } from "react"
import { GetJourney_journey_blocks_TriggerBlock as TriggerBlock } from "../../../../__generated__/GetJourney"

export function Trigger({ children }: TreeBlock<TriggerBlock>): ReactElement {
    return (
      <>
        {children != null ? children?.map((block) => {
                if (block.__typename === 'TriggerBlock')
                    return console.log('triggerBlock works')
                return console.log('trigger block doesn\'t work')
            }) : null}
      </>
    )
}