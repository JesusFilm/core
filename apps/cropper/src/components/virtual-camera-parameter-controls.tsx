'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Slider } from './ui/slider'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { RotateCcw, Settings } from 'lucide-react'
import type { VirtualCameraParameters } from '@core/shared/video-processing'

interface VirtualCameraParameterControlsProps {
  /** Current parameters */
  parameters: VirtualCameraParameters
  /** Callback when parameters change */
  onParametersChange: (parameters: VirtualCameraParameters) => void
  /** Whether controls are disabled */
  disabled?: boolean
  /** Whether to show reset button */
  showReset?: boolean
}

const DEFAULT_PARAMS: VirtualCameraParameters = {
  faceHeightTarget: 0.35,
  deadZoneWidth: 0.12,
  deadZoneHeight: 0.10,
  verticalCenterBias: 0.04,
  smoothing: {
    centerBeta: 0.15,
    zoomBeta: 0.25
  },
  stabilization: {
    maxPanVelocity: 0.12,
    maxAcceleration: 0.05
  },
  lookAheadFrames: 12,
  maxUpscale: 1.25
}

export function VirtualCameraParameterControls({
  parameters,
  onParametersChange,
  disabled = false,
  showReset = true
}: VirtualCameraParameterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleParameterChange = useCallback((key: string, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value

    if (key.includes('.')) {
      // Handle nested parameters like smoothing.centerBeta
      const [parent, child] = key.split('.')
      onParametersChange({
        ...parameters,
        [parent]: {
          ...(parameters as any)[parent],
          [child]: newValue
        }
      })
    } else {
      onParametersChange({
        ...parameters,
        [key]: newValue
      })
    }
  }, [parameters, onParametersChange])

  const handleReset = useCallback(() => {
    onParametersChange(DEFAULT_PARAMS)
  }, [onParametersChange])

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`
  const formatDecimal = (value: number) => value.toFixed(3)

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Camera Controls
          </CardTitle>
          <div className="flex items-center gap-2">
            {showReset && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
                className="h-7 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2"
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Controls - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Framing Tightness: {formatPercentage(parameters.faceHeightTarget)}
            </Label>
            <Slider
              value={parameters.faceHeightTarget}
              onChange={(e) => handleParameterChange('faceHeightTarget', parseFloat(e.target.value))}
              min={0.2}
              max={0.6}
              step={0.01}
              disabled={disabled}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Dead Zone: {formatPercentage(parameters.deadZoneWidth)} × {formatPercentage(parameters.deadZoneHeight)}
            </Label>
            <Slider
              value={parameters.deadZoneWidth}
              onChange={(e) => handleParameterChange('deadZoneWidth', parseFloat(e.target.value))}
              min={0.05}
              max={0.25}
              step={0.01}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>

        {/* Advanced Controls - Expandable */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Smoothing (Center): {formatDecimal(parameters.smoothing.centerBeta)}
                </Label>
                <Slider
                  value={parameters.smoothing.centerBeta}
                  onChange={(e) => handleParameterChange('smoothing.centerBeta', parseFloat(e.target.value))}
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  disabled={disabled}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Smoothing (Zoom): {formatDecimal(parameters.smoothing.zoomBeta)}
                </Label>
                <Slider
                  value={parameters.smoothing.zoomBeta}
                  onChange={(e) => handleParameterChange('smoothing.zoomBeta', parseFloat(e.target.value))}
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  disabled={disabled}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Max Pan Speed: {formatDecimal(parameters.stabilization.maxPanVelocity)}
                </Label>
                <Slider
                  value={parameters.stabilization.maxPanVelocity}
                  onChange={(e) => handleParameterChange('stabilization.maxPanVelocity', parseFloat(e.target.value))}
                  min={0.05}
                  max={0.3}
                  step={0.01}
                  disabled={disabled}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Headroom Bias: {parameters.verticalCenterBias > 0 ? '+' : ''}{formatPercentage(parameters.verticalCenterBias)}
                </Label>
                <Slider
                  value={parameters.verticalCenterBias}
                  onChange={(e) => handleParameterChange('verticalCenterBias', parseFloat(e.target.value))}
                  min={-0.1}
                  max={0.1}
                  step={0.005}
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
