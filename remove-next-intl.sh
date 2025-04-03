#!/bin/bash

# Function to remove NextIntlClientProvider from spec files
process_file() {
  local file=$1
  echo "Processing $file"
  
  # Remove import statement
  sed -i 's/import { NextIntlClientProvider } from .next-intl.//g' "$file"
  sed -i 's/import { NextIntlClientProvider, [^}]*} from .next-intl./import { /g' "$file"
  sed -i 's/import {[^}]*, NextIntlClientProvider } from .next-intl./import { /g' "$file"
  
  # Remove NextIntlClientProvider wrapper
  sed -i 's/<NextIntlClientProvider locale="en">\s*\(<.*\/>\)\s*<\/NextIntlClientProvider>/\1/g' "$file"
  sed -i 's/<NextIntlClientProvider locale={[^}]*}>\s*\(<.*\/>\)\s*<\/NextIntlClientProvider>/\1/g' "$file"

  # Remove NextIntlClientProvider wrapper for multi-line components
  sed -i -e ':a' -e 'N' -e '$!ba' -e 's/<NextIntlClientProvider locale="en">\s*\(<.*\n.*>\)\s*<\/NextIntlClientProvider>/\1/g' "$file"
  sed -i -e ':a' -e 'N' -e '$!ba' -e 's/<NextIntlClientProvider locale={[^}]*}>\s*\(<.*\n.*>\)\s*<\/NextIntlClientProvider>/\1/g' "$file"
}

# Find all spec and stories files with NextIntlClientProvider
files=$(find apps/videos-admin -name "*.spec.tsx" -o -name "*.stories.tsx" | xargs grep -l "import.*NextIntlClientProvider")

# Process each file
for file in $files; do
  process_file "$file"
done

# Handle mock files
mock_files=$(find apps/videos-admin -name "*.spec.tsx" | xargs grep -l "jest.mock.*next-intl")

for file in $mock_files; do
  echo "Removing next-intl mock from $file"
  sed -i '/jest.mock.*next-intl/,/}))/d' "$file"
done

echo "Completed processing files" 