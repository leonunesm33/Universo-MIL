# Deploy — Servidor Ubuntu (POC)

Guia passo a passo para subir o Universo MIL em um servidor Ubuntu 22.04/24.04 LTS.

## Pré-requisitos

- Servidor Ubuntu 22.04+ com acesso SSH e usuário sudo
- Portas abertas: 80, 443, 3000 (ou apenas 80/443 com proxy reverso)
- Domínio ou IP público apontando para o servidor (opcional para POC)

---

## 1. Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip
```

---

## 2. Instalar Docker e Docker Compose

```bash
# Adicionar repositório oficial Docker
curl -fsSL https://get.docker.com | sudo bash

# Adicionar usuário ao grupo docker (sem sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker compose version
```

---

## 3. Instalar o GitHub CLI (opcional, para clonar repo privado)

```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list
sudo apt update && sudo apt install gh -y

# Autenticar (apenas se repo privado)
gh auth login
```

---

## 4. Clonar o repositório

```bash
cd /opt
sudo git clone https://github.com/leonunesm33/Universo-MIL.git universo-mil
sudo chown -R $USER:$USER /opt/universo-mil
cd /opt/universo-mil
```

---

## 5. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha os valores obrigatórios:

```env
# Banco de dados (deve coincidir com docker-compose.yml)
DATABASE_URL="postgresql://unimil:SUA_SENHA_FORTE@db:5432/unimil?schema=public"
DB_PASSWORD="SUA_SENHA_FORTE"

# Auth (gere com: openssl rand -base64 32)
AUTH_SECRET="COLE_AQUI_O_SECRET_GERADO"
AUTH_URL="http://SEU_IP_OU_DOMINIO:3000"
JWT_SECRET="COLE_AQUI_O_JWT_SECRET"

# E-mail (use MailHog para POC ou configure SMTP real)
SMTP_HOST="mailhog"
SMTP_PORT="1025"
SMTP_SECURE="false"
SMTP_FROM="noreply@universidademil.com.br"

# URL pública
NEXT_PUBLIC_APP_URL="http://SEU_IP_OU_DOMINIO:3000"
```

Para gerar secrets seguros:
```bash
openssl rand -base64 32   # rode duas vezes: uma para AUTH_SECRET, outra para JWT_SECRET
```

---

## 6. Criar diretório de uploads

```bash
mkdir -p public/uploads
```

---

## 7. Build e subir os serviços

```bash
# Build e iniciar em background
docker compose up -d --build

# Acompanhar logs
docker compose logs -f app
```

A primeira vez pode demorar 3–5 minutos (build da imagem Node.js).

Ao final, você verá:
```
app | ✓ Ready in Xms
```

---

## 8. Verificar se está funcionando

```bash
# Status dos containers
docker compose ps

# Teste rápido
curl -I http://localhost:3000
```

Acesse no navegador: `http://SEU_IP:3000`

---

## 9. Criar usuário administrador

Com a aplicação rodando, execute o seed para criar o admin inicial:

```bash
docker compose exec app npx prisma db seed
```

Credenciais padrão do seed (verifique em `prisma/seed.ts`):
- Email: `admin@universiomil.com.br`
- Senha: definida no seed

> Altere a senha pelo painel após o primeiro login.

---

## 10. Configurar reinício automático

```bash
# Configurar restart automático dos containers
docker compose down
# Edite docker-compose.yml e adicione restart: unless-stopped em cada serviço
# Ou use:
docker update --restart=unless-stopped universo-mil-app-1
docker update --restart=unless-stopped universo-mil-db-1
```

Alternativa: criar serviço systemd:

```bash
sudo tee /etc/systemd/system/universo-mil.service > /dev/null <<EOF
[Unit]
Description=Universo MIL Platform
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/universo-mil
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable universo-mil
sudo systemctl start universo-mil
```

---

## 11. Proxy reverso com Nginx (produção)

Para expor na porta 80/443 com HTTPS:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

sudo tee /etc/nginx/sites-available/universo-mil > /dev/null <<EOF
server {
    listen 80;
    server_name SEU_DOMINIO;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/universo-mil /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# HTTPS com Let's Encrypt (opcional, requer domínio real)
sudo certbot --nginx -d SEU_DOMINIO
```

---

## 12. Atualizar a aplicação

```bash
cd /opt/universo-mil

# Puxar atualizações
git pull

# Rebuild e reiniciar
docker compose up -d --build

# Rodar migrations novas (se houver)
docker compose exec app npx prisma migrate deploy
```

---

## Monitoramento

```bash
# Logs em tempo real
docker compose logs -f app

# Status dos containers
docker compose ps

# Uso de recursos
docker stats

# Verificar banco de dados
docker compose exec db psql -U unimil -d unimil -c "\dt"
```

---

## Backup do banco de dados

```bash
# Dump
docker compose exec db pg_dump -U unimil unimil > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U unimil unimil < backup_YYYYMMDD.sql
```

---

## Solução de Problemas

### Container `app` não sobe

```bash
docker compose logs app
```

Causas comuns:
- `DATABASE_URL` incorreta
- Banco ainda inicializando (aguardar healthcheck)
- Falta de memória (mínimo recomendado: 2GB RAM)

### Erro de migrations

```bash
docker compose exec app npx prisma migrate status
docker compose exec app npx prisma migrate deploy
```

### Porta 3000 já em uso

```bash
sudo lsof -i :3000
# Encerrar o processo e tentar novamente
```

### Resetar tudo (cuidado: apaga os dados)

```bash
docker compose down -v    # -v remove os volumes (banco de dados)
docker compose up -d --build
```
