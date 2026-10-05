import { Logger } from 'pino'

import { auditParentVariants } from '../../scripts/audit-parent-variants'

export async function service(logger?: Logger): Promise<void> {
  const result = await auditParentVariants()
  logger?.info(
    {
      deterministicGapCount: result.deterministicGaps.length,
      ambiguousCount: result.ambiguous.length
    },
    'Daily parent Variant audit completed'
  )
}
