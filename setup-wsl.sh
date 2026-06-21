#!/usr/bin/env bash
# setup-wsl.sh — Universo MIL: setup de desenvolvimento em Ubuntu/WSL
set -euo pipefail

BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
step() { echo -e "\n${BOLD}━━ $* ${NC}"; }
die()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

step "Universo MIL — Setup Ubuntu/WSL"

# ── 1. Node.js 20 via nvm ──────────────────────────────────────────
step "Node.js 20 (nvm)"
export NVM_DIR="$HOME/.nvm"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  info "Instalando nvm..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

if ! node --version 2>/dev/null | grep -q "^v20"; then
  info "Instalando Node.js 20..."
  nvm install 20
  nvm alias default 20
fi
nvm use 20
info "Node $(node -v) / npm $(npm -v)"

# ── 2. Docker ─────────────────────────────────────────────────────
step "Docker"
if ! command -v docker &>/dev/null; then
  warn "Instalando Docker..."
  sudo apt-get update -qq
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker "$USER"
  warn "Docker instalado. Execute 'newgrp docker' ou faça logout/login para usar sem sudo."
else
  info "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
fi

# Iniciar serviço Docker (necessário no WSL)
if ! docker info &>/dev/null 2>&1; then
  warn "Iniciando serviço Docker..."
  sudo service docker start
  sleep 3
fi

# ── 3. Containers: PostgreSQL + MailHog ───────────────────────────
step "PostgreSQL + MailHog (Docker)"

PG_CONTAINER="unimil-postgres"
MH_CONTAINER="unimil-mailhog"

if ! docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^${PG_CONTAINER}$"; then
  info "Criando container PostgreSQL..."
  docker run -d \
    --name "$PG_CONTAINER" \
    -e POSTGRES_DB=unimil \
    -e POSTGRES_USER=unimil \
    -e POSTGRES_PASSWORD=unimil_dev \
    -p 5432:5432 \
    --restart unless-stopped \
    postgres:16-alpine
  info "Aguardando PostgreSQL iniciar..."
  for i in {1..20}; do
    if docker exec "$PG_CONTAINER" pg_isready -U unimil &>/dev/null; then break; fi
    sleep 2
  done
else
  docker start "$PG_CONTAINER" 2>/dev/null || true
  info "Container PostgreSQL existente — iniciado."
fi

if ! docker ps -a --format '{{.Names}}' 2>/dev/null | grep -q "^${MH_CONTAINER}$"; then
  info "Criando container MailHog..."
  docker run -d \
    --name "$MH_CONTAINER" \
    -p 1025:1025 \
    -p 8025:8025 \
    --restart unless-stopped \
    mailhog/mailhog
else
  docker start "$MH_CONTAINER" 2>/dev/null || true
  info "Container MailHog existente — iniciado."
fi

# ── 4. .env.local ─────────────────────────────────────────────────
step ".env.local"
ENV_FILE="$SCRIPT_DIR/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  info "Gerando .env.local..."
  AUTH_SECRET=$(openssl rand -base64 32)
  JWT_SECRET=$(openssl rand -base64 32)
  cat > "$ENV_FILE" <<ENVEOF
DATABASE_URL="postgresql://unimil:unimil_dev@localhost:5432/unimil?schema=public"
AUTH_SECRET="${AUTH_SECRET}"
AUTH_URL="http://localhost:3000"
JWT_SECRET="${JWT_SECRET}"
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@universidademil.com.br"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENVEOF
  info ".env.local criado com secrets gerados automaticamente"
else
  info ".env.local já existe — mantido"
fi

# ── 5. Dependências npm ───────────────────────────────────────────
step "npm install"
npm install
info "Dependências instaladas"

# ── 6. Prisma: generate + migrate + seed ─────────────────────────
step "Prisma"
npx prisma generate
info "Cliente Prisma gerado"

npx prisma migrate deploy
info "Migrações aplicadas"

if npx prisma db seed 2>/dev/null; then
  info "Seed executado"
else
  warn "Seed já executado ou falhou — verifique manualmente se necessário"
fi

# ── 7. Resumo ─────────────────────────────────────────────────────
step "Setup concluído!"
echo ""
echo -e "  ${BOLD}Para iniciar o servidor de desenvolvimento:${NC}"
echo -e "  ${GREEN}npm run dev${NC}"
echo ""
echo -e "  ${BOLD}Acesso:${NC}"
echo -e "  Plataforma  : http://localhost:3000"
echo -e "  MailHog     : http://localhost:8025"
echo ""
echo -e "  ${BOLD}Banco de dados:${NC}"
echo -e "  Host: localhost:5432"
echo -e "  DB:   unimil  |  Usuário: unimil  |  Senha: unimil_dev"
echo ""
