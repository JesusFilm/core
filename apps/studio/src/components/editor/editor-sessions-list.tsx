import { History } from 'lucide-react'
import type { FC } from 'react'

import type { UserInputData } from '../../libs/storage'
import { Button } from '../ui/button'

import type { TokenSummary } from './editor-header'

interface EditorSessionsListProps {
  isOpen: boolean
  sessions: UserInputData[]
  onLoad: (session: UserInputData) => void
  onDelete: (sessionId: string) => void
  summarizeTokens: (tokens?: { input: number; output: number }) => TokenSummary | null
}

export const EditorSessionsList: FC<EditorSessionsListProps> = ({
  isOpen,
  sessions,
  onLoad,
  onDelete,
  summarizeTokens
}) => {
  if (!isOpen || sessions.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto mb-8 transition-all duration-500 ease-in-out">
      <div className="border border-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Previous Sessions
          </span>
        </div>
        <div className="space-y-3">
          {sessions.map((session) => {
            const sessionTokenSummary = summarizeTokens(session.tokensUsed)

            return (
              <div key={session.id} className="p-3 border-muted">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {session.textContent.substring(0, 60)}...
                      </h4>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{new Date(session.timestamp).toLocaleString()}</p>
                      <p>
                        {session.images.length} images •{' '}
                        {session.aiResponse ? (
                          <>
                            Has AI response
                            {sessionTokenSummary && (
                              <>
                                {' '}
                                • Tokens: {sessionTokenSummary.formattedTotal}
                                {' '}
                                • ${sessionTokenSummary.estimatedCost}
                              </>
                            )}
                          </>
                        ) : (
                          'No AI response'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLoad(session)}
                      className="h-7 px-2 text-xs"
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(session.id)}
                      className="h-7 px-2 text-xs text-primary hover:text-primary"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
