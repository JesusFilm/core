import { logger } from '../logger'

import { auditParentVariants } from './audit-parent-variants'

async function main(): Promise<void> {
  const result = await auditParentVariants()
  logger.info({ result }, 'Parent variant audit result')
}

void main()
