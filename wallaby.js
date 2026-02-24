module.exports = function (wallaby) {
  return {
    // Override: only detect and configure 'jest'
    // Wallaby.js will hang forever if both jest and vitest are detected.
    // Ensure to run wallaby.js with 'Select Configuration' -> wallaby.js
    autoDetect: ['jest']
  }
}
