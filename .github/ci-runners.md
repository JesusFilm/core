# CI runners

Blacksmith workloads use one-job Ubuntu 24.04 VMs on `jfp00`, with 8 vCPUs,
24 GiB RAM, and a 120 GiB disposable disk. Each requests only the label
`ci-run-${{ github.run_id }}`. The controller creates a repository-scoped
registration for that run and destroys the VM after the job. Network isolation
blocks the hypervisor, private networks, and other job VMs.

The runner expression and the host controller independently admit these events
for `JesusFilm/core`:

- Pull requests whose head and base repositories are both `JesusFilm/core`.
- Pushes and manual runs on `main` or `stage`.
- Scheduled runs on `main`.
- Merge queue runs targeting `main`.

Fork pull requests and other events use GitHub-hosted Ubuntu 22.04. Existing
GitHub-hosted notification and required-check wrapper jobs remain hosted. The
private organization runner group is unchanged; this public repository uses
repository-scoped registrations. The host controller and before-job hook reject
fork PRs even if a modified workflow requests a run label directly.

The shared controller is `/usr/local/lib/ci-runner/controller.py` on `jfp00`,
managed by `ci-runner-controller.service`. The before-job policy hook comes from
`/usr/local/lib/ci-runner/job_guard.py`. Its public-repository exception is
explicitly limited to `JesusFilm/core`, and its jobs are placed only on `jfp00`.
Admission checks reserve memory and storage for the existing workloads.

Use `actions/setup-node`, rather than the Blacksmith-specific setup action.
Guest package installation can use passwordless `sudo`; credentials and the
host filesystem are not mounted in the guest. Caches use GitHub Actions storage,
so jobs must not depend on a workspace or local cache surviving between runs.

To roll back routing, replace the `ci-run-…` expressions with `ubuntu-22.04`.
Existing jobs can finish normally. Do not stop the shared controller to roll
back this repository, because it also serves other repositories.
