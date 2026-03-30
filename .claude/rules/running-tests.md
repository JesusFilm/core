# Running Tests

**Applies when:** Running Jest tests for any app or library in this monorepo.

## Use `npx jest` directly — never `npx nx test`

The `nx test` executor has critical issues:
- `--testPathPattern` is silently ignored and runs **all** test suites (~3+ minutes)
- `--testFile` works but adds ~2s overhead per invocation

### Single file

```bash
npx jest --config <app-path>/jest.config.ts --no-coverage '<path-to-spec-file>'
```

Example:
```bash
npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/Foo/Foo.spec.tsx'
```

### Multiple files or a folder

```bash
npx jest --config <app-path>/jest.config.ts --no-coverage '<path-to-folder>'
```

### Flags

- **Always pass `--no-coverage`** — coverage is enabled by default in jest configs and slows runs.
- Pass `--verbose` only when debugging a specific failure.

### Finding the right jest config

Each app has its own `jest.config.ts` at the app root. Match the spec file's app:

| Spec file path starts with | Jest config |
|---|---|
| `apps/<app-name>/` | `apps/<app-name>/jest.config.ts` |
| `libs/<lib-name>/` | `libs/<lib-name>/jest.config.ts` |

## Common mistakes to avoid

- **Do NOT use** `npx nx test <project> --testPathPattern=...` — it runs all tests
- **Do NOT omit `--no-coverage`** — coverage collection doubles execution time
- **Do NOT run `npx nx test <project>` without a file filter** — it runs the entire suite
