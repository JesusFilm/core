import type { ToolsVisualsTarget } from './types'

export const TOOLS_VISUALS_TARGETS: readonly ToolsVisualsTarget[] = [
  {
    id: 'square',
    label: 'Square (1:1)',
    width: 1024,
    height: 1024,
    aspectRatio: '1:1'
  },
  {
    id: 'landscape',
    label: 'Landscape (16:9)',
    width: 1024,
    height: 576,
    aspectRatio: '16:9'
  },
  {
    id: 'portrait',
    label: 'Portrait (9:16)',
    width: 576,
    height: 1024,
    aspectRatio: '9:16'
  },
  {
    id: 'story',
    label: 'Story (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16'
  }
] as const

export function getTargetDimensions(targetId: string): ToolsVisualsTarget | undefined {
  return TOOLS_VISUALS_TARGETS.find(target => target.id === targetId)
}

export function formatDownloadName({
  title,
  targetId,
  provider,
  index,
  timestamp
}: {
  title?: string
  targetId: string
  provider: string
  index: number
  timestamp: Date
}): string {
  const target = getTargetDimensions(targetId)
  const baseName = title ? `${title.replace(/[^a-zA-Z0-9]/g, '_')}` : 'generated'
  const dateStr = timestamp.toISOString().split('T')[0]
  const timeStr = timestamp.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-')

  return `${baseName}_${target?.label.replace(/[^a-zA-Z0-9]/g, '_')}_${provider}_${index + 1}_${dateStr}_${timeStr}.png`
}

