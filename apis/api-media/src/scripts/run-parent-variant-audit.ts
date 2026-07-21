import { auditParentVariants } from './audit-parent-variants'

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const result = await auditParentVariants(apply)
  console.info(JSON.stringify(result, null, 2))
  if (result.indexingFailures.length > 0) process.exitCode = 1
}

void main()
