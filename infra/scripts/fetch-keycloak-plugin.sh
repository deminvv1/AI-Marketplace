#!/usr/bin/env bash
# Плагин русских провайдеров для Keycloak: Яндекс, VK, Mail.ru, Одноклассники.
# Без него Keycloak умеет только западные входы.
set -euo pipefail

VERSION="${1:-26.0.0}"
DEST="$(dirname "$0")/../keycloak/providers"
mkdir -p "$DEST"

URL="https://github.com/playa-ru/keycloak-russian-providers/releases/download/${VERSION}/keycloak-russian-providers-${VERSION}.jar"

echo "Скачиваю плагин ${VERSION}…"
curl -fL "$URL" -o "$DEST/keycloak-russian-providers.jar"
echo "Готово: $DEST/keycloak-russian-providers.jar"
echo
echo "Дальше: пересобрать образ Keycloak, иначе плагин не подхватится —"
echo "  docker compose exec keycloak /opt/keycloak/bin/kc.sh build"
echo "  docker compose restart keycloak"
