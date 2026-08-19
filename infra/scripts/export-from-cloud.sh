#!/usr/bin/env bash
# Выгрузка из Supabase Cloud перед переездом.
#
# Три файла, потому что порядок восстановления важен: сначала роли, потом
# структура, потом данные. Иначе таблицы лягут с чужим владельцем.
#
# Строку подключения взять в панели Supabase: Project Settings → Database →
# Connection string → URI (режим Session, порт 5432).
set -euo pipefail

: "${SOURCE_DB_URL:?Задайте SOURCE_DB_URL — строку подключения к облачной базе}"
OUT="${1:-./dump-$(date +%Y%m%d-%H%M)}"
mkdir -p "$OUT"

echo "→ роли"
pg_dumpall --database="$SOURCE_DB_URL" --roles-only --no-role-passwords > "$OUT/roles.sql"

echo "→ структура (включая схему auth — там живут учётные записи)"
pg_dump --dbname="$SOURCE_DB_URL" --schema-only --quote-all-identifiers \
        --schema='public' --schema='auth' --schema='storage' > "$OUT/schema.sql"

echo "→ данные"
pg_dump --dbname="$SOURCE_DB_URL" --data-only --quote-all-identifiers \
        --schema='public' --schema='auth' --schema='storage' > "$OUT/data.sql"

echo
echo "Готово: $OUT"
du -h "$OUT"/*.sql
echo
echo "ВАЖНО: в этих файлах персональные данные и хеши паролей."
echo "Не класть в git, после переноса удалить."
