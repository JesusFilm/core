import { ArrowRight, Loader2 } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../../libs/cn/cn'
import type { ConversationStrategy } from '../../libs/storage'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

export type ConversationStrategySelectorProps = {
  strategies: ConversationStrategy[]
  selectedStrategyId: string | null
  onSelectStrategy: (strategyId: string) => void
  onGenerateConversation: () => void
  isGenerating: boolean
  canGenerate: boolean
  hasConversationMap: boolean
}

const splitApproachToStages = (approach?: string | null): string[] => {
  if (!approach) {
    return []
  }

  const trimmed = approach.trim()
  if (!trimmed) {
    return []
  }

  const trySplit = (pattern: RegExp): string[] =>
    trimmed
      .split(pattern)
      .map((part) => part.trim())
      .filter((part) => part.length > 0)

  const newlineSegments = trySplit(/\s*\n+\s*/)
  if (newlineSegments.length > 1) {
    return newlineSegments
  }

  const arrowSegments = trySplit(/\s*(?:→|➡️|➝|➜|➔|⇒|->|—>|–>)\s*/)
  if (arrowSegments.length > 1) {
    return arrowSegments
  }

  const bulletSegments = trySplit(/\s*(?:•|\u2022|[-–—])\s*/u)
  if (bulletSegments.length > 1) {
    return bulletSegments
  }

  const semicolonSegments = trySplit(/\s*;\s*/)
  if (semicolonSegments.length > 1) {
    return semicolonSegments
  }

  const numberedSegments = trimmed
    .split(/\s*\d+\.\s*/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
  if (numberedSegments.length > 1) {
    return numberedSegments
  }

  const sentenceSegments = (trimmed.match(/[^.!?]+[.!?]*|[^.!?]+$/g) || [])
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

  if (sentenceSegments.length > 1) {
    return sentenceSegments
  }

  return [trimmed]
}

type StrategyCardProps = {
  strategy: ConversationStrategy
  isSelected: boolean
  onSelectStrategy: (strategyId: string) => void
  className?: string
}

const StrategyCard = ({
  strategy,
  isSelected,
  onSelectStrategy,
  className
}: StrategyCardProps) => {
  const flowSteps = Array.isArray(strategy.flow?.steps)
    ? strategy.flow?.steps ?? []
    : []
  const timelineStages = flowSteps
    .map((step) => (step?.title ?? '').trim())
    .filter((label): label is string => label.length > 0)
  const stageSequence =
    timelineStages.length > 0
      ? timelineStages
      : splitApproachToStages(strategy.approach)
  const hasFlowDetails = flowSteps.length > 0
  const fallbackStageList = !hasFlowDetails ? stageSequence : []
  const fallbackFlowMarkdown =
    strategy.flow?.rawMarkdown && strategy.flow.rawMarkdown.trim().length > 0
      ? strategy.flow.rawMarkdown.trim()
      : null

  return (
    <Card
      className={cn(
        'border transition-shadow',
        isSelected
          ? 'border-primary/80 shadow-sm shadow-primary/10'
          : 'border-border hover:border-primary/40',
        className
      )}
    >
      <div className="space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-semibold text-foreground">{strategy.label}</h4>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {strategy.id}
              </span>
            </div>
            {strategy.summary && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {strategy.summary}
              </p>
            )}
            {stageSequence.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground/80">
                {stageSequence.map((label, index) => (
                  <div key={`${strategy.id}-stage-${index}`} className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground/80">
                      {label}
                    </span>
                    {index < stageSequence.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelectStrategy(strategy.id)}
            className="shrink-0"
            disabled={isSelected}
          >
            {isSelected ? 'Grace plan selected' : 'Use Grace plan'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">Conversation flow</h5>
            {hasFlowDetails ? (
              <ol className="space-y-3">
                {flowSteps.map((step, stepIndex) => {
                  if (!step) {
                    return null
                  }

                  const title = step.title?.trim() || `Movement ${stepIndex + 1}`
                  const message = step.message?.trim() ?? null
                  const scriptures = Array.isArray(step.scriptures)
                    ? step.scriptures.filter(
                        (scripture) => Boolean(scripture?.reference || scripture?.text)
                      )
                    : []

                  return (
                    <li
                      key={step?.id ?? `${strategy.id}-flow-${stepIndex}`}
                      className="space-y-2 rounded-xl border border-border/80 p-3"
                    >
                      <div className="text-sm font-semibold text-foreground">{title}</div>
                      {message && (
                        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{message}</p>
                      )}
                      {scriptures.length > 0 && (
                        <ul className="space-y-1">
                          {scriptures.map((scripture, scriptureIndex) => {
                            const reference = scripture?.reference?.trim() ?? null
                            const text = scripture?.text?.trim() ?? null

                            return (
                              <li
                                key={`${step?.id ?? `${strategy.id}-flow-${stepIndex}`}-scripture-${scriptureIndex}`}
                                className="rounded-md bg-muted/70 p-2"
                              >
                                {reference && (
                                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                                    {reference}
                                  </div>
                                )}
                                {text && (
                                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ol>
            ) : fallbackStageList.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {fallbackStageList.map((label, stageIndex) => (
                  <li key={`${strategy.id}-fallback-${stageIndex}`}>{label}</li>
                ))}
              </ul>
            ) : fallbackFlowMarkdown ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/60 p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {fallbackFlowMarkdown}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No conversation flow provided.</p>
            )}
          </div>

          {strategy.scriptureThemes && (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scripture themes
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {strategy.scriptureThemes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export const ConversationStrategySelector = ({
  strategies,
  selectedStrategyId,
  onSelectStrategy,
  onGenerateConversation,
  isGenerating,
  canGenerate,
  hasConversationMap
}: ConversationStrategySelectorProps) => {
  const activeStrategy = useMemo(
    () =>
      selectedStrategyId
        ? strategies.find((strategy) => strategy.id === selectedStrategyId) ?? null
        : null,
    [strategies, selectedStrategyId]
  )

  if (strategies.length === 0) {
    return null
  }

  return (
    <div className="space-y-6" aria-label="Conversation strategy selector">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Grace conversation strategy</h3>
        <p className="text-sm text-muted-foreground">
          Review the Grace plan for this prompt. When you&apos;re ready, generate the conversation map from this
          strategy.
        </p>
      </div>

      <div className="grid gap-4">
        {strategies.map((strategy) => (
          <StrategyCard
            key={`strategy-${strategy.id}`}
            strategy={strategy}
            isSelected={strategy.id === selectedStrategyId}
            onSelectStrategy={onSelectStrategy}
            className="h-full"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {activeStrategy ? (
            <>
              Preparing the{' '}
              <span className="font-medium text-foreground">{activeStrategy.label}</span>{' '}
              plan.
            </>
          ) : (
            'Select the Grace plan to review its flow and build the conversation map.'
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
