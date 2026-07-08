# Docs

The public developer handbook for the platform, served at `docs.core.jesusfilm.org` (a Docusaurus site, deployed to Vercel). It owns no domain entities — it is prose *about* the other contexts, written for contributors and team members. Its language is about the publication itself, not the platform it describes.

## Language

**Core Development Kit**:
The docs site's name for the platform as a whole — the Nx monorepo (`core`) plus its practices and infrastructure, presented as a toolkit a contributor builds on. This term exists only on the docs surface; code and other contexts just say "Core" or name a workspace.
_Avoid_: CDK (collides with AWS CDK), "the framework"

**Handbook Section**:
A top-level ordered division of the docs sidebar: Welcome, Getting Started, Basics, Engineering Practices, Team, Product, Quick Links, Helpful Tools. Sections are numbered directories (`01-welcome.md`, `03-basics/`); the number is ordering, not identity.
_Avoid_: chapter, category (Docusaurus's `_category_.json` is the mechanism, not the concept)

**Team Handbook**:
The people-facing subset of the docs (the Team section): code of conduct, how/where we work, career, responsibilities. Distinct in audience from the engineering sections — it documents the organization, not the code.

**Blog**:
The Docusaurus blog stream with named Authors (`blog/authors.yml`). Effectively dormant (a single 2022 post) but part of the published surface.

## What this context deliberately does not own

Definitions of platform concepts (Journey, Language, Supergraph, …) belong to their owning contexts' `CONTEXT.md` files. When docs prose drifts from an owning context's glossary, the glossary wins and the docs page is the thing to fix.
