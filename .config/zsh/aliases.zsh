#!/bin/sh

# DCMAG'S ZSH/ALIASES.ZSH
# ------------------------------------------
# HOMEBREW
# ------------------------------------------
alias upgrade='brew upgrade'
alias update='brew update'
alias install='brew install'
alias uninstall='brew uninstall'
alias cleanup='brew cleanup'
alias search='brew search'
alias autoremove='brew autoremove'

# ------------------------------------------
# CLI UTILS
# ------------------------------------------
# Eza
alias ls='eza'
alias ll='eza -l'
alias la='eza -a'
alias lla='eza -la'

# Bat
alias cat='bat -pp --theme "ansi"'
alias catt='bat --theme "ansi"'

# Ripgrep
alias grep='rg'

# ------------------------------------------
# GIT
# ------------------------------------------
alias add='git add'
alias commit='git commit'
alias push='git push'
alias pull='git pull'
alias status='git status'
alias clone='git clone'
alias checkout='git checkout'
alias branch='git branch'
alias stash='git stash'
alias fetch='git fetch'

# ------------------------------------------
# DEVELOPMENT
# ------------------------------------------
alias venv='source venv/bin/activate'
alias python='python3'
alias pip='pip3'

# ------------------------------------------
# GREP
# ------------------------------------------
alias grep='grep --color=auto'
alias egrep='egrep --color=auto'
alias fgrep='fgrep --color=auto'

# ------------------------------------------
# OVERWRITE CONFIRMATION
# ------------------------------------------
alias cp="cp -i"
alias mv='mv -i'
alias rm='rm -i'

