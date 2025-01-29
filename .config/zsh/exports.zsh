#!/bin/sh

# DCMAG'S ZSH/EXPORTS.ZSH
# ------------------------------------------
# PATHS
# ------------------------------------------
export PATH="/opt/homebrew/opt/inetutils/libexec/gnubin:$PATH"
export PATH="/usr/local/bin:$PATH"
export PATH="/Users/maglidc1/Library/Python/3.9/bin:$PATH"
export PATH="/Users/maglidc1/go/bin:$PATH"

# ------------------------------------------
# EVALUATE PLUGIN
# ------------------------------------------
eval "$(/opt/homebrew/bin/brew shellenv)"
eval "$(zoxide init zsh)"

