# CI runners

The initial rollout moves automated pull-request CI to one-job Ubuntu 24.04
VMs on `jfp00`, with 8 vCPUs, 24 GiB RAM, and a 120 GiB disposable disk.
Each requests only the label `ci-run-${{ github.run_id }}`. The controller
creates a repository-scoped registration for that run and destroys the VM
after the job. Network isolation blocks the hypervisor, private networks, and
other job VMs.

Both head and base repositories must be `JesusFilm/core`. Eligible PRs are:

- Dependabot (`dependabot[bot]`).
- Renovate (`renovate[bot]`).
- Phoebe (`siyang-bot`), which GitHub reports as a user account.
- Crowdin translations opened by `tataihono`, with the exact branch
  `00-00-CI-chore-i10n-updates` and title `chore: new crowdin translations`.

Routing checks the PR author, so a human rerunning a bot PR still uses jfp00.
A bot acting on a human-authored PR does not qualify. Human PRs, fork PRs,
pushes, scheduled jobs, manual runs, and merge queue runs retain their existing
runners. Existing notification and required-check wrapper jobs are unchanged.

The workflow expression, host controller, and before-job hook independently
check this policy. The controller fetches the PR associated with the workflow
run from GitHub before provisioning; missing or ambiguous PR associations are
rejected. Branch names or the run actor alone cannot grant admission. The
private organization runner group is unchanged; this public repository uses
repository-scoped registrations.

The shared controller is `/usr/local/lib/ci-runner/controller.py` on `jfp00`,
managed by `ci-runner-controller.service`. The before-job policy hook comes from
`/usr/local/lib/ci-runner/job_guard.py`. Its public-repository exception is
explicitly limited to `JesusFilm/core`, and its jobs are placed only on `jfp00`.
Admission checks reserve memory and storage for the existing workloads.

Use `actions/setup-node`, rather than the Blacksmith-specific setup action.
Guest package installation can use passwordless `sudo`; credentials and the
host filesystem are not mounted in the guest. Local guests install packages directly from the registry: restoring the large
pnpm cache from GitHub was slower over this connection than a fresh install.
Blacksmith jobs retain the pnpm cache. Full-history checkouts use partial
clones (`filter: blob:none`) to preserve ancestry without downloading historical
file contents. Jobs must not depend on a workspace or local cache surviving
between runs.

To roll back routing, replace each `ci-run-…` expression with its existing
Blacksmith fallback label (the final value in that expression).
Existing jobs can finish normally. Do not stop the shared controller to roll
back this repository, because it also serves other repositories.
