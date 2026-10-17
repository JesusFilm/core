export const queueName = 'api-media-verify-available-languages'
export const jobName = `${queueName}-job`
// Daily at 4am, after parentVariantAudit's 2am slot -- both are catalog-wide
// batch audits, not urgent per-record work, so a daily cadence is enough.
export const repeat = '0 0 4 * * *'
