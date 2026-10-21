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
3. Clears the orphans' goals and setup-help email records, 500 sites at a time
   (`sitesDeletePrepare`).
4. Pages through again and deletes the orphaned sites, 20 at a time
   (`sitesDelete`). Their shared links and memberships cascade. Their events
   stay in ClickHouse, unreferenced.

Why two passes: Plausible's database has no `site_id` index on `goals` or
`setup_help_emails`, so deleting a site makes Postgres read both tables in full.
On stage they held 16 million and half a million rows, and a batch of 100 sites
ran past the load balancer's 60-second timeout. The first pass empties those
tables of every orphan's rows with one read per batch, so by the second pass
there is little left to read. We don't add the indexes because Plausible owns
that schema.

A failed batch is logged (`plausible site cleanup batch failed`) and skipped;
the next run finds those sites again. Five failures in a row end the run.
Progress is logged every ten pages (`plausible site cleanup progress`), and the
run ends with `plausible site cleanup finished`. A large backlog takes hours.

It skips the run if the journeys database has no journeys at all, since then
every site would look orphaned.

## Running it by hand

Queue a run (a worker must be running to pick it up):

```bash
nx run api-journeys:plausible-site-cleanup --args=--dry-run   # report only
nx run api-journeys:plausible-site-cleanup
```

A dry run logs how many sites it would delete, with a sample of ten.
