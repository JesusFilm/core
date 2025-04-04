// Migration script to replace Subscribe blocks 
import { PrismaClient } from '.prisma/api-journeys-client'

// Create a new PrismaClient instance for this script
const prisma = new PrismaClient()

/**
 * Get all CardBlocks that contain at least one SignUpBlock as a child
 */
async function getCardBlocksWithSignUpChildren() {
  try {
    // First, find all SignUpBlocks to get their parent IDs
    const signUpBlocks = await prisma.block.findMany({
      where: {
        typename: 'SignUpBlock'
      },
      select: {
        id: true,
        parentBlockId: true
      }
    })
    
    console.log(`Found ${signUpBlocks.length} SignUpBlocks in the database`)
    
    // Extract parent block IDs of SignUpBlocks
    const parentBlockIds = signUpBlocks
      .map(block => block.parentBlockId)
      .filter(Boolean) as string[]
    
    if (parentBlockIds.length === 0) {
      console.log('No parent blocks found for SignUpBlocks')
      return []
    }
    
    // Find CardBlocks that match these parent IDs
    const cardBlocks = await prisma.block.findMany({
      where: {
        typename: 'CardBlock',
        id: {
          in: parentBlockIds
        }
      },
      include: {
        action: true
      }
    })
    
    console.log(`Found ${cardBlocks.length} CardBlocks that have SignUpBlock children`)
    return cardBlocks
  } catch (error) {
    console.error('Error fetching CardBlocks with SignUpBlock children:', error)
    throw error
  }
}

async function getSignUpBlocks() {
  try {
    // Get all SignUpBlocks with their actions
    const signUpBlocks = await prisma.block.findMany({
      where: {
        typename: 'SignUpBlock'
      },
      include: {
        action: true
      }
    })
    
    console.log(`Found ${signUpBlocks.length} SignUpBlocks in the database`)
    
    // Get the submitIconIds from the SignUpBlocks
    const iconIds = signUpBlocks
      .map(block => block.submitIconId)
      .filter(Boolean) as string[]
    
    // If there are any icon IDs, fetch the corresponding icon blocks
    if (iconIds.length > 0) {
      const iconBlocks = await prisma.block.findMany({
        where: {
          id: {
            in: iconIds
          }
        }
      })
      
      // Map icons to their SignUpBlocks and log color information
      for (const block of signUpBlocks) {
        if (block.submitIconId) {
          const iconBlock = iconBlocks.find(icon => icon.id === block.submitIconId)
          if (iconBlock) {
            console.log(`SignUpBlock ${block.id} has icon with color: ${iconBlock.color ?? 'Not set'} and iconName: ${iconBlock.name ?? 'Not set'}`)
          }
        }
      }
      
      // You can return both if needed
      return {
        signUpBlocks,
        iconBlocks
      }
    }
    
    return { signUpBlocks, iconBlocks: [] }
  } catch (error) {
    console.error('Error fetching SignUpBlocks:', error)
    throw error
  }
}

// Main function to handle the migration
async function replaceSubscribeBlocks(): Promise<void> {
//   // Get SignUpBlocks and their icons
//   const { signUpBlocks, iconBlocks } = await getSignUpBlocks()
//   console.log(`SignUpBlocks:`, signUpBlocks)
//   //   console.log(`Icon Blocks:`, iconBlocks)
  
  // Get CardBlocks with SignUpBlock children
  const cardBlocks = await getCardBlocksWithSignUpChildren()
  console.log(`CardBlocks with SignUpBlock children:`, cardBlocks)
  
  // Future implementation for replacing blocks
}

// Main execution function
async function main(): Promise<void> {
  try {
    console.log('Starting migration to replace Subscribe blocks')
    await replaceSubscribeBlocks()
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed with error:', error)
    process.exit(1)
  }
}

// Execute the script
main()
  .catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
  .finally(async () => {
    // Close the Prisma client connection
    await prisma.$disconnect()
  })