// @ts-check

/**
 * Writes dist/apps/arclight/package.json for the production Docker image,
 * generated from the Nx project graph — the same output `@nx/next:build`
 * produced before arclight moved to plain `next build` (nrwl/nx#36511).
 * Run from the workspace root by the arclight `_build` target.
 */
const {
  createProjectGraphAsync,
  workspaceRoot,
  writeJsonFile
} = require('nx/src/devkit-exports')
const { createPackageJson } = require('@nx/js')

async function main() {
  const graph = await createProjectGraphAsync()
  const packageJson = createPackageJson('arclight', graph, {
    target: 'build',
    root: workspaceRoot,
    isProduction: true
  })
  packageJson.scripts = { start: 'next start' }
  packageJson.dependencies ??= {}
  // Always required for a production Next.js app to run (mirrors @nx/next:build);
  // sharp is for next/image
  for (const pkg of ['react', 'react-dom', 'next', 'typescript', 'sharp']) {
    const externalNode = graph.externalNodes?.[`npm:${pkg}`]
    if (externalNode) {
      packageJson.dependencies[pkg] ??= externalNode.data.version
    }
  }
  writeJsonFile(`${workspaceRoot}/dist/apps/arclight/package.json`, packageJson)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
