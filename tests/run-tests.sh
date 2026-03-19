#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find deno: use QUARTO_ROOT if set, otherwise try to resolve from `quarto` on PATH
if command -v deno &>/dev/null; then
  DENO=deno
elif [ -n "${QUARTO_ROOT:-}" ]; then
  source "$QUARTO_ROOT/package/scripts/common/utils.sh"
  DENO="$QUARTO_ROOT/package/dist/bin/tools/$DENO_ARCH_DIR/deno"
elif command -v quarto &>/dev/null; then
  QUARTO_BIN_DIR="$(quarto --paths | head -1)"
  # Detect arch
  case "$(uname -m)" in
    x86_64)  DENO_ARCH_DIR=x86_64 ;;
    aarch64|arm64) DENO_ARCH_DIR=aarch64 ;;
    *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
  esac
  DENO="$QUARTO_BIN_DIR/tools/$DENO_ARCH_DIR/deno"
else
  echo "No deno found. Either:" >&2
  echo "  - install deno" >&2
  echo "  - set QUARTO_ROOT to a configured quarto-cli checkout" >&2
  echo "  - have quarto on PATH" >&2
  exit 1
fi

cd "$SCRIPT_DIR"
"$DENO" test --allow-all --no-check "$@"
