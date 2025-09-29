'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Eye, Scissors, Zap } from 'lucide-react'
import type { PathQAMetrics, VirtualCameraPath } from '@core/shared/video-processing'

interface QAMetricsPanelProps {
  /** Current path being analyzed */
  path?: VirtualCameraPath
  /** QA metrics to display */
  metrics?: PathQAMetrics
  /** Whether QA analysis is running */
  isAnalyzing?: boolean
  /** Callback to run QA analysis */
  onRunAnalysis?: () => void
  /** Whether panel is collapsed */
  collapsed?: boolean
  /** Callback when collapse state changes */
  onToggleCollapsed?: () => void
}

export function QAMetricsPanel({
  path,
  metrics,
  isAnalyzing = false,
  onRunAnalysis,
  collapsed = false,
  onToggleCollapsed
}: QAMetricsPanelProps) {
  const scoreColor = useMemo(() => {
    if (!metrics) return 'text-muted-foreground'
    const score = metrics.overallScore
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }, [metrics])

  const scoreIcon = useMemo(() => {
    if (!metrics) return <TrendingUp className="h-4 w-4" />
    const score = metrics.overallScore
    if (score >= 90) return <CheckCircle className="h-4 w-4" />
    if (score >= 70) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }, [metrics])

  const criticalCount = metrics?.criticalIssues.length || 0
  const warningCount = metrics?.warnings.length || 0

  if (collapsed) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              QA Metrics
              {metrics && (
                <Badge variant={metrics.overallScore >= 80 ? 'default' : 'destructive'}>
                  {metrics.overallScore.toFixed(0)}%
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapsed}
              className="h-6 w-6 p-0"
            >
              ▶
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4" />
            QA Metrics
            {metrics && (
              <Badge variant={metrics.overallScore >= 80 ? 'default' : 'destructive'}>
                {metrics.overallScore.toFixed(0)}%
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRunAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRunAnalysis}
                disabled={isAnalyzing || !path}
                className="h-7 px-2"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run QA'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapsed}
              className="h-6 w-6 p-0"
            >
              ▼
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metrics ? (
          <div className="text-center py-4">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Run QA analysis to check video quality metrics
            </p>
          </div>
        ) : (
          <>
            {/* Overall Score */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                {scoreIcon}
                <span className="font-medium">Overall Quality</span>
              </div>
              <span className={`font-bold text-lg ${scoreColor}`}>
                {metrics.overallScore.toFixed(1)}%
              </span>
            </div>

            {/* Issues Summary */}
            {(criticalCount > 0 || warningCount > 0) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Issues Found</h4>
                <div className="grid grid-cols-2 gap-2">
                  {criticalCount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">
                        {criticalCount} Critical
                      </span>
                    </div>
                  )}
                  {warningCount > 0 && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        {warningCount} Warnings
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Face Coverage */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Face Coverage
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Full Face Visible:</span>
                  <span className={metrics.faceCoverage.fullFaceVisible >= 0.9 ? 'text-green-600' : 'text-red-600'}>
                    {(metrics.faceCoverage.fullFaceVisible * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Face Area:</span>
                  <span>{(metrics.faceCoverage.avgFaceAreaRatio * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Forehead Cutoffs:</span>
                  <span className={metrics.faceCoverage.foreheadCutoffs > 0 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.faceCoverage.foreheadCutoffs}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Chin Cutoffs:</span>
                  <span className={metrics.faceCoverage.chinCutoffs > 0 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.faceCoverage.chinCutoffs}
                  </span>
                </div>
              </div>
            </div>

            {/* Motion Stability */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Motion Stability
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Pan Velocity:</span>
                  <span>{metrics.motionStability.avgPanVelocity.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Velocity:</span>
                  <span className={metrics.motionStability.maxPanVelocity > 0.15 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.motionStability.maxPanVelocity.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Jitter Score:</span>
                  <span className={metrics.motionStability.jitterScore > 0.1 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.motionStability.jitterScore.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Velocity Spikes:</span>
                  <span className={metrics.motionStability.excessiveVelocityFrames > 0 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.motionStability.excessiveVelocityFrames}
                  </span>
                </div>
              </div>
            </div>

            {/* Scene Transitions */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Scene Transitions
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Pans Across Cuts:</span>
                  <span className={metrics.sceneTransitions.pansAcrossCuts > 0 ? 'text-red-600' : 'text-green-600'}>
                    {metrics.sceneTransitions.pansAcrossCuts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hard Cuts:</span>
                  <span className={metrics.sceneTransitions.hardCuts > 0 ? 'text-yellow-600' : 'text-green-600'}>
                    {metrics.sceneTransitions.hardCuts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Un-eased Face Swaps:</span>
                  <span className={metrics.sceneTransitions.unEasedFaceSwaps > 0 ? 'text-yellow-600' : 'text-green-600'}>
                    {metrics.sceneTransitions.unEasedFaceSwaps}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            {metrics.criticalIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Critical Issues</h4>
                <ul className="space-y-1">
                  {metrics.criticalIssues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                      <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {metrics.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-600">Warnings</h4>
                <ul className="space-y-1">
                  {metrics.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
