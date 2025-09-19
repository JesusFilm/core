import { promises } from 'fs'
import path from 'path'

export async function markFileAsCompleted(filePath: string): Promise<void> {
  const completedPath = `${filePath}.completed`
  await promises.rename(filePath, completedPath)
  console.log(`   Marked as completed: ${path.basename(completedPath)}`)
}
