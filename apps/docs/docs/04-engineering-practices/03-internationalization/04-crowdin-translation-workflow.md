# Crowdin Translation Workflow

This document outlines the process for translators to review and refine translations, followed by steps to implement those updates in production.

## Prerequisites

- Translator needs to be a native speaker of the target language
- Access rights to Crowdin platform
- Appropriate authorization rights for sync and PR approval

## Step-by-Step Process

### 1. Access Provisioning

- Translator is granted access to the Crowdin platform

### 2. Translation Review

- Translator logs into Crowdin
- Reviews existing translations in their assigned language
- Makes suggestions and improvements where needed
- Ensures translations are contextually accurate

### 3. Translation Approval

- Authorized reviewer checks the suggested changes
- Approves appropriate translation changes
- Marks translations as verified

### 4. GitHub Integration Sync

- Authorized user accesses the Integrations tab in Crowdin
- Navigates to the GitHub integration modal
- Initiates sync process to update translations
- Confirms successful sync completion

### 5. Production Deployment

- Authorized user reviews the automatically created Pull Request (PR)
- Verifies changes are as expected
- Approves and merges PR into production
