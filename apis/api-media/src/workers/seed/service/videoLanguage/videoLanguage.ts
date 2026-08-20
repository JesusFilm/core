import { verifyAvailableLanguages } from '../../../../schema/video/lib/verifyAvailableLanguages'
import { logger } from '../../../lib/logger'

// Reseeds every video's availableLanguages using the batch verifier's
// bottom-up, dependency-ordered recompute (verifyAvailableLanguages with
// fix: true) rather than this job's own per-video loop. A per-video loop
// that computes every value before writing any of them reads each child's
// pre-seed *stored* availableLanguages, not the value this run computes for
// it - so a container is seeded from stale/drifted child rows, and a
// multi-level hierarchy never converges in one pass. The verifier already
// solves this (batched, level-by-level, writing each level before the level
// above it reads it), so this job delegates to it instead of maintaining a
// second, subtly different definition of "compute in dependency order".
export async function seedVideoLanguages(): Promise<void> {
  const result = await verifyAvailableLanguages({ fix: true })

  if (result.cycleVideoIds.length > 0) {
    logger.error(
      { cycleVideoIds: result.cycleVideoIds },
      'seedVideoLanguages: videos on a children/parents cycle were skipped'
    )
  }

  if (result.blockedAncestorVideoIds.length > 0) {
    logger.error(
      { blockedAncestorVideoIds: result.blockedAncestorVideoIds },
      'seedVideoLanguages: videos blocked by a descendant cycle were skipped'
    )
  }
}
