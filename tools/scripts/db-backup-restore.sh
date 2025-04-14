#!/bin/bash

# Default values
BACKUP_FILE="journeys_backup.dump"
DB_NAME="journeys"
DB_HOST="host.docker.internal"
DEST_HOST="host.docker.internal"
DB_PORT="5432"
DB_USER="postgres"
DEST_USER="postgres"                  
DEST_PORT="5432"
DB_PASSWORD=""
DEST_PASSWORD=""

# Help function
show_help() {
    echo "Usage: $0 [options] <backup|restore>"
    echo "Options:"
    echo "  -h, --host          Source database host (default: host.docker.internal)"
    echo "  --dest-host         Destination database host (default: host.docker.internal)"
    echo "  -p, --port          Source database port (default: 5049)"
    echo "  -d, --dest-port     Destination port for restore (default: 5050)"
    echo "  -u, --user          Source database user (default: root)"
    echo "  --dest-user         Destination database user (default: root)"
    echo "  -f, --file          Backup file path (default: journeys_backup.dump)"
    echo "  --password          Source database password"
    echo "  --dest-password     Destination database password"
    echo "  --help              Show this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        --dest-host)
            DEST_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -d|--dest-port)
            DEST_PORT="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        --dest-user)
            DEST_USER="$2"
            shift 2
            ;;
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --password)
            DB_PASSWORD="$2"
            shift 2
            ;;
        --dest-password)
            DEST_PASSWORD="$2"
            shift 2
            ;;
        --help)
            show_help
            ;;
        backup|restore)
            COMMAND="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            ;;
    esac
done

# Check if command is provided
if [ -z "$COMMAND" ]; then
    echo "Error: You must specify either 'backup' or 'restore'"
    show_help
fi

# Function to perform backup
do_backup() {
    echo "Creating backup of $DB_NAME database..."
    echo "Source: $DB_USER@$DB_HOST:$DB_PORT"
    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -F c \
        -b \
        -v \
        -f "$BACKUP_FILE" \
        "$DB_NAME"
    
    if [ $? -eq 0 ]; then
        echo "Backup completed successfully: $BACKUP_FILE"
    else
        echo "Backup failed!"
        exit 1
    fi
}

# Function to perform restore
do_restore() {
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: Backup file $BACKUP_FILE does not exist!"
        exit 1
    fi

    echo "Restoring $DB_NAME database..."
    echo "Destination: $DEST_USER@$DEST_HOST:$DEST_PORT"
    
    # If no destination password is provided, use source password
    local RESTORE_PASSWORD="${DEST_PASSWORD:-$DB_PASSWORD}"
    
    # Drop existing connections
    PGPASSWORD="${RESTORE_PASSWORD}" psql \
        -h "$DEST_HOST" \
        -p "$DEST_PORT" \
        -U "$DEST_USER" \
        -d "postgres" \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

    # Drop and recreate the database
    PGPASSWORD="${RESTORE_PASSWORD}" dropdb \
        -h "$DEST_HOST" \
        -p "$DEST_PORT" \
        -U "$DEST_USER" \
        --if-exists \
        "$DB_NAME"

    PGPASSWORD="${RESTORE_PASSWORD}" createdb \
        -h "$DEST_HOST" \
        -p "$DEST_PORT" \
        -U "$DEST_USER" \
        "$DB_NAME"

    # Restore the backup
    PGPASSWORD="${RESTORE_PASSWORD}" pg_restore \
        -h "$DEST_HOST" \
        -p "$DEST_PORT" \
        -U "$DEST_USER" \
        -d "$DB_NAME" \
        -v \
        "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        echo "Restore completed successfully!"
    else
        echo "Restore completed with some warnings or errors."
        exit 1
    fi
}

# Execute the requested command
case "$COMMAND" in
    backup)
        do_backup
        ;;
    restore)
        do_restore
        ;;
esac 