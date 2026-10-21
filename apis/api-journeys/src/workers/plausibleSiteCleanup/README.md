# Plausible Site Cleanup Worker

Deletes the Plausible sites `api-journeys` created for journeys, templates and
teams that have since been hard-deleted.

`workers/plausible` creates one site per journey, template and team, named
`api-journeys-journey-<id>`, `api-journeys-template-<id>` and
`api-journeys-team-<id>`. Nothing removed them when the row was hard-deleted —
by the e2e cleanup, the anonymous journey cleanup or a user deletion — so on
stage, where e2e creates journeys all day, they piled up until Plausible ran out
of memory at boot (it loads every site into a cache before it reports healthy).

## What it does

Daily at 05:00 UTC, after the e2e (03:00) and anonymous journey (04:00)
cleanups:

1. Pages through the sites the API key's Plausible user owns whose domain starts
   with `api-journeys-` (`sites` on `api-analytics`), 1,000 at a time.
2. Looks up each site's journey or team by id. Soft-deleted rows still count as
   existing; only a missing row orphans a site. Domains that don't match the
   pattern are never touched.
3. Deletes the orphans 100 at a time (`sitesDelete`). Their goals, shared links
   and memberships cascade. Their events stay in ClickHouse, unreferenced.

It skips the run if the journeys database has no journeys at all, since then
every site would look orphaned.

## Running it by hand

Queue a run (a worker must be running to pick it up):

```bash
nx run api-journeys:plausible-site-cleanup --args=--dry-run   # report only
nx run api-journeys:plausible-site-cleanup
```

A dry run logs how many sites each page would delete, with a sample of ten.
