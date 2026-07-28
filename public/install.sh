#!/usr/bin/env bash
#
# Jexpanel (Jexactyl) automated installer
# https://docs.jexpanel.com/docs/category/install---from-scratch
#
# Supports a from-scratch install of the latest Jexpanel release on
# Ubuntu (>=23.x recommended) and Debian (>=11 recommended).
#
# Usage: sudo bash install-jexpanel.sh

set -Eeuo pipefail

# ---------------------------------------------------------------------------
# Globals
# ---------------------------------------------------------------------------
LOG_FILE="/var/log/jexpanel-install.log"
CRED_FILE="/root/jexpanel-credentials.txt"
PANEL_DIR="/var/www/jexactyl"
DB_NAME="panel"
DB_USER="jexpanel"
PHP_VERSION="8.4"
RELEASE_URL="https://github.com/Jexactyl/Jexactyl/releases/latest/download/panel.tar.gz"

CURRENT_STEP=0
TOTAL_STEPS=0

if [[ -t 1 ]]; then
    RED=$'\e[31m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'; BLUE=$'\e[34m'; BOLD=$'\e[1m'; RESET=$'\e[0m'
else
    RED=""; GREEN=""; YELLOW=""; BLUE=""; BOLD=""; RESET=""
fi

# ---------------------------------------------------------------------------
# Basic logging / messaging helpers
# ---------------------------------------------------------------------------
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >>"$LOG_FILE"; }
# These all write to stderr, never stdout: several are called from inside
# ask_*() helpers whose stdout is captured via $(...) as the return value
# (e.g. ADMIN_PASSWORD=$(ask_secret ...)) — anything those helpers print to
# stdout would get silently prepended/appended into the captured value.
msg()  { echo "${BOLD}$*${RESET}" >&2; }
ok()   { echo "${GREEN}✓${RESET} $*" >&2; }
warn() { echo "${YELLOW}⚠ $*${RESET}" >&2; }
err()  { echo "${RED}✗ $*${RESET}" >&2; }

on_error() {
    local line="$1" cmd="$2"
    echo
    err "Installation failed at line $line while running: $cmd"
    err "Full log available at: $LOG_FILE"
    exit 1
}
trap 'on_error "$LINENO" "$BASH_COMMAND"' ERR

# Run a command with a description; on failure, print a clear error and stop.
# Note: the "cmd || rc=$?" form is deliberate — it keeps the failing command out
# of a bare statement position so `set -e` doesn't kill the shell before we get
# a chance to report the real exit code and log location.
run() {
    local desc="$1"; shift
    local rc=0
    log "RUN: $* "
    "$@" >>"$LOG_FILE" 2>&1 || rc=$?
    if [[ $rc -ne 0 ]]; then
        echo
        err "Failed: $desc"
        err "Command: $*"
        err "Exit code: $rc — last 40 log lines follow:"
        tail -n 40 "$LOG_FILE" || true
        err "Full log: $LOG_FILE"
        exit "$rc"
    fi
}

# Same as run(), but executes a raw shell string (supports pipes/redirects/heredocs).
run_sh() {
    local desc="$1" cmd="$2"
    local safe_cmd rc=0
    safe_cmd=$(printf '%s' "$cmd" | sed -E "s/(--password=|IDENTIFIED BY )'[^']*'/\1'***REDACTED***'/g")
    log "RUN_SH: $safe_cmd"
    bash -c "$cmd" >>"$LOG_FILE" 2>&1 || rc=$?
    if [[ $rc -ne 0 ]]; then
        echo
        err "Failed: $desc"
        err "Exit code: $rc — last 40 log lines follow:"
        tail -n 40 "$LOG_FILE" || true
        err "Full log: $LOG_FILE"
        exit "$rc"
    fi
}

render_progress() {
    local pct=$(( (CURRENT_STEP - 1) * 100 / TOTAL_STEPS ))
    local width=30
    local filled=$(( pct * width / 100 ))
    local empty=$(( width - filled ))
    local bar
    bar="$(printf '%*s' "$filled" '' | tr ' ' '#')$(printf '%*s' "$empty" '')"
    printf '\n%s[%s] %3d%%%s Step %d/%d: %s\n' "$BLUE" "$bar" "$pct" "$RESET" "$CURRENT_STEP" "$TOTAL_STEPS" "$1"
}

step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    render_progress "$1"
    log "==== STEP $CURRENT_STEP/$TOTAL_STEPS: $1 ===="
}

wait_for_apt() {
    command -v fuser >/dev/null 2>&1 || return 0
    local tries=0
    while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || fuser /var/lib/apt/lists/lock >/dev/null 2>&1; do
        tries=$((tries + 1))
        if [[ $tries -gt 30 ]]; then
            err "Timed out waiting for another apt/dpkg process to release its lock."
            exit 1
        fi
        warn "Another process is using apt/dpkg, waiting ($tries/30)..."
        sleep 5
    done
}

# ---------------------------------------------------------------------------
# Input helpers
# ---------------------------------------------------------------------------
ask() {
    local prompt="$1" default="${2:-}" var
    if [[ -n "$default" ]]; then
        read -r -p "$prompt [$default]: " var
        echo "${var:-$default}"
    else
        read -r -p "$prompt: " var
        echo "$var"
    fi
}

ask_required() {
    local prompt="$1" var=""
    while [[ -z "$var" ]]; do
        read -r -p "$prompt: " var
        [[ -z "$var" ]] && warn "This value is required."
    done
    echo "$var"
}

ask_secret() {
    local prompt="$1" var=""
    while true; do
        read -r -s -p "$prompt: " var; echo >&2
        if [[ ${#var} -lt 8 ]]; then
            warn "Password must be at least 8 characters."
            continue
        fi
        local confirm=""
        read -r -s -p "Confirm password: " confirm; echo >&2
        if [[ "$var" != "$confirm" ]]; then
            warn "Passwords did not match, try again."
            continue
        fi
        break
    done
    echo "$var"
}

ask_yn() {
    local prompt="$1" default="${2:-y}" var
    local hint="y/N"
    [[ "$default" == "y" ]] && hint="Y/n"
    while true; do
        read -r -p "$prompt [$hint]: " var
        var="${var:-$default}"
        case "$var" in
            [Yy]*) echo "true"; return ;;
            [Nn]*) echo "false"; return ;;
            *) warn "Please answer y or n." ;;
        esac
    done
}

is_valid_email() {
    [[ "$1" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]
}

is_valid_domain() {
    [[ "$1" =~ ^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$ ]]
}

# Restricted to a safe charset on purpose: this value is later embedded in a
# SQL WHERE clause (verify_admin_user) as well as passed to artisan, so keeping
# it free of quotes/backticks/$ avoids any ambiguity there.
is_valid_username() {
    [[ "$1" =~ ^[A-Za-z0-9_.-]{3,32}$ ]]
}

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
preflight() {
    if [[ $EUID -ne 0 ]]; then
        err "This script must be run as root. Try: sudo bash $0"
        exit 1
    fi

    mkdir -p "$(dirname "$LOG_FILE")"
    : >"$LOG_FILE"
    chmod 600 "$LOG_FILE"

    if [[ ! -f /etc/os-release ]]; then
        err "Cannot detect your operating system (/etc/os-release missing). This script only supports Ubuntu and Debian."
        exit 1
    fi
    # shellcheck disable=SC1091
    . /etc/os-release
    OS_ID="${ID:-unknown}"
    OS_VERSION_ID="${VERSION_ID:-0}"
    OS_CODENAME="${VERSION_CODENAME:-}"

    case "$OS_ID" in
        ubuntu)
            if ! dpkg --compare-versions "$OS_VERSION_ID" ge "23.04" 2>/dev/null; then
                warn "Jexpanel docs recommend Ubuntu >=23.x. You are running Ubuntu $OS_VERSION_ID."
                if [[ "$(ask_yn "Continue anyway?" n)" != "true" ]]; then
                    exit 1
                fi
            fi
            ;;
        debian)
            if ! dpkg --compare-versions "$OS_VERSION_ID" ge "11" 2>/dev/null; then
                warn "Jexpanel docs recommend Debian >=11. You are running Debian $OS_VERSION_ID."
                if [[ "$(ask_yn "Continue anyway?" n)" != "true" ]]; then
                    exit 1
                fi
            fi
            ;;
        *)
            err "Unsupported operating system '$OS_ID'. This script only supports Ubuntu and Debian."
            exit 1
            ;;
    esac

    if ! command -v curl >/dev/null 2>&1; then
        run "Installing curl" apt -y install curl
    fi

    if ! curl -fsSL --max-time 8 https://github.com >/dev/null 2>&1; then
        err "No internet connectivity detected (could not reach github.com). Check your network/DNS and try again."
        exit 1
    fi

    if [[ -d "$PANEL_DIR" && -f "$PANEL_DIR/.env" ]]; then
        warn "An existing installation was found at $PANEL_DIR."
        if [[ "$(ask_yn "This looks like an existing Jexpanel install. Continuing may overwrite it. Proceed?" n)" != "true" ]]; then
            msg "Aborting to protect your existing installation."
            exit 1
        fi
    fi

    ok "Pre-flight checks passed (${OS_ID} ${OS_VERSION_ID})."
}

# ---------------------------------------------------------------------------
# Collect user input
# ---------------------------------------------------------------------------
collect_input() {
    msg "== Jexpanel installer — a few questions before we begin =="
    echo "Press Ctrl+C at any time to abort. Nothing is installed until you confirm below."
    echo

    PANEL_FQDN=""
    while [[ -z "$PANEL_FQDN" ]]; do
        PANEL_FQDN=$(ask_required "Domain name or IP address this panel will be reachable at (e.g. panel.example.com)")
        # Strip an accidentally-pasted scheme/path/trailing slash so nginx/certbot get a bare host.
        PANEL_FQDN="${PANEL_FQDN#http://}"
        PANEL_FQDN="${PANEL_FQDN#https://}"
        PANEL_FQDN="${PANEL_FQDN%%/*}"
    done

    USE_SSL="false"
    if is_valid_domain "$PANEL_FQDN"; then
        USE_SSL=$(ask_yn "Enable free SSL via Let's Encrypt for $PANEL_FQDN?" y)
    else
        warn "'$PANEL_FQDN' does not look like a domain name, so Let's Encrypt SSL isn't available for it (an IP address cannot get a public certificate)."
    fi

    if [[ "$USE_SSL" == "true" ]]; then
        APP_URL="https://${PANEL_FQDN}"
    else
        APP_URL="http://${PANEL_FQDN}"
    fi

    echo
    msg "-- Administrator account --"
    ADMIN_EMAIL=""
    while ! is_valid_email "$ADMIN_EMAIL"; do
        ADMIN_EMAIL=$(ask_required "Admin email address")
        is_valid_email "$ADMIN_EMAIL" || warn "That doesn't look like a valid email address."
    done
    ADMIN_USERNAME=""
    while ! is_valid_username "$ADMIN_USERNAME"; do
        ADMIN_USERNAME=$(ask_required "Admin username (letters, numbers, . _ - only, 3-32 chars)")
        is_valid_username "$ADMIN_USERNAME" || warn "Username must be 3-32 characters and only contain letters, numbers, dots, underscores or hyphens."
    done
    ADMIN_PASSWORD=$(ask_secret "Admin password (min 8 characters)")

    echo
    TZ_DEFAULT="$(cat /etc/timezone 2>/dev/null || true)"
    TZ_DEFAULT="${TZ_DEFAULT:-UTC}"
    APP_TIMEZONE=$(ask "Timezone for the panel" "$TZ_DEFAULT")

    DB_PASSWORD="$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 24)"

    echo
    msg "-- Review --"
    echo "  Panel URL:        $APP_URL"
    echo "  SSL enabled:      $USE_SSL"
    echo "  Admin email:      $ADMIN_EMAIL"
    echo "  Admin username:   $ADMIN_USERNAME"
    echo "  Timezone:         $APP_TIMEZONE"
    echo "  Database name:    $DB_NAME (password auto-generated)"
    echo
    if [[ "$(ask_yn "Proceed with installation using these values?" y)" != "true" ]]; then
        msg "Aborted, nothing was changed on this system."
        exit 0
    fi
}

# ---------------------------------------------------------------------------
# Installation steps
# ---------------------------------------------------------------------------
install_dependencies() {
    step "Installing prerequisite packages"
    export DEBIAN_FRONTEND=noninteractive
    wait_for_apt

    # Self-heal from a previous failed run: if `add-apt-repository ppa:ondrej/php`
    # ever ran on this box (e.g. an earlier attempt of this script before it
    # switched to sury.org), the broken/unreachable PPA source stays registered
    # and makes every subsequent `apt update` fail, even on a fresh run. Strip
    # it out unconditionally before the first apt update, rather than requiring
    # the user to clean it up by hand.
    run_sh "Removing any leftover ondrej/php PPA registration" "rm -f /etc/apt/sources.list.d/*ondrej*php* /etc/apt/keyrings/*ondrej*php* /etc/apt/trusted.gpg.d/*ondrej*php*"

    run "Updating package lists" apt update
    run "Installing base packages" apt -y install curl apt-transport-https ca-certificates gnupg unzip tar git cron

    step "Configuring the PHP package repository"
    # packages.sury.org is used for both Debian and Ubuntu: the ondrej/php PPA
    # has been merged into it and no longer publishes for newer Ubuntu releases
    # (e.g. Resolute), while still serving Debian and older Ubuntu just fine.
    # This follows sury.org's own documented install method (README.txt).
    if ! curl -fsSL --max-time 8 -o /dev/null "https://packages.sury.org/php/dists/${OS_CODENAME}/Release"; then
        err "packages.sury.org has no PHP repository for '${OS_CODENAME}' yet. Your OS release may be too new or too old for this script."
        err "Check https://packages.sury.org/php/dists/ for currently supported releases."
        exit 1
    fi
    run_sh "Installing the sury.org PHP repository keyring" "curl -fsSL -o /tmp/debsuryorg-archive-keyring.deb https://packages.sury.org/debsuryorg-archive-keyring.deb && dpkg -i /tmp/debsuryorg-archive-keyring.deb && rm -f /tmp/debsuryorg-archive-keyring.deb"
    run_sh "Adding the sury.org PHP repository" "echo 'deb [signed-by=/usr/share/keyrings/debsuryorg-archive-keyring.gpg] https://packages.sury.org/php/ ${OS_CODENAME} main' > /etc/apt/sources.list.d/php.list"

    step "Installing PHP, MariaDB, Nginx, Redis and other dependencies"
    wait_for_apt
    run "Refreshing package lists" apt update
    run "Installing PHP ${PHP_VERSION} and extensions" apt -y install \
        "php${PHP_VERSION}" "php${PHP_VERSION}-common" "php${PHP_VERSION}-cli" "php${PHP_VERSION}-gd" \
        "php${PHP_VERSION}-mysql" "php${PHP_VERSION}-mbstring" "php${PHP_VERSION}-bcmath" "php${PHP_VERSION}-xml" \
        "php${PHP_VERSION}-fpm" "php${PHP_VERSION}-curl" "php${PHP_VERSION}-zip" \
        mariadb-server nginx redis-server
    run "Enabling PHP-FPM, MariaDB, Redis and cron" systemctl enable --now "php${PHP_VERSION}-fpm" mariadb redis-server cron

    step "Installing Composer"
    run_sh "Downloading and installing Composer" "curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer"
}

download_panel() {
    step "Downloading the latest Jexpanel release"
    run "Creating panel directory" mkdir -p "$PANEL_DIR"
    run_sh "Downloading panel.tar.gz" "curl -fSL --retry 3 --retry-delay 2 -o '${PANEL_DIR}/panel.tar.gz' '${RELEASE_URL}'"
    run_sh "Verifying archive integrity" "tar -tzf '${PANEL_DIR}/panel.tar.gz' >/dev/null"
    run_sh "Extracting archive" "tar -xzf '${PANEL_DIR}/panel.tar.gz' -C '${PANEL_DIR}'"
    run_sh "Removing downloaded archive" "rm -f '${PANEL_DIR}/panel.tar.gz'"

    step "Setting initial file permissions"
    run_sh "Setting storage/cache permissions" "chmod -R 755 '${PANEL_DIR}'/storage/* '${PANEL_DIR}'/bootstrap/cache/"
    run_sh "Setting ownership" "chown -R www-data:www-data '${PANEL_DIR}'"
}

setup_database() {
    step "Creating the panel database"
    local sql
    sql=$(cat <<SQL
DROP USER IF EXISTS '${DB_USER}'@'127.0.0.1';
CREATE USER '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE DATABASE IF NOT EXISTS ${DB_NAME};
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SQL
)
    run_sh "Creating database and user" "mysql -u root <<< \"${sql}\""
}

configure_environment() {
    step "Installing PHP application dependencies"
    run_sh "Copying .env" "cp '${PANEL_DIR}/.env.example' '${PANEL_DIR}/.env'"
    run_sh "Running composer install" "cd '${PANEL_DIR}' && COMPOSER_ALLOW_SUPERUSER=1 COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader --no-interaction"

    # From here on, artisan is invoked with a real argv array (no bash -c string
    # re-parsing) so that arbitrary characters in the admin password/username
    # (quotes, $, backticks, spaces) can never be mis-split or break quoting.
    # artisan resolves its own base path from its location on disk, so no `cd` is needed.
    local artisan="${PANEL_DIR}/artisan"

    step "Generating the application encryption key"
    run "php artisan key:generate" php "$artisan" key:generate --force --no-interaction

    step "Applying application settings"
    run "php artisan p:environment:setup" php "$artisan" p:environment:setup \
        --author="${ADMIN_EMAIL}" \
        --url="${APP_URL}" \
        --timezone="${APP_TIMEZONE}" \
        --cache=redis \
        --session=redis \
        --queue=redis \
        --redis-host=127.0.0.1 \
        --redis-pass=null \
        --redis-port=6379 \
        --settings-ui=true \
        --telemetry=false \
        --no-interaction

    step "Applying database settings"
    run "php artisan p:environment:database" php "$artisan" p:environment:database \
        --host=127.0.0.1 \
        --port=3306 \
        --database="${DB_NAME}" \
        --username="${DB_USER}" \
        --password="${DB_PASSWORD}" \
        --no-interaction

    # Known workaround per Jexpanel docs: reCAPTCHA module is currently incompatible.
    run_sh "Disabling reCAPTCHA" "grep -q '^RECAPTCHA_ENABLED=' '${PANEL_DIR}/.env' && sed -i 's/^RECAPTCHA_ENABLED=.*/RECAPTCHA_ENABLED=false/' '${PANEL_DIR}/.env' || echo 'RECAPTCHA_ENABLED=false' >> '${PANEL_DIR}/.env'"

    step "Running database migrations"
    run "php artisan migrate --seed" php "$artisan" migrate --seed --force --no-interaction

    step "Creating the administrator account"
    run "php artisan p:user:make" php "$artisan" p:user:make \
        --email="${ADMIN_EMAIL}" \
        --username="${ADMIN_USERNAME}" \
        --password="${ADMIN_PASSWORD}" \
        --admin=1 \
        --no-interaction
    verify_admin_user
}

# Belt-and-suspenders: query the database directly to confirm the account
# p:user:make just reported creating actually exists with the expected
# email/username and admin flag, rather than trusting the CLI's exit code alone.
verify_admin_user() {
    local count="0" rc=0
    count=$(mysql -h 127.0.0.1 -u "${DB_USER}" -p"${DB_PASSWORD}" -N -B "${DB_NAME}" \
        -e "SELECT COUNT(*) FROM users WHERE email = '${ADMIN_EMAIL}' AND username = '${ADMIN_USERNAME}' AND root_admin = 1" \
        2>>"$LOG_FILE") || rc=$?
    count="${count//[$'\t\r\n ']/}"
    if [[ $rc -ne 0 || "$count" != "1" ]]; then
        err "Could not verify the administrator account in the database (found: '${count:-0}' matching row, expected 1)."
        err "Check $LOG_FILE for the p:user:make output above this point."
        exit 1
    fi
    ok "Administrator account verified (email: ${ADMIN_EMAIL}, username: ${ADMIN_USERNAME}, admin: yes)."
}

setup_ssl() {
    [[ "$USE_SSL" == "true" ]] || return 0
    step "Requesting an SSL certificate via Let's Encrypt"
    wait_for_apt
    run "Installing certbot" apt -y install certbot python3-certbot-nginx
    warn "Make sure the DNS record for ${PANEL_FQDN} already points at this server's public IP, and that ports 80/443 are reachable, or certificate issuance will fail."

    local rc=0
    log "RUN: certbot certonly --nginx --non-interactive --agree-tos -m ${ADMIN_EMAIL} -d ${PANEL_FQDN}"
    certbot certonly --nginx --non-interactive --agree-tos -m "${ADMIN_EMAIL}" -d "${PANEL_FQDN}" >>"$LOG_FILE" 2>&1 || rc=$?

    if [[ $rc -ne 0 ]]; then
        # Failsafe: don't abort the whole install just because the domain isn't
        # ready for SSL yet (DNS not pointed here, port 80/443 blocked, rate
        # limited, etc). Fall back to a working HTTP install instead.
        warn "Certbot could not obtain a certificate for ${PANEL_FQDN} (exit code $rc). See $LOG_FILE for details."
        warn "Falling back to plain HTTP so the install can finish. Once DNS points at this server, run:"
        warn "  certbot --nginx -d ${PANEL_FQDN}"
        USE_SSL="false"
        APP_URL="http://${PANEL_FQDN}"
    else
        ok "SSL certificate obtained for ${PANEL_FQDN}."
    fi
}

configure_webserver() {
    step "Configuring the nginx webserver"
    local conf_path="/etc/nginx/sites-available/jexactyl.conf"

    if [[ "$USE_SSL" == "true" ]]; then
        cat >"$conf_path" <<'NGINXCONF'
server {
    listen 80;
    server_name __DOMAIN__;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name __DOMAIN__;
    root /var/www/jexactyl/public;
    index index.php;
    access_log /var/log/nginx/jexactyl.app-access.log;
    error_log  /var/log/nginx/jexactyl.app-error.log error;

    client_max_body_size 100m;
    client_body_timeout 120s;
    sendfile off;

    ssl_certificate /etc/letsencrypt/live/__DOMAIN__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN__/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
    ssl_prefer_server_ciphers on;

    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Robots-Tag none;
    add_header Content-Security-Policy "frame-ancestors 'self'";
    add_header X-Frame-Options DENY;
    add_header Referrer-Policy same-origin;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/__PHP_FPM_SOCK__;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param PHP_VALUE "upload_max_filesize = 100M \n post_max_size=100M";
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
        include /etc/nginx/fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
NGINXCONF
    else
        cat >"$conf_path" <<'NGINXCONF'
server {
    listen 80;
    server_name __DOMAIN__;
    root /var/www/jexactyl/public;
    index index.html index.htm index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    access_log off;
    error_log  /var/log/nginx/jexactyl.app-error.log error;

    client_max_body_size 100m;
    client_body_timeout 120s;
    sendfile off;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/__PHP_FPM_SOCK__;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param PHP_VALUE "upload_max_filesize = 100M \n post_max_size=100M";
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTP_PROXY "";
        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }
}
NGINXCONF
    fi

    run_sh "Applying panel domain" "sed -i 's/__DOMAIN__/${PANEL_FQDN}/g; s/__PHP_FPM_SOCK__/php${PHP_VERSION}-fpm.sock/g' '${conf_path}'"
    run_sh "Disabling the default nginx site" "rm -f /etc/nginx/sites-enabled/default"
    run_sh "Enabling the Jexpanel site" "ln -sf '${conf_path}' /etc/nginx/sites-enabled/jexactyl.conf"
    run "Testing nginx configuration" nginx -t
    run "Restarting nginx" systemctl restart nginx
    run "Enabling nginx on boot" systemctl enable nginx
}

finalize() {
    step "Finalizing file permissions"
    run_sh "Setting storage/cache permissions" "chmod -R 755 '${PANEL_DIR}'/storage/* '${PANEL_DIR}'/bootstrap/cache/"
    run_sh "Setting ownership" "chown -R www-data:www-data '${PANEL_DIR}'"

    step "Scheduling the task runner"
    run_sh "Installing cron entry" "(crontab -l 2>/dev/null | grep -Fv 'artisan schedule:run'; echo '* * * * * php ${PANEL_DIR}/artisan schedule:run >> /dev/null 2>&1') | crontab -"

    step "Installing the queue worker service"
    cat >/etc/systemd/system/jxctl.service <<SERVICEEOF
# Jexpanel Queue Worker File
# ----------------------------------
[Unit]
Description=Jexpanel Queue Worker

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php ${PANEL_DIR}/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
SERVICEEOF
    run "Reloading systemd" systemctl daemon-reload
    run "Starting the queue worker" systemctl enable --now jxctl.service

    step "Starting all services"
    run "Restarting PHP-FPM" systemctl restart "php${PHP_VERSION}-fpm"

    cat >"$CRED_FILE" <<CREDS
Jexpanel installation credentials — generated $(date '+%Y-%m-%d %H:%M:%S')
=============================================================

Panel URL:        ${APP_URL}
Admin email:      ${ADMIN_EMAIL}
Admin username:   ${ADMIN_USERNAME}
Admin password:   (as entered during install — not stored here)

Database name:    ${DB_NAME}
Database user:    ${DB_USER}
Database password: ${DB_PASSWORD}

Keep this file safe. It is only readable by root (chmod 600).
CREDS
    chmod 600 "$CRED_FILE"

    echo
    ok "Jexpanel has been installed successfully!"
    echo
    msg "  Panel URL:      $APP_URL"
    msg "  Admin username: $ADMIN_USERNAME"
    msg "  Admin email:    $ADMIN_EMAIL"
    echo
    echo "Database credentials were saved to: $CRED_FILE (root-only)"
    echo "Full install log: $LOG_FILE"
    if [[ "$USE_SSL" != "true" ]]; then
        warn "SSL was not enabled. Consider running certbot and re-running the webserver step manually once you have a domain pointed at this server."
    fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    preflight
    collect_input

    TOTAL_STEPS=18
    [[ "$USE_SSL" == "true" ]] && TOTAL_STEPS=$((TOTAL_STEPS + 1))

    install_dependencies
    download_panel
    setup_database
    setup_ssl
    configure_environment
    configure_webserver
    finalize
}

main "$@"
