# WordPress Algolia Search Integration

## Overview

The [WP Search with Algolia plugin](https://wordpress.org/plugins/wp-search-with-algolia/) is used to synchronize data between WordPress and our Core project via Algolia. This integration enables automated content synchronization across different environments.

## Initial Setup

### Prerequisites

- Ensure all required taxonomies and categories are created in WordPress
  - _Note: [Taxonomies in WordPress](https://www.hostinger.com/tutorials/wordpress-taxonomy/#:~:text=WordPress%20Taxonomy%20is%20a%20way,to%20meet%20specific%20website%20needs.) are systems for organizing and grouping content, such as categories, tags, or custom classifications_

### Plugin Installation and Configuration

1. **Plugin Activation**
   - Locate the Algolia plugin in WordPress dashboard
   - If not visible, verify it's enabled in the plugins page

2. **Basic Configuration**
   - Navigate to the Algolia Settings page
   - Follow the provided instructions to establish WordPress-Algolia connection

3. **Search Configuration**
   - Go to the Search Page settings
   - Select 'Do not use Algolia' option
   - _Important: This prevents WordPress from using Algolia as its search engine, as we're only using it for data transfer to Core_

4. **Taxonomy Configuration**
   - Access the Algolia Autocomplete page
   - Select desired taxonomies for synchronization
   - Click 'Re-index' to perform initial data indexing
   - **Remember**: Save changes on all configuration pages

## Automated Synchronization

Once configured, the system will:

- Automatically sync new blog posts to Algolia upon publication
- Allow immediate consumption of this data in Core project
- Maintain data consistency across environments

## Important Notes

- Always verify saved changes on configuration pages
- Initial indexing is required only for existing content
- New content syncs automatically after setup
- The plugin serves as a data bridge between WordPress and Core, not as a search solution
