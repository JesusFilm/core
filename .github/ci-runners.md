# CI runners

Every `JesusFilm/core` workflow job requests `jfp-proxmox-core`. The JesusFilm organization has two shared scale sets: `jfp-shared-jfp00` and `jfp-shared-jfp01`. They also advertise `jfp-proxmox-private`, so JesusFilm jobs draw from the same capacity on each host. There is no per-author or per-event runner selection.

JFP00 has five shared slots and JFP01 has ten. Each shared job runs in a disposable Ubuntu guest with 8 vCPUs, 24 GiB RAM and a 120 GiB disk. GitHub assigns jobs to the host sets; a job already running on a failed host needs a retry. Guests can reach the public internet but cannot reach the hosts, private networks or peer guests.

If a job waits, check the requested label in GitHub Actions and the `ci-scaleset-canary.service` readiness on both hosts (`http://127.0.0.1:9189/readyz`). Inspect service journals and available host memory/storage before changing the pool. The [runner operating guide](https://github.com/JesusFilm/tandem-network/blob/main/infrastructure/ci-scaleset-canary/README.md) contains the host inventory and recovery procedure.
