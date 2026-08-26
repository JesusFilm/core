# Load Test (chat load-generation tooling)

The engineer-run k6 load generator (`tools/load-test`): drives controlled request load at the Journeys chat endpoint to exercise the Vercel Firewall rate-limit rule, with load profiles declared as Scenarios and each Run's evidence committed as a Result. Owns no product entities.

## Language

**Scenario**:
A named YAML load profile (rate, duration, virtual users, message) that fully defines a run. The bundled set spans a ladder of intent: smoke check, sustained single client, concurrent clients, firewall trip.
_Avoid_: config, test case

**Target**:
The endpoint-specific k6 entry defining payload and headers for one API (today only chat). Scenarios choose load shape; Targets choose what is being hit.
_Avoid_: endpoint script

**Run**:
One execution of a Scenario, tagged with a run id that names both the traffic (User-Agent) and the Result file.
_Avoid_: test, session

**Result**:
The per-Run JSON summary committed to the repo as evidence, pruned manually.
_Avoid_: log, output file

**Virtual User (VU)**:
A concurrent k6 client within a Run. All VUs share the machine's single source IP, so VUs simulate concurrency and per-conversation trace shape — never "more IPs" against the firewall. Each VU gets a distinct `sessionId` so traces split per VU in Langfuse.
_Avoid_: user, client (ambiguous with real audience)

**Firewall Trip**:
Deliberately exceeding the Vercel Firewall's per-IP rate limit to observe 429s. Only ever done against stage — production would block the runner's IP until the window expires.
_Avoid_: stress test, DDoS test
