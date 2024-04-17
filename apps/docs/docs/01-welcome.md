# Welcome

## Core Development Kit

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

Core Development Kit is Jesus Film Project's modern, developer-friendly solution that makes building large, feature-rich javascript projects painless. It contains all the tools you need to start building modern react applications ontop of a robust GraphQL Supergraph, using battle-tested front-end and back-end development tools and practices.

## Features

The Core Development Kit provides you with a lot of useful features, so let's take a quick look at some of the key ones:

- **Deploy new applications quickly**. All of our Cloud deployment details are contained within Core making provisioning new resources as quick and easy as raising a Pull Request. We use Terraform to plan and apply changes to cloud infrastructure.
- **Robust Continuous Integration**. Testing everything automatically results in a workflow where we can move fast without breaking things.
- **Monorepo - One source of truth**. Frontend and backend projects are deployed from the same place in the same language - Typescript. We can leverage this to strongly type our frontends to ensure smooth backend changes. Our monorepo allows us to benefit from shared components, infrastructure, libraries across our projects.

## Parts of the Development Kit

Core Development Kit consists of a few separate apps and libs. It's useful to know what they are so you know where to make an impact! What follows is our current layout:

- `apps` folder contains both our back-end subgraphs and front-end sites.
- `libs` folder contains shared libraries used in apps.

## Back-end apps

### Gateway

Gateway is based on [Apollo Federation](https://www.apollographql.com/docs/federation/), a powerful, open architecture for creating a supergraph that combines multiple GraphQL APIs. Gateway serves as the public access point for our supergraph. It receives incoming GraphQL operations and intelligently routes them across our subgraphs. To clients, this looks exactly the same as querying any other GraphQL server—no client-side configuration is required.

### Journeys

Journey subgraph houses everything related to content journeys for both visitors, content managers, and administrators. A Journey is a collection of blocks that help a user navigate through our content on their journey of faith.

### Languages

Language subgraph contains a collection of languages and the countries they are spoken in. A language contains optionally a [BCP-47 code](http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry), an [ISO 3166 code](https://www.iso.org/iso-3166-country-codes.html), a Jesus Film internal code, native names, and translated names. These languages are used to label different resources across the supergraph to indicate that they are available in that language.

### Users

Users subgraph pulls user data stored in [Firebase Authentication](https://firebase.google.com/products/auth), our Simple, multi-platform
sign-in platform. It then makes this resouce available across the supergraph to enrich resources with user display names, emails and more.

### Videos

Videos subgraph pulls data from Arclight, Jesus Film Project's premiere Video API and makes it available for consumption within the supergraph.

## Front-end apps

### Docs

**[docs.core.jesusfilm.org](https://docs.core.jesusfilm.org)** - A [Docusaurus](https://docusaurus.io/) site that produces this documentation. The site is home to our effort to make working with the Core Development Kit a rewarding experience for both new developers to the team and to those with a bit more experience and need quick reference documentation. We encourage you to make updates to this documentation as you extend out different sections.

### Journeys

**[your.nextstep.is](https://your.nextstep.is/)** - A [Next.js](https://nextjs.org/) site connecting visitors to our content through engaging visual journeys on their journey of faith.

### Journeys Admin

**[admin.nextstep.is](https://admin.nextstep.is/)** - A [Next.js](https://nextjs.org/) site empowering content managers to create new and exciting journeys for visitors.

### Watch

**[jesusfilm.org/watch](https://www.jesusfilm.org/watch)** - A [Next.js](https://nextjs.org/) site that puts our incredible videos on display in an easy to use content library.

## Shared Libraries

### Journeys

Shared code between the journeys and journeys-admin apps. Primarily UI components.

### Locales

Translations of UI components and back-end strings.

### Nest

Shared code between back-end apps.

### Shared

Shared code between front-end apps.
