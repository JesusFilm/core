# Journey Properties Update Prototype

This prototype demonstrates updating journey properties (title, description, theme, settings) using the simplified JSON structure outlined in PRD ENG-2822.

## Overview

The prototype focuses specifically on **journey-level properties** rather than step/block content, implementing the `journey` object from the simplified structure:

```json
{
  "journey": {
    "title": "Journey Title",
    "description": "Journey description",
    "theme": { "mode": "dark", "name": "base" },
    "settings": {
      "showShareButton": false,
      "website": false
    }
  }
}
```

## Files Created

### 1. `journey-simple-update-prototype.ts`
Core prototype implementation with:
- **Type Definitions**: Simplified TypeScript interfaces for journey properties
- **Validation Logic**: Input validation (uses basic validation, would be Zod in real implementation)
- **Transformation Functions**: Convert between simplified and current GraphQL formats
- **Update Function**: Main `updateJourneyProperties()` function prototype

### 2. `journey-properties-demo.ts`
Comprehensive demonstration showing:
- **Real-world scenarios**: Various journey configuration examples
- **Validation handling**: Error cases and validation examples
- **Transformation demos**: Data format conversions
- **Benefits comparison**: Current vs simplified approaches

## Key Features

### 🎯 Simplified Structure
```typescript
interface JourneyProperties {
  title: string
  description?: string
  theme: {
    mode: 'dark' | 'light'
    name: 'base'
  }
  settings: {
    showShareButton?: boolean
    website?: boolean
    showLogo?: boolean
    // ... other display settings
  }
}
```

### 🔄 Seamless Transformation
- **To GraphQL**: `transformToJourneyUpdateInput()` converts simplified format to current `JourneyUpdateInput`
- **From GraphQL**: `transformFromCurrentJourney()` converts current journey data to simplified format

### ✅ Validation & Type Safety
- Input validation with descriptive error messages
- Strong TypeScript types prevent runtime errors
- Handles edge cases and invalid data gracefully

### 🚀 AI-Friendly Design
- Intuitive structure for AI tool generation
- Grouped related settings for better comprehension
- Clear validation messages for error handling

## Benefits Over Current Approach

| Aspect | Current (GraphQL) | Simplified |
|--------|------------------|------------|
| **Theme** | `themeMode: "dark", themeName: "base"` | `theme: { mode: "dark", name: "base" }` |
| **Settings** | 10+ scattered boolean flags | Grouped in `settings` object |
| **Structure** | Flat, mixed concerns | Hierarchical, organized |
| **AI Tools** | Complex, error-prone | Intuitive, maintainable |

## Usage Examples

### Basic Update
```typescript
const properties: JourneyProperties = {
  title: "Welcome Journey",
  description: "A welcoming journey for new visitors",
  theme: { mode: "light", name: "base" },
  settings: {
    showShareButton: true,
    website: true,
    showLogo: true
  }
}

await updateJourneyProperties("journey-123", properties)
```

### Theme Change
```typescript
const darkTheme: JourneyProperties = {
  title: "Evening Reflection",
  theme: { mode: "dark", name: "base" },
  settings: {
    showReactionButtons: true,
    showLikeButton: true
  }
}

await updateJourneyProperties("journey-456", darkTheme)
```

### Validation Handling
```typescript
const result = await updateJourneyProperties(journeyId, properties)

if (result.success) {
  console.log("✅ Journey updated successfully!")
} else {
  console.log("❌ Validation errors:", result.errors)
}
```

## Implementation Notes

### Current Limitations
- **Prototype Only**: Simulates GraphQL calls with console output
- **Basic Validation**: Uses manual validation instead of Zod schemas
- **No Database**: No actual persistence layer

### Production Requirements
- **Zod Integration**: Replace manual validation with Zod schemas
- **GraphQL Integration**: Connect to actual `journeyUpdate` mutation
- **Error Handling**: Add comprehensive error handling and retry logic
- **Testing**: Add unit tests for all transformation functions

## Integration with PRD ENG-2822

This prototype specifically addresses:

✅ **Simplified JSON Structure**: Implements the `journey` portion of the simplified format

✅ **Validation**: Full input validation with error reporting

✅ **Transformation Layer**: Seamless conversion to/from current GraphQL schema

✅ **Type Safety**: Strong TypeScript types with interfaces

✅ **AI-Friendly**: Intuitive structure suitable for AI tool generation

## Running the Demo

```typescript
// Import demo functions
import { runAllDemos, showBenefits } from './journey-properties-demo'

// Run all demonstration scenarios
await runAllDemos()

// Show benefits comparison
showBenefits()
```

## Next Steps for Full Implementation

1. **Backend Implementation**: Create GraphQL resolvers for simplified journey operations
2. **Frontend Tools**: Build AI tools using this simplified structure  
3. **Zod Integration**: Replace manual validation with proper Zod schemas
4. **Step Content**: Extend to handle the `steps` array (separate from this prototype)
5. **Testing**: Comprehensive test suite for all scenarios

---

This prototype demonstrates the foundation for the simplified journey properties update system outlined in ENG-2822, focusing specifically on journey-level properties while providing a clear path for full implementation.