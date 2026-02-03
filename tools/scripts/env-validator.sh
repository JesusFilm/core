#!/bin/bash

# Store the command to run (last argument)
command_to_run=""
validation_failed=0
override=0

# Process all arguments except the last one
for arg in "$@"; do
    if [ "$arg" = "${@: -1}" ]; then
        command_to_run="$arg"
        continue
    fi

    # Check for override flag
    if [ "$arg" = "--override" ]; then
        override=1
        continue
    fi

    if [[ "$arg" != --*=* ]]; then
        echo "Invalid argument format: $arg" >&2
        exit 1
    fi

    name="${arg#--}"
    name="${name%%=*}"
    value="${arg#*=}"

    # Get the environment variable value
    env_value="${!name}"

    # Compare values (allow Codex host DB override when requested)
    if [ "$env_value" != "$value" ]; then
        if [ "${CODEX_HOST_DB:-}" = "1" ] && [[ "$value" == *"@db:"* ]]; then
            alt_value="${value/@db:/@localhost:}"
            alt_loopback="${value/@db:/@127.0.0.1:}"
            if [ "$env_value" = "$alt_value" ] || [ "$env_value" = "$alt_loopback" ]; then
                continue
            fi
        fi
        echo "Warning: Environment variable $name does not match expected value" >&2
        echo "Expected: $value" >&2
        echo "Actual: $env_value" >&2
        validation_failed=1
    fi
done

# Exit if any validation failed and override is not set
if [ $validation_failed -eq 1 ] && [ $override -eq 0 ]; then
    echo "Validation failed. Use --override to run the command anyway." >&2
    exit 1
fi

# If validation failed but override is set, show warning
if [ $validation_failed -eq 1 ] && [ $override -eq 1 ]; then
    echo "Warning: Running command despite environment validation failures due to --override flag" >&2
fi

# If we get here, all validations passed or override is set - execute the command
if [ -n "$command_to_run" ]; then
    eval "$command_to_run"
else
    echo "Error: No command provided to execute" >&2
    exit 1
fi 
