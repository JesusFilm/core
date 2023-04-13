import { GetVisitors_visitors_edges as Visitor } from '../../../../../__generated__/GetVisitors'

interface GridRowDef {
  id: string
  lastStepViewedAt: string | null
  lastChatPlatform: string | null
  lastLinkAction: string | null
  lastTextResponse: string
  lastRadioQuestion: string
}

export function getVisitorRows(visitors: Visitor[]): GridRowDef[] {
  const rows: GridRowDef[] = []

  visitors.forEach((visitor) => {
    const {
      id,
      lastStepViewedAt,
      lastChatPlatform,
      lastLinkAction,
      lastTextResponse,
      lastRadioQuestion,
      lastRadioOptionSubmission
    } = visitor.node

    if (lastStepViewedAt != null) {
      rows.push({
        id,
        lastStepViewedAt:
          lastStepViewedAt != null
            ? new Intl.DateTimeFormat([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              }).format(new Date(lastStepViewedAt))
            : null,
        lastChatPlatform,
        lastLinkAction,
        lastTextResponse: lastTextResponse ?? '',
        lastRadioQuestion:
          lastRadioQuestion != null && lastRadioOptionSubmission != null
            ? `${lastRadioQuestion}: ${lastRadioOptionSubmission}`
            : ''
      })
    }
  })

  return rows
}
