import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../../libs/cn/cn'
import type { ConversationStrategy } from '../../libs/storage'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'

export type ConversationStrategySelectorProps = {
  strategies: ConversationStrategy[]
  selectedStrategyId: string | null
  selectedVerseIdsByStrategy: Record<string, string[]>
  onSelectStrategy: (strategyId: string) => void
  onToggleVerse: (strategyId: string, verseId: string) => void
  onSelectAllVerses: (strategyId: string) => void
  onClearVerses: (strategyId: string) => void
  onGenerateConversation: () => void
  isGenerating: boolean
  canGenerate: boolean
  selectedVersesCount: number
  hasConversationMap: boolean
}

export const ConversationStrategySelector = ({
  strategies,
  selectedStrategyId,
  selectedVerseIdsByStrategy,
  onSelectStrategy,
  onToggleVerse,
  onSelectAllVerses,
  onClearVerses,
  onGenerateConversation,
  isGenerating,
  canGenerate,
  selectedVersesCount,
  hasConversationMap
}: ConversationStrategySelectorProps) => {
  const activeStrategy = useMemo(
    () =>
      selectedStrategyId
        ? strategies.find((strategy) => strategy.id === selectedStrategyId) ?? null
        : null,
    [strategies, selectedStrategyId]
  )

  return (
    <div className="space-y-6" aria-label="Conversation strategy selector">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          Choose a conversation path
        </h3>
        <p className="text-sm text-muted-foreground">
          Pick a strategy and select the verses you want to emphasize. Once you confirm,
          Studio will map the conversation using that tone and Scripture set.
        </p>
      </div>

      <div className="grid gap-4">
        {strategies.map((strategy) => {
          const isSelected = strategy.id === selectedStrategyId
          const verseSelections = new Set(selectedVerseIdsByStrategy[strategy.id] ?? [])
          const verseCount = strategy.verses.length

          return (
            <Card
              key={strategy.id}
              className={cn(
                'border transition-shadow',
                isSelected
                  ? 'border-primary/80 shadow-sm shadow-primary/10'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-foreground">
                        {strategy.label}
                      </h4>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {strategy.id}
                      </span>
                    </div>
                    {strategy.summary && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {strategy.summary}
                      </p>
                    )}
                    {strategy.approach && (
                      <p className="text-sm text-muted-foreground/90 leading-relaxed">
                        <span className="font-medium text-foreground/80">Approach:</span>{' '}
                        {strategy.approach}
                      </p>
                    )}
                    {strategy.tone && (
                      <p className="text-sm text-muted-foreground/90">
                        <span className="font-medium text-foreground/80">Tone:</span>{' '}
                        {strategy.tone}
                      </p>
                    )}
                    {strategy.scriptureThemes && (
                      <p className="text-sm text-muted-foreground/90">
                        <span className="font-medium text-foreground/80">Scripture themes:</span>{' '}
                        {strategy.scriptureThemes}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelectStrategy(strategy.id)}
                    className="shrink-0"
                    disabled={isSelected}
                  >
                    {isSelected ? 'Strategy selected' : 'Use this strategy'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h5 className="text-sm font-medium text-foreground">
                      Recommended Scriptures ({verseCount})
                    </h5>
                    {isSelected ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => onSelectAllVerses(strategy.id)}
                        >
                          Select all
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2.5 text-xs"
                          onClick={() => onClearVerses(strategy.id)}
                          disabled={verseSelections.size === 0}
                        >
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Select this strategy to choose verses
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {strategy.verses.map((verse) => {
                      const isVerseSelected = verseSelections.has(verse.id)

                      return (
                        <label
                          key={verse.id}
                          className={cn(
                            'flex items-start gap-3 rounded-2xl border p-3 transition-colors',
                            isSelected
                              ? isVerseSelected
                                ? 'border-primary/70 bg-primary/5'
                                : 'border-border hover:border-primary/40'
                              : 'border-dashed border-border opacity-80'
                          )}
                        >
                          <Checkbox
                            checked={isVerseSelected}
                            disabled={!isSelected}
                            onCheckedChange={() => onToggleVerse(strategy.id, verse.id)}
                            className="mt-1"
                          />
                          <div className="space-y-1 text-sm text-foreground">
                            <div className="font-medium text-foreground/90">
                              {verse.reference || 'Scripture'}
                            </div>
                            {verse.text && (
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {verse.text}
                              </p>
                            )}
                            {verse.reason && (
                              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                                {verse.reason}
                              </p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {activeStrategy ? (
            <>
              Preparing the <span className="font-medium text-foreground">{activeStrategy.label}</span>{' '}
              path with{' '}
              <span className="font-medium text-foreground">{selectedVersesCount}</span>{' '}
              verse{selectedVersesCount === 1 ? '' : 's'} selected.
            </>
          ) : (
            'Select a strategy to review verses and build the conversation path.'
          )}
        </p>
        <Button
          size="sm"
          className="sm:w-auto"
          onClick={onGenerateConversation}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Building conversation…
            </>
          ) : hasConversationMap ? (
            'Regenerate conversation map'
          ) : (
            'Generate conversation map'
          )}
        </Button>
      </div>
    </div>
  )
}
