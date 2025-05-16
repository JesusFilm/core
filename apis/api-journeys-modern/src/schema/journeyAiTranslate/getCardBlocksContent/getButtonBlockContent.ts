import { Block } from '.prisma/api-journeys-modern-client'

export function getButtonBlockContent({
  blocks,
  block
}: {
  blocks: Block[]
  block: Block
}): string {
  return `
## Button:
- Block ID: ${block.id}
- Button Label: ${block.label}
`
}
