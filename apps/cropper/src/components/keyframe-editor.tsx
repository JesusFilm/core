'use client'

import type { CropKeyframe, CropWindow } from '../types'
import { Slider } from './ui/slider'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface KeyframeEditorProps {
  keyframe: CropKeyframe | null
  onChange: (patch: Partial<CropWindow> & { time?: number }) => void
  onDelete: (keyframeId: string) => void
  disabled?: boolean
}

export function KeyframeEditor({ keyframe, onChange, onDelete, disabled = false }: KeyframeEditorProps) {
  if (!keyframe) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        Select a keyframe on the timeline to edit focus and zoom parameters.
      </section>
    )
  }

  const { window, time } = keyframe

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-white">Keyframe Editor</h3>
        <p className="text-xs text-slate-400">Fine-tune focus position and zoom for the active frame.</p>
      </header>

      <div className="space-y-3">
        <Slider
          label={`Horizontal focus (${window.focusX.toFixed(2)})`}
          min={0}
          max={1}
          step={0.01}
          value={window.focusX}
          onChange={(event) => onChange({ focusX: Number(event.target.value) })}
          disabled={disabled}
        />
        <Slider
          label={`Vertical focus (${window.focusY.toFixed(2)})`}
          min={0}
          max={1}
          step={0.01}
          value={window.focusY}
          onChange={(event) => onChange({ focusY: Number(event.target.value) })}
          disabled={disabled}
        />
        <Slider
          label={`Zoom (${window.scale.toFixed(2)})`}
          min={0.2}
          max={1.25}
          step={0.01}
          value={window.scale}
          onChange={(event) => onChange({ scale: Number(event.target.value) })}
          disabled={disabled}
        />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-400">
          <span>Timestamp (seconds)</span>
          <Input
            type="number"
            min={0}
            step={0.1}
            value={time.toFixed(2)}
            onChange={(event) => onChange({ time: Number(event.target.value) })}
            disabled={disabled}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onDelete(keyframe.id)} disabled={disabled}>
          Remove keyframe
        </Button>
      </div>
    </section>
  )
}
