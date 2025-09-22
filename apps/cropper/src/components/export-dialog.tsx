'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import type { ExportPreset } from '../types'

interface ExportDialogProps {
  presets: ExportPreset[]
  activePresetId: string
  status: 'idle' | 'processing' | 'complete' | 'error'
  progress: number
  downloadUrl: string | null
  error: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPresetChange: (presetId: string) => void
  onStart: () => void
  onReset: () => void
  disabled?: boolean
}

export function ExportDialog({
  presets,
  activePresetId,
  status,
  progress,
  downloadUrl,
  error,
  open,
  onOpenChange,
  onPresetChange,
  onStart,
  onReset,
  disabled = false
}: ExportDialogProps) {
  const isProcessing = status === 'processing'
  const isComplete = status === 'complete'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm" disabled={disabled} className="rounded-full">
          Export video
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export vertical crop</DialogTitle>
          <DialogDescription>
            Choose a preset to generate a 9:16 deliverable. Files will be automatically saved to your local Downloads folder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <fieldset className="space-y-3" disabled={isProcessing}>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">Presets</legend>
            <div className="grid gap-2">
              {presets.map((preset) => (
                <label
                  key={preset.id}
                  className="flex cursor-pointer flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-3 hover:border-accent/60"
                >
                  <div className="flex items-center justify-between text-sm text-white">
                    <span>{preset.name}</span>
                    <input
                      type="radio"
                      name="export-preset"
                      value={preset.id}
                      checked={preset.id === activePresetId}
                      onChange={() => onPresetChange(preset.id)}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{preset.description}</p>
                  <p className="text-[11px] text-slate-500">
                    {preset.width}×{preset.height} · {preset.fps}fps · {(preset.bitrate / 1_000_000).toFixed(1)}Mbps · {preset.format.toUpperCase()}
                  </p>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-stone-700/60">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Status: {status}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
          </div>

          {downloadUrl ? (
            <div className="rounded-lg bg-white/5 p-3 text-xs text-stone-300">
              ✓ Export complete! File saved to your Downloads folder.
              <br />
              <span className="text-accent">{downloadUrl}</span>
            </div>
          ) : null}

          {error ? <p className="text-xs text-danger">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onReset} disabled={isProcessing} className="rounded-full">
              Reset
            </Button>
            <Button variant="primary" size="sm" onClick={onStart} disabled={disabled || isProcessing} className="rounded-full">
              {isProcessing ? 'Exporting…' : isComplete ? 'Re-export' : 'Start export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
