import { Block } from '@core/prisma/journeys/client'

export function getButtonBlockContent({ block }: { block: Block }): string {
  return `
## Button:
- Block ID: ${block.id}
- Button Label: ${block.label}
`
}
