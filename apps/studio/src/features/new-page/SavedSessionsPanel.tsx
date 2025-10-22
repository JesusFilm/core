import { History, Loader2, Trash2 } from 'lucide-react'
import { Fragment } from 'react'

import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import type { UserInputData } from '../../libs/storage'

type SavedSessionsPanelProps = {
  isOpen: boolean
  isCollapsing: boolean
  savedSessions: UserInputData[]
  loadingSession: string | null
  onLoadSession: (session: UserInputData) => void
  onDeleteSession: (sessionId: string) => void
}

export const SavedSessionsPanel = ({
  isOpen,
  isCollapsing,
  savedSessions,
  loadingSession,
  onLoadSession,
  onDeleteSession
}: SavedSessionsPanelProps) => {
  if (!isOpen || savedSessions.length === 0) {
    return null
  }

  return (
    <div
      className={`max-w-4xl mx-auto mb-8 transition-all duration-500 ease-in-out ${
        isCollapsing ? 'opacity-0 scale-95 transform' : 'opacity-100 scale-100'
      }`}
    >
      <div className="border border-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Previous Sessions
          </span>
        </div>
        <div className="space-y-3">
          {savedSessions.map((session, index) => {
            const timestamp = new Date(session.timestamp)
            const hasImages = session.images.length > 0
            const tokens = session.tokensUsed
            const inputTokens = tokens?.input ?? 0
            const outputTokens = tokens?.output ?? 0
            const hasTokens = inputTokens > 0 || outputTokens > 0
            const totalTokens = hasTokens ? inputTokens + outputTokens : 0
            const formattedTotal = (() => {
              if (!hasTokens) return ''
              if (totalTokens >= 1_000_000) return `${(totalTokens / 1_000_000).toFixed(1)}M`
              if (totalTokens >= 1_000) return `${(totalTokens / 1_000).toFixed(1)}K`
              return totalTokens.toLocaleString()
            })()

            const estimatedCost = hasTokens
              ? (inputTokens / 1_000_000) * 0.05 + (outputTokens / 1_000_000) * 0.4
              : 0

            return (
              <Fragment key={session.id}>
                <Card
                  className={`group p-3 relative border-muted bg-transparent shadow-none hover:bg-white hover:shadow-md hover:-my-3 hover:py-7 hover:z-10 transition-padding duration-200 ease-out cursor-pointer ${
                    loadingSession === session.id ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => loadingSession !== session.id && onLoadSession(session)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 text-center min-w-0">
                      <div className="text-sm font-semibold text-muted-foreground leading-tight">
                        {timestamp.getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        {timestamp.toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {session.textContent.substring(0, 60)}...
                        </h4>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>
                          {hasImages
                            ? `${session.images.length} images • `
                            : `${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • `}
                          {hasTokens
                            ? `Tokens: ${formattedTotal} • $${
                                estimatedCost >= 0.01
                                  ? estimatedCost.toFixed(2)
                                  : '0.00'
                              }`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {loadingSession === session.id ? (
                        <div className="flex items-center gap-2 px-2 py-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDeleteSession(session.id)
                          }}
                          className="invisible group-hover:visible h-7 px-2 text-xs text-primary hover:!bg-primary hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
                {index < savedSessions.length - 1 && (
                  <hr className="border-stone-600/10 my-2 mx-4 z-1 relative" />
                )}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
