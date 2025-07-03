// Journey Properties Update Demo
// This demonstrates how the simplified journey properties update would work in practice

import {
  updateJourneyProperties,
  transformToJourneyUpdateInput,
  transformFromCurrentJourney,
  getDefaultJourneyProperties,
  demonstrateTransformation,
  type JourneyProperties,
  type JourneyUpdateInput
} from './journey-simple-update-prototype'

// ============================================================================
// DEMO SCENARIOS
// ============================================================================

/**
 * Demo 1: Basic Journey Properties Update
 */
async function demoBasicUpdate() {
  console.log("=== Demo 1: Basic Journey Properties Update ===\n")
  
  const journeyProperties: JourneyProperties = {
    title: "Welcome to Our Faith Community",
    description: "A journey exploring faith, community, and spiritual growth",
    theme: {
      mode: "light",
      name: "base"
    },
    settings: {
      showShareButton: true,
      website: true,
      showLogo: true,
      showDisplayTitle: true,
      showHosts: false,
      showChatButtons: false,
      showReactionButtons: false,
      showLikeButton: false,
      showDislikeButton: false,
      showMenu: false
    }
  }
  
  console.log("Journey Properties to Update:")
  console.log(JSON.stringify(journeyProperties, null, 2))
  
  const result = await updateJourneyProperties("journey-456", journeyProperties)
  
  console.log("\nUpdate Result:")
  console.log(result)
  console.log("\n" + "=".repeat(50) + "\n")
}

/**
 * Demo 2: Theme Change - Dark Mode
 */
async function demoDarkModeUpdate() {
  console.log("=== Demo 2: Theme Change to Dark Mode ===\n")
  
  const darkThemeProperties: JourneyProperties = {
    title: "Evening Reflection Journey",
    description: "A contemplative journey for evening reflection",
    theme: {
      mode: "dark",
      name: "base"
    },
    settings: {
      showShareButton: true,
      website: false,
      showLogo: false,
      showDisplayTitle: true,
      showReactionButtons: true,
      showLikeButton: true,
      showDislikeButton: true
    }
  }
  
  console.log("Dark Theme Properties:")
  console.log(JSON.stringify(darkThemeProperties, null, 2))
  
  const result = await updateJourneyProperties("journey-789", darkThemeProperties)
  
  console.log("\nUpdate Result:")
  console.log(result)
  console.log("\n" + "=".repeat(50) + "\n")
}

/**
 * Demo 3: Minimal Update - Title Only
 */
async function demoMinimalUpdate() {
  console.log("=== Demo 3: Minimal Update - Title and Theme Only ===\n")
  
  const minimalProperties: JourneyProperties = {
    title: "Quick Title Update",
    theme: {
      mode: "light",
      name: "base"
    },
    settings: {}
  }
  
  console.log("Minimal Properties:")
  console.log(JSON.stringify(minimalProperties, null, 2))
  
  const result = await updateJourneyProperties("journey-123", minimalProperties)
  
  console.log("\nUpdate Result:")
  console.log(result)
  console.log("\n" + "=".repeat(50) + "\n")
}

/**
 * Demo 4: Validation Error Handling
 */
async function demoValidationErrors() {
  console.log("=== Demo 4: Validation Error Handling ===\n")
  
  // Invalid properties - missing title, invalid theme
  const invalidProperties = {
    title: "", // Empty title (invalid)
    description: "Valid description",
    theme: {
      mode: "invalid", // Invalid mode
      name: "wrong"    // Invalid name
    },
    settings: {
      showShareButton: "not a boolean" // Invalid type
    }
  } as any
  
  console.log("Invalid Properties:")
  console.log(JSON.stringify(invalidProperties, null, 2))
  
  const result = await updateJourneyProperties("journey-error", invalidProperties)
  
  console.log("\nValidation Result:")
  console.log(result)
  console.log("\n" + "=".repeat(50) + "\n")
}

/**
 * Demo 5: Transformation Comparison
 */
function demoTransformation() {
  console.log("=== Demo 5: Transformation Comparison ===\n")
  
  // Simulate current journey data from GraphQL
  const currentJourneyData = {
    title: "Current Journey",
    description: "Current description",
    themeMode: "dark" as const,
    themeName: "base" as const,
    website: true,
    showShareButton: false,
    showLogo: true,
    showDisplayTitle: false,
    showLikeButton: null,
    showDislikeButton: null,
    showHosts: null,
    showChatButtons: null,
    showReactionButtons: null,
    showMenu: null
  }
  
  console.log("1. Current Journey Data (from GraphQL):")
  console.log(JSON.stringify(currentJourneyData, null, 2))
  
  // Transform to simplified format
  const simplifiedFormat = transformFromCurrentJourney(currentJourneyData)
  
  console.log("\n2. Transformed to Simplified Format:")
  console.log(JSON.stringify(simplifiedFormat, null, 2))
  
  // Transform back to GraphQL format
  const backToGraphQL = transformToJourneyUpdateInput(simplifiedFormat)
  
  console.log("\n3. Back to GraphQL JourneyUpdateInput:")
  console.log(JSON.stringify(backToGraphQL, null, 2))
  
  console.log("\n" + "=".repeat(50) + "\n")
}

/**
 * Demo 6: Default Properties Usage
 */
function demoDefaultProperties() {
  console.log("=== Demo 6: Default Properties ===\n")
  
  const defaultProps = getDefaultJourneyProperties()
  
  console.log("Default Journey Properties:")
  console.log(JSON.stringify(defaultProps, null, 2))
  
  // Show what this looks like as GraphQL input
  const asGraphQLInput = transformToJourneyUpdateInput(defaultProps)
  
  console.log("\nAs GraphQL JourneyUpdateInput:")
  console.log(JSON.stringify(asGraphQLInput, null, 2))
  
  console.log("\n" + "=".repeat(50) + "\n")
}

/**
 * Demo 7: Real-world Scenario - Journey Settings Configuration
 */
async function demoRealWorldScenario() {
  console.log("=== Demo 7: Real-world Scenario - Journey Configuration ===\n")
  
  // Scenario: Setting up a public journey for sharing
  const publicJourneyConfig: JourneyProperties = {
    title: "Discovering God's Love",
    description: "An interactive journey exploring God's unconditional love and grace",
    theme: {
      mode: "light",
      name: "base"
    },
    settings: {
      // Enable sharing and public features
      showShareButton: true,
      website: true,
      showDisplayTitle: true,
      showLogo: true,
      showHosts: true,
      
      // Enable engagement features
      showLikeButton: true,
      showDislikeButton: false, // Disable negative feedback
      showReactionButtons: true,
      showChatButtons: true,
      
      // Disable menu for focused experience
      showMenu: false
    }
  }
  
  console.log("Public Journey Configuration:")
  console.log(JSON.stringify(publicJourneyConfig, null, 2))
  
  const result = await updateJourneyProperties("public-journey-001", publicJourneyConfig)
  
  console.log("\nConfiguration Result:")
  console.log(result)
  
  if (result.success) {
    console.log("✅ Journey successfully configured for public sharing!")
  } else {
    console.log("❌ Configuration failed:", result.errors)
  }
  
  console.log("\n" + "=".repeat(50) + "\n")
}

// ============================================================================
// RUN ALL DEMOS
// ============================================================================

/**
 * Run all demonstration scenarios
 */
export async function runAllDemos() {
  console.log("🚀 Starting Journey Properties Update Demos\n")
  console.log("=".repeat(70))
  console.log()
  
  try {
    // Run transformation demo first to show the concept
    demonstrateTransformation()
    
    // Run practical demos
    await demoBasicUpdate()
    await demoDarkModeUpdate()
    await demoMinimalUpdate()
    await demoValidationErrors()
    
    // Run utility demos
    demoTransformation()
    demoDefaultProperties()
    
    // Run real-world scenario
    await demoRealWorldScenario()
    
    console.log("✅ All demos completed successfully!")
    
  } catch (error) {
    console.error("❌ Demo failed:", error)
  }
}

/**
 * Demo showing the key benefits of the simplified approach
 */
export function showBenefits() {
  console.log("=== Benefits of Simplified Journey Properties Update ===\n")
  
  console.log("🎯 KEY BENEFITS:")
  console.log("1. Intuitive Structure - theme: { mode, name } vs separate themeMode/themeName")
  console.log("2. Grouped Settings - all display settings in one object")
  console.log("3. Type Safety - Strong TypeScript types with validation")
  console.log("4. Easy Transformation - Seamless conversion to/from GraphQL")
  console.log("5. Validation - Built-in validation prevents invalid updates")
  console.log("6. AI-Friendly - Simple structure for AI tool generation")
  
  console.log("\n📊 COMPARISON:")
  console.log("\nCURRENT APPROACH (GraphQL JourneyUpdateInput):")
  console.log(`{
  title: "Journey Title",
  description: "Description", 
  themeMode: "dark",
  themeName: "base",
  showShareButton: true,
  website: false,
  showLogo: true,
  showDisplayTitle: false
  // ... 10+ more scattered boolean flags
}`)
  
  console.log("\nSIMPLIFIED APPROACH:")
  console.log(`{
  title: "Journey Title",
  description: "Description",
  theme: {
    mode: "dark",
    name: "base"
  },
  settings: {
    showShareButton: true,
    website: false,
    showLogo: true,
    showDisplayTitle: false
  }
}`)
  
  console.log("\n✨ The simplified approach is more intuitive and maintainable!")
  console.log("\n" + "=".repeat(70))
}

// Export demo functions
export {
  demoBasicUpdate,
  demoDarkModeUpdate,
  demoMinimalUpdate,
  demoValidationErrors,
  demoTransformation,
  demoDefaultProperties,
  demoRealWorldScenario
}

// To run demos, call: runAllDemos() or showBenefits()