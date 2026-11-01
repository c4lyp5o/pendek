#!/bin/sh
# Apply versioned Prisma migrations, then start the server.
#
# One-time baseline for databases created with the old `prisma db push`
# (tables exist but there is no migration history -> P3005): sync the schema
# with a non-destructive db push (it refuses data loss), mark 0_init as
# applied, then continue with normal `migrate deploy`.
set -e
SCHEMA=prisma/schema.prisma

if ! out=$(bunx prisma migrate deploy --schema "$SCHEMA" 2>&1); then
	echo "$out"
	if echo "$out" | grep -q "P3005"; then
		echo "[entrypoint] existing schema without migration history; baselining 0_init"
		bunx prisma db push --schema "$SCHEMA" --skip-generate
		bunx prisma migrate resolve --schema "$SCHEMA" --applied 0_init
		bunx prisma migrate deploy --schema "$SCHEMA"
	else
		exit 1
	fi
else
	echo "$out"
fi

exec bun index.js
