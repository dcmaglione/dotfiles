#!/bin/sh

# DCMAG'S ZSH/EXPORTS.ZSH
# ------------------------------------------
# PATHS
# ------------------------------------------
export PATH=${PATH}:/usr/local/mysql/bin
export PATH="/opt/homebrew/opt/inetutils/libexec/gnubin:$PATH"
export PATH="/usr/local/bin:$PATH"
export PATH="/Users/dcmag/Library/Python/3.9/bin:$PATH"
export PATH="/Library/TeX/texbin:$PATH"

# ------------------------------------------
# EVALUATE PLUGIN
# ------------------------------------------
eval "$(/opt/homebrew/bin/brew shellenv)"
eval "$(zoxide init zsh)"

# ------------------------------------------
# PYENV
# ------------------------------------------
export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"

