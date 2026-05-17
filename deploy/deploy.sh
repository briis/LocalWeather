#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/localweather
REPO_URL="https://github.com/briis/LocalWeather"

# GitHub no longer accepts passwords. Pass a Personal Access Token instead:
#   GITHUB_TOKEN=ghp_xxx bash deploy.sh
if [ -n "${GITHUB_TOKEN:-}" ]; then
    CLONE_URL="https://${GITHUB_TOKEN}@github.com/briis/LocalWeather"
else
    CLONE_URL="$REPO_URL"
fi

echo "==> Installing system packages"
apt-get update -qq
apt-get install -y python3 python3-pip python3-venv nginx git
apt-get autoremove -y

echo "==> Creating service user"
id -u localweather &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin localweather

echo "==> Setting up app directory"
mkdir -p "$APP_DIR"
mkdir -p /var/log/localweather

if [ -n "$REPO_URL" ]; then
    echo "==> Cloning repository"
    if [ -d "$APP_DIR/.git" ]; then
        git -C "$APP_DIR" pull
    else
        git clone "$CLONE_URL" "$APP_DIR"
    fi
else
    echo "==> Copying files from current directory"
    rsync -a \
        --exclude='.git' \
        --exclude='.devcontainer' \
        --exclude='.dockerignore' \
        --exclude='.DS_Store' \
        --exclude='.ruff.toml' \
        --exclude='.ruff_cache' \
        --exclude='.venv' \
        --exclude='__pycache__' \
        --exclude='deploy' \
        --exclude='docker-compose.yml' \
        --exclude='Dockerfile' \
        --exclude='Docs' \
        --exclude='LocalWeather.code-workspace' \
        --exclude='scripts' \
        "$(dirname "$0")/../" "$APP_DIR/"
fi

echo "==> Removing dev-only files"
rm -rf \
    "$APP_DIR/.devcontainer" \
    "$APP_DIR/.dockerignore" \
    "$APP_DIR/.DS_Store" \
    "$APP_DIR/.ruff.toml" \
    "$APP_DIR/.ruff_cache" \
    "$APP_DIR/deploy" \
    "$APP_DIR/docker-compose.yml" \
    "$APP_DIR/Dockerfile" \
    "$APP_DIR/Docs" \
    "$APP_DIR/LocalWeather.code-workspace" \
    "$APP_DIR/scripts" \
    "$APP_DIR/__pycache__"

echo "==> Checking weather images"
IMAGE_DIR="$APP_DIR/static/images"
if [ ! -d "$IMAGE_DIR" ] || [ -z "$(ls -A "$IMAGE_DIR" 2>/dev/null)" ]; then
    echo "    Images missing — restoring from repository"
    git -C "$APP_DIR" checkout HEAD -- static/images/
else
    echo "    Images already present, skipping"
fi

echo "==> Setting up .env"
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "    Created .env from .env.example — edit $APP_DIR/.env to set your credentials"
else
    echo "    .env already exists, skipping"
fi

echo "==> Creating Python virtual environment"
python3 -m venv "$APP_DIR/.venv"
"$APP_DIR/.venv/bin/pip" install --quiet --upgrade pip
"$APP_DIR/.venv/bin/pip" install --quiet -r "$APP_DIR/requirements.txt" gunicorn

echo "==> Setting ownership"
chown -R localweather:localweather "$APP_DIR"
chown -R localweather:localweather /var/log/localweather

echo "==> Installing systemd service"
cp "$(dirname "$0")/localweather.service" /etc/systemd/system/localweather.service
systemctl daemon-reload
systemctl enable localweather
systemctl restart localweather

echo "==> Configuring nginx"
cp "$(dirname "$0")/localweather.nginx" /etc/nginx/sites-available/localweather
ln -sf /etc/nginx/sites-available/localweather /etc/nginx/sites-enabled/localweather
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo ""
echo "==> Done. App is running at http://$(hostname -I | awk '{print $1}')"
