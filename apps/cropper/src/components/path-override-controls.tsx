'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Plus, Trash2, Edit3, Pin, Users, Crop, ZoomIn, Lock } from 'lucide-react'
import type { PathOverride, OverrideType, VirtualCameraPathWithOverrides } from '@core/shared/video-processing'

interface PathOverrideControlsProps {
  /** Current path with overrides */
  path: VirtualCameraPathWithOverrides
  /** Callback when overrides change */
  onOverridesChange: (overrides: PathOverride[]) => void
  /** Current video time for context */
  currentTime?: number
  /** Whether controls are disabled */
  disabled?: boolean
}

const OVERRIDE_TYPES: { value: OverrideType; label: string; icon: React.ReactNode }[] = [
  { value: 'pin_region', label: 'Pin Region', icon: <Pin className="h-4 w-4" /> },
  { value: 'swap_primary_face', label: 'Swap Primary Face', icon: <Users className="h-4 w-4" /> },
  { value: 'static_crop', label: 'Static Crop', icon: <Crop className="h-4 w-4" /> },
  { value: 'lock_zoom', label: 'Lock Zoom', icon: <ZoomIn className="h-4 w-4" /> },
  { value: 'lock_position', label: 'Lock Position', icon: <Lock className="h-4 w-4" /> }
]

export function PathOverrideControls({
  path,
  onOverridesChange,
  currentTime = 0,
  disabled = false
}: PathOverrideControlsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOverride, setEditingOverride] = useState<PathOverride | null>(null)

  const [newOverride, setNewOverride] = useState<Partial<PathOverride>>({
    type: 'pin_region',
    startTime: currentTime,
    endTime: Math.min(currentTime + 5, path.metadata.duration),
    parameters: {},
    reason: ''
  })

  const handleAddOverride = useCallback(() => {
    if (!newOverride.type || !newOverride.startTime || !newOverride.endTime) return

    const override: PathOverride = {
      id: `override_${Date.now()}`,
      type: newOverride.type,
      startTime: newOverride.startTime,
      endTime: newOverride.endTime,
      parameters: newOverride.parameters || {},
      reason: newOverride.reason || '',
      createdAt: new Date()
    }

    onOverridesChange([...path.overrides, override])
    setNewOverride({
      type: 'pin_region',
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, path.metadata.duration),
      parameters: {},
      reason: ''
    })
    setIsDialogOpen(false)
  }, [newOverride, currentTime, path, onOverridesChange])

  const handleEditOverride = useCallback((override: PathOverride) => {
    setEditingOverride(override)
    setNewOverride(override)
    setIsDialogOpen(true)
  }, [])

  const handleUpdateOverride = useCallback(() => {
    if (!editingOverride || !newOverride.type) return

    const updatedOverrides = path.overrides.map(ov =>
      ov.id === editingOverride.id
        ? { ...ov, ...newOverride, createdAt: new Date() }
        : ov
    )

    onOverridesChange(updatedOverrides)
    setEditingOverride(null)
    setNewOverride({
      type: 'pin_region',
      startTime: currentTime,
      endTime: Math.min(currentTime + 5, path.metadata.duration),
      parameters: {},
      reason: ''
    })
    setIsDialogOpen(false)
  }, [editingOverride, newOverride, path.overrides, onOverridesChange, currentTime])

  const handleDeleteOverride = useCallback((overrideId: string) => {
    onOverridesChange(path.overrides.filter(ov => ov.id !== overrideId))
  }, [path.overrides, onOverridesChange])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getOverrideIcon = (type: OverrideType) => {
    return OVERRIDE_TYPES.find(t => t.value === type)?.icon || <Edit3 className="h-4 w-4" />
  }

  const getOverrideLabel = (type: OverrideType) => {
    return OVERRIDE_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Edit3 className="h-4 w-4" />
            Path Overrides
            <span className="text-xs text-muted-foreground">({path.overrides.length})</span>
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="h-7 px-2"
                onClick={() => {
                  setEditingOverride(null)
                  setNewOverride({
                    type: 'pin_region',
                    startTime: currentTime,
                    endTime: Math.min(currentTime + 5, path.metadata.duration),
                    parameters: {},
                    reason: ''
                  })
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingOverride ? 'Edit Override' : 'Add Override'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newOverride.type}
                    onValueChange={(value: OverrideType) =>
                      setNewOverride(prev => ({ ...prev, type: value, parameters: {} }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OVERRIDE_TYPES.map(({ value, label, icon }) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            {icon}
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newOverride.startTime || 0}
                      onChange={(e) =>
                        setNewOverride(prev => ({
                          ...prev,
                          startTime: parseFloat(e.target.value) || 0
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newOverride.endTime || 0}
                      onChange={(e) =>
                        setNewOverride(prev => ({
                          ...prev,
                          endTime: parseFloat(e.target.value) || 0
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Type-specific parameters */}
                {newOverride.type === 'pin_region' && (
                  <div className="space-y-2">
                    <Label>Crop Region (0-1)</Label>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <Input placeholder="cx" step="0.01" />
                      <Input placeholder="cy" step="0.01" />
                      <Input placeholder="cw" step="0.01" />
                      <Input placeholder="ch" step="0.01" />
                    </div>
                  </div>
                )}

                {newOverride.type === 'static_crop' && (
                  <div className="space-y-2">
                    <Label>Static Crop Window</Label>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <Input placeholder="cx" step="0.01" />
                      <Input placeholder="cy" step="0.01" />
                      <Input placeholder="cw" step="0.01" />
                      <Input placeholder="ch" step="0.01" />
                    </div>
                  </div>
                )}

                {newOverride.type === 'lock_zoom' && (
                  <div className="space-y-2">
                    <Label>Zoom Level</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1.0"
                      onChange={(e) =>
                        setNewOverride(prev => ({
                          ...prev,
                          parameters: { zoom: parseFloat(e.target.value) || 1.0 }
                        }))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Input
                    placeholder="Why this override?"
                    value={newOverride.reason || ''}
                    onChange={(e) =>
                      setNewOverride(prev => ({ ...prev, reason: e.target.value }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingOverride ? handleUpdateOverride : handleAddOverride}>
                    {editingOverride ? 'Update' : 'Add'} Override
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {path.overrides.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No overrides applied. Add manual adjustments to fine-tune the path.
          </p>
        ) : (
          <div className="space-y-2">
            {path.overrides.map((override) => (
              <div
                key={override.id}
                className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {getOverrideIcon(override.type)}
                  <div className="text-sm">
                    <div className="font-medium">{getOverrideLabel(override.type)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(override.startTime)} - {formatTime(override.endTime)}
                      {override.reason && ` • ${override.reason}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditOverride(override)}
                    disabled={disabled}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOverride(override.id)}
                    disabled={disabled}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
