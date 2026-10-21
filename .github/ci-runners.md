# CI runners

The initial rollout moves automated pull-request CI to one-job Ubuntu 24.04
VMs on `jfp00` or `jfp01`, with 8 vCPUs, 24 GiB RAM, and a 120 GiB disposable disk.
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

The repository Actions variable `JFP00_PR_AUTHORS` holds the JSON author list:
`["dependabot[bot]","renovate[bot]","siyang-bot"]`. All 12 routing expressions
read this one list. Crowdin keeps the exact identity check above. A missing or
empty variable disables all Proxmox routing, including Crowdin, for new runs.
The host retains its independent allowlist: adding another author requires a
reviewed host-policy change as well as updating the variable.

Routing checks the PR author, so a human rerunning a bot PR still uses Proxmox runners.
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
explicitly limited to `JesusFilm/core`. Core jobs can use both nodes, preferring
the node with fewer active CI guests, with ties favoring jfp01. Each node has
eight slots shared with the other CI repositories; actual concurrency remains
limited by each node's memory/storage admission checks. The
[controller patch](ci-runners/jfp01-controller.patch) updates only core placement;
the bot/fork policy and private-repository scheduling are unchanged.
This is a slot limit, not guaranteed capacity. Occupied slots and admission
checks reduce availability: the controller reserves at least 32 GiB RAM and
256 GiB storage, and conservatively budgets active guests plus the next guest.
A locked template, insufficient capacity, or an unreachable node is skipped so
the other node can still serve core. The controller and authentication broker
remain on jfp00: this is a shared worker pool, not controller failover.

A selected `ci-run-…` label has **no automatic Blacksmith fallback**. If neither worker node
can admit a job, or the controller/broker on jfp00 is unavailable, it stays queued. During this
pilot, the PR assignee should check the Actions queue; no automatic stalled-job
alert is configured. Investigate a core job waiting more than 10 minutes:

1. Check the queued label and other running jobs in GitHub Actions.
2. On jfp00, inspect `systemctl status ci-runner-controller`,
   `journalctl --namespace=ci-runner -u ci-runner-controller`, and
   `/var/lib/ci-runner/state.json`; check available memory/storage and template
   backup locks on the selected node. Do not unlock an active backup or delete
   active job guests.
3. If the host cannot recover promptly, delete the repository variable
   `JFP00_PR_AUTHORS` to stop routing new runs to it. Cancel stalled runs and
   start fresh PR runs after disabling routing; already queued jobs do not
   automatically change labels. Restore the documented JSON list to re-enable
   the pilot after recovery.

Both node names use the `ci-jfp` runner prefix. Deploy the workflow setup/cache
checks before enabling jfp01 placement; older runs that only recognize
`ci-jfp00-` must finish or be cancelled first. Operator source backups and
placement/policy tests are in `/root/ci-core-migration-20261021/` on jfp00.

Main's Blacksmith jobs keep `useblacksmith/setup-node` and its local pnpm
cache. Mutually exclusive steps use `actions/setup-node` without caching on
either Proxmox node. The other workflows retain their existing standard setup action on
Blacksmith, with caching disabled on both Proxmox nodes.
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
