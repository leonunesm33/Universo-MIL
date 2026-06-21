#!/usr/bin/env bash
# setup-wsl.sh — Universidade MIL: setup completo em Ubuntu/WSL
set -euo pipefail

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
step()  { echo -e "\n${BOLD}━━ $* ${NC}"; }
die()   { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

step "Universidade MIL — Setup Ubuntu/WSL"

# ── 1. Node.js via nvm ─────────────────────────────────────────────
step "Node.js 20 (nvm)"
if ! command -v nvm &>/dev/null && [ ! -s "$HOME/.nvm/nvm.sh" ]; then
  info "Instalando nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v node &>/dev/null || [[ "$(node -v)" != v20* ]]; then
  info "Instalando Node.js 20..."
  nvm install 20
  nvm use 20
  nvm alias default 20
fi
info "Node $(node -v) / npm $(npm -v)"

# ── 2. Docker (para PostgreSQL + MailHog) ─────────────────────────
step "Docker"
if ! command -v docker &>/dev/null; then
  warn "Docker não encontrado. Instalando..."
  sudo apt-get update -qq
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker "$USER"
  warn "Docker instalado. Pode ser necessário fazer logout/login para usar sem sudo."
else
  info "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
fi

# ── 3. Subir PostgreSQL + MailHog via Docker ─────────────────────
step "PostgreSQL + MailHog (Docker)"

PG_CONTAINER="unimil-postgres"
MH_CONTAINER="unimil-mailhog"

if ! docker ps -a --format '{{.Names}}' | grep -q "^${PG_CONTAINER}$"; then
  info "Criando container PostgreSQL..."
  docker run -d \
    --name "$PG_CONTAINER" \
    -e POSTGRES_DB=learn_platform \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    --restart unless-stopped \
    postgres:16-alpine
  info "Aguardando PostgreSQL iniciar..."
  sleep 5
else
  docker start "$PG_CONTAINER" 2>/dev/null || true
  info "Container PostgreSQL já existe — iniciado."
fi

if ! docker ps -a --format '{{.Names}}' | grep -q "^${MH_CONTAINER}$"; then
  info "Criando container MailHog..."
  docker run -d \
    --name "$MH_CONTAINER" \
    -p 1025:1025 \
    -p 8025:8025 \
    --restart unless-stopped \
    mailhog/mailhog
else
  docker start "$MH_CONTAINER" 2>/dev/null || true
  info "Container MailHog já existe — iniciado."
fi

# ── 4. .env.local ─────────────────────────────────────────────────
step ".env.local"
ENV_FILE="$(dirname "$0")/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  info "Criando .env.local..."
  cat > "$ENV_FILE" <<'ENVEOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learn_platform?schema=public"
AUTH_SECRET="H1olIOOVpibvI+gXVzBKnmOxMPqg0cqCtAB8xBFhPZk="
AUTH_URL="http://localhost:3000"
JWT_SECRET="QZNk9m8p3vXaYwTdR7sF1cHjLuE4iGbO6nPe2MhV0yU="
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@universidademil.com.br"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENVEOF
  info ".env.local criado"
else
  info ".env.local já existe — mantido"
fi

# ── 5. Dependências npm ───────────────────────────────────────────
step "npm install"
cd "$(dirname "$0")"
npm install
info "Dependências instaladas"

# ── 6. Prisma migrate + seed ──────────────────────────────────────
step "Prisma: migrate + seed"
info "Aguardando banco ficar pronto..."
for i in {1..15}; do
  if npx prisma db execute --stdin <<< "SELECT 1;" &>/dev/null; then
    break
  fi
  sleep 2
done

npx prisma migrate deploy
info "Migrações aplicadas"

npx prisma db seed
info "Seed executado"

# ── 7. Resumo ─────────────────────────────────────────────────────
step "Tudo pronto!"
echo ""
echo -e "  ${BOLD}Para iniciar o servidor:${NC}"
echo -e "  ${GREEN}npm run dev${NC}"
echo ""
echo -e "  ${BOLD}Acesso:${NC}"
echo -e "  Plataforma : http://localhost:3000"
echo -e "  MailHog    : http://localhost:8025"
echo ""
echo -e "  ${BOLD}Credenciais:${NC}"
echo -e "  Admin : admin@plataforma.com  /  admin123"
echo -e "  Aluna : teste@plataforma.com  /  teste123"
echo ""
