import { PrismaClient } from '.prisma/api-journeys-client'

// Create a new PrismaClient instance for this script
const prisma = new PrismaClient()

// Main function to handle the migration
async function migrateButtonBlocks(): Promise<void> {
  await prisma.block.updateMany({
    where: {
      typename: 'ButtonBlock',
      submitEnabled: null
    },
    data: {
      submitEnabled: true
    }
  })
}

// Main execution function
async function main(): Promise<void> {
  try {
    console.log(
      'Starting migration to set submitEnabled field for Button blocks'
    )
    await migrateButtonBlocks()
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
