---
paths:
  - "infrastructure/**/*.tf"
  - "infrastructure/**/*.tfvars"
  - "infrastructure/**/*.hcl"
---

# Infrastructure Rules (Terraform / AWS)

## Principles

- Write concise, well-structured Terraform code.
- Organize resources into reusable modules; avoid duplication.
- Never hardcode values — always use variables for flexibility.
- Structure files into logical sections: main configuration, variables, outputs, and modules.

## Terraform Best Practices

- Use remote backends (e.g. S3) for state management with state locking and encryption enabled.
- Use workspaces for environment separation (dev, staging, prod).
- Organize resources by service or application domain (e.g. networking, compute).
- Always run `terraform fmt` and `terraform validate` before committing.
- Lint with `tflint` or `terrascan` to catch errors early.
- Store secrets in AWS Secrets Manager or Vault — never hardcode them.
- Lock all provider versions to avoid breaking changes.
- Tag all resources for tracking and cost management.

## Error Handling & Validation

- Use variable validation rules to prevent invalid inputs.
- Handle optional configs using conditional expressions and `null` checks.
- Use `depends_on` explicitly when resource ordering matters.

## Module Guidelines

- Split code into reusable modules.
- Use module outputs to pass information between configurations.
- Version control modules using semantic versioning.
- Document each module with a README defining inputs and outputs.

## Security

- Never hardcode passwords, API keys, or sensitive values.
- Enable encryption for all storage and communication resources (e.g. S3 buckets).
- Define access controls and security groups for each resource.

## CI/CD Integration

- Run `terraform plan` in CI pipelines before applying changes.
- Use `terratest` for unit testing Terraform modules.
- Automate critical infrastructure path tests (network connectivity, IAM policies).
