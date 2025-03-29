#!/bin/bash

# Function to extract name and value from argument
parse_arg() {
    local arg=$1
    if [[ $arg =~ ^--([^=]+)=(.*)$ ]]; then
        name="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        declare -a result=("$name" "$value")
        printf '%s\n' "${result[@]}"
    else
        echo "Invalid argument format: $arg" >&2
        exit 1
    fi
}

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

    # Parse the argument into array
    readarray -t parsed < <(parse_arg "$arg")
    if [ $? -ne 0 ]; then
        exit 1
    fi

    name="${parsed[0]}"
    value="${parsed[1]}"

    # Get the environment variable value
    env_value="${!name}"

    # Compare values
    if [ "$env_value" != "$value" ]; then
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