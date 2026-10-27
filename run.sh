#!/usr/bin/env bash

# =============================================================================
# PharmaVigil Frontend — Run Script
# Starts the Next.js 14 frontend web app with optional lint, test, format, and build passes.
# =============================================================================

set -e

# ---------------------------------------------------------------------------
# Colors & Formatting
# ---------------------------------------------------------------------------
CYAN=$'\033[0;36m'
GREEN=$'\033[0;32m'
MAGENTA=$'\033[0;35m'
YELLOW=$'\033[0;33m'
RED=$'\033[0;31m'
NC=$'\033[0m'
BOLD=$'\033[1m'

PREFIX="${CYAN}[frontend]${NC}"
PKG_MANAGER="npm"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

LINT=0
TEST=0
PRETTIFY=0
TYPECHECK=0
BUILD=0

# ---------------------------------------------------------------------------
# Argument Parsing
# ---------------------------------------------------------------------------
usage() {
    cat << EOF
${BOLD}PharmaVigil Frontend Service Runner${NC}

${BOLD}Usage:${NC} $0 [options]

${BOLD}Options:${NC}
  -l, --lint       Run Next.js ESLint check before starting the server
  -t, --test       Run Vitest component & unit tests before starting
  -c, --check      Run TypeScript typecheck (tsc --noEmit)
  -p, --prettify   Run Prettier code formatting
  -b, --build      Build production Next.js bundle before starting
  -h, --help       Show this help message

${BOLD}Default Action:${NC}
  Starts the Next.js frontend dev server via 'npm run dev' on http://localhost:3000
EOF
    exit 0
}

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -l|--lint)     LINT=1 ;;
        -t|--test)     TEST=1 ;;
        -c|--check)    TYPECHECK=1 ;;
        -p|--prettify) PRETTIFY=1 ;;
        -b|--build)    BUILD=1 ;;
        -h|--help)     usage ;;
        *)
            echo -e "${RED}Unknown parameter: $1${NC}"
            echo "Use -h or --help for usage."
            exit 1
            ;;
    esac
    shift
done

# ---------------------------------------------------------------------------
# Pre-run Phases (Sequential)
# ---------------------------------------------------------------------------
if [[ $PRETTIFY -eq 1 ]]; then
    echo -e "${YELLOW}==> Running Prettier formatting (frontend)...${NC}"
    $PKG_MANAGER run format
    echo -e "${GREEN}✔ Prettier formatting completed.${NC}\n"
fi

if [[ $LINT -eq 1 ]]; then
    echo -e "${YELLOW}==> Running linter (frontend)...${NC}"
    $PKG_MANAGER run lint
    echo -e "${GREEN}✔ Linting passed.${NC}\n"
fi

if [[ $TYPECHECK -eq 1 ]]; then
    echo -e "${YELLOW}==> Running TypeScript typecheck (frontend)...${NC}"
    $PKG_MANAGER run typecheck
    echo -e "${GREEN}✔ Typecheck passed.${NC}\n"
fi

if [[ $TEST -eq 1 ]]; then
    echo -e "${YELLOW}==> Running tests (frontend)...${NC}"
    $PKG_MANAGER test
    echo -e "${GREEN}✔ All frontend tests passed.${NC}\n"
fi

if [[ $BUILD -eq 1 ]]; then
    echo -e "${YELLOW}==> Building Next.js production bundle...${NC}"
    $PKG_MANAGER run build
    echo -e "${GREEN}✔ Production build completed.${NC}\n"
fi

# ---------------------------------------------------------------------------
# Server Execution
# ---------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}==> Starting PharmaVigil Frontend on http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop server${NC}\n"

PID=""

cleanup() {
    if [[ -n "$PID" ]]; then
        echo -e "\n${YELLOW}==> Shutting down frontend server...${NC}"
        kill "$PID" 2>/dev/null || true
        wait "$PID" 2>/dev/null || true
        echo -e "${GREEN}==> Frontend stopped.${NC}"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

FORCE_COLOR=1 $PKG_MANAGER run dev 2>&1 | while IFS= read -r line || [[ -n "$line" ]]; do
    printf "%s %s\n" "$PREFIX" "$line"
done &

PID=$!
wait "$PID"
