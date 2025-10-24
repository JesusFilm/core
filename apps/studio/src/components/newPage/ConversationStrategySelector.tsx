import { ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { cn } from '../../libs/cn/cn'
import type { ConversationStrategy } from '../../libs/storage'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

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
  const stages = Array.isArray(strategy.stages) ? strategy.stages : []
  const timelineStages = stages
    .map((stage) => (stage?.label ?? '').trim())
    .filter((label): label is string => label.length > 0)
  const stageSequence =
    timelineStages.length > 0
      ? timelineStages
      : splitApproachToStages(strategy.approach)

  const stageDetails = stages.filter((stage) => Boolean(stage?.label || stage?.summary))
  const hasStageDetails = stageDetails.length > 0
  const fallbackStageList = !hasStageDetails ? stageSequence : []

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
              <p className="text-sm leading-relaxed text-muted-foreground">
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
            {isSelected ? 'Strategy selected' : 'Use this strategy'}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">Stage milestones</h5>
            {hasStageDetails ? (
              <ol className="space-y-3">
                {stageDetails.map((stage, stageIndex) => {
                  const label = stage?.label?.trim() || `Stage ${stageIndex + 1}`
                  const summary = stage?.summary ?? null

                  return (
                    <li
                      key={stage?.id ?? `${strategy.id}-detail-${stageIndex}`}
                      className="rounded-xl border border-border/80 p-3"
                    >
                      <div className="text-sm font-semibold text-foreground">{label}</div>
                      {summary && (
                        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
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
            ) : (
              <p className="text-sm text-muted-foreground">No stage breakdown provided.</p>
            )}
          </div>

          {strategy.scriptureThemes && (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scripture themes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
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
  const [activeTab, setActiveTab] = useState<string>(
    selectedStrategyId ?? strategies[0]?.id ?? ''
  )

  useEffect(() => {
    if (strategies.length === 0) {
      setActiveTab('')
      return
    }

    const availableIds = new Set(strategies.map((strategy) => strategy.id))
    const fallbackId = strategies[0]?.id ?? ''

    if (selectedStrategyId && availableIds.has(selectedStrategyId) && selectedStrategyId !== activeTab) {
      setActiveTab(selectedStrategyId)
      return
    }

    if (!activeTab || !availableIds.has(activeTab)) {
      setActiveTab(selectedStrategyId ?? fallbackId)
    }
  }, [strategies, selectedStrategyId, activeTab])

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

  const tabValue = activeTab || strategies[0]?.id || ''

  return (
    <div className="space-y-6" aria-label="Conversation strategy selector">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Choose a conversation path</h3>
        <p className="text-sm text-muted-foreground">
          Pick a strategy to review its stage plan and Scripture emphasis. When you&apos;re ready,
          generate the conversation map based on that path.
        </p>
      </div>

      <div className="space-y-4">
        <div className="md:hidden">
          <Tabs value={tabValue} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2">
              {strategies.map((strategy) => (
                <TabsTrigger key={strategy.id} value={strategy.id} className="flex-1 text-xs sm:text-sm">
                  {strategy.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {strategies.map((strategy) => (
              <TabsContent
                key={`mobile-${strategy.id}`}
                value={strategy.id}
                className="mt-4 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <StrategyCard
                  strategy={strategy}
                  isSelected={strategy.id === selectedStrategyId}
                  onSelectStrategy={onSelectStrategy}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="hidden gap-4 md:grid md:grid-cols-3">
          {strategies.map((strategy) => (
            <StrategyCard
              key={`desktop-${strategy.id}`}
              strategy={strategy}
              isSelected={strategy.id === selectedStrategyId}
              onSelectStrategy={onSelectStrategy}
              className="h-full"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {activeStrategy ? (
            <>
              Preparing the{' '}
              <span className="font-medium text-foreground">{activeStrategy.label}</span>{' '}
              path.
            </>
          ) : (
            'Select a strategy to review its plan and build the conversation map.'
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
