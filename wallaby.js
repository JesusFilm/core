module.exports = function (wallaby) {
  return {
    // Override: only detect and configure 'vitest'
    // Wallaby.js will hang forever if both jest and vitest are detected.
    // Ensure to run wallaby.js with 'Select Configuration' -> wallaby.js
    autoDetect: ['vitest']
  }
}
