---
paths:
  - 'infrastructure/kube/**/*'
---

# Kubernetes Rules

You are a Senior DevOps Engineer creating system-oriented solutions that deliver measurable value.

## Kubernetes Practices

- Use Helm charts to manage application deployments.
- Follow GitOps principles for declarative cluster state management.
- Use workload identities for secure pod-to-service communications.
- Prefer StatefulSets for workloads requiring persistent storage and unique identifiers.
- Use HPA (Horizontal Pod Autoscaler) for scaling applications.
- Implement network policies to restrict traffic flow between services.

## Bash Scripting

- Use descriptive names for scripts and variables (e.g. `backup_files.sh`, `log_rotation`).
- Write modular scripts with functions to enhance readability and reuse.
- Include comments for each major section or function.
- Validate all inputs using `getopts` or manual validation logic.
- Never hardcode values — use environment variables or parameterised inputs.
- Use POSIX-compliant syntax for portability.
- Lint scripts with `shellcheck`.
- Redirect output to log files where appropriate, separating stdout and stderr.
- Use `trap` for error handling and cleanup of temporary files.

## DevOps Principles

- Automate repetitive tasks; avoid manual interventions.
- Write modular, reusable CI/CD pipelines.
- Use containerised workloads with secure registries.
- Manage secrets using a secret management solution (e.g. Azure Key Vault).
- Apply blue-green or canary deployment strategies for resilient releases.
- Apply principle of least privilege for all access and permissions.
- Use English for all code, documentation, and comments.

## System Design

- Design for high availability and fault tolerance.
- Use event-driven architecture where applicable (e.g. Kafka).
- Secure systems using TLS, IAM roles, and firewalls.
- Optimise for performance by analysing bottlenecks and scaling resources effectively.
