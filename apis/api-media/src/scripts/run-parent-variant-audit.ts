import { auditParentVariants } from './audit-parent-variants'

async function main(): Promise<void> {
  const result = await auditParentVariants()
  console.info(JSON.stringify(result, null, 2))
}

void main()
