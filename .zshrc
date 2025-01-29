#!/bin/sh

# DCMAG'S ~/.ZSHRC
# ------------------------------------------
# SOURCE
# ------------------------------------------
# Load Zap Config
[ -f "$HOME/.local/share/zap/zap.zsh" ] && source "$HOME/.local/share/zap/zap.zsh"

# Load and Initialize Completion System
autoload -Uz compinit
compinit

# ------------------------------------------
# ZAP PLUGIN MANAGER
# ------------------------------------------
# Fish-like autosuggestions for zsh
plug "zsh-users/zsh-autosuggestions"

# A completions plugin with some sensible starters
plug "zap-zsh/completions"

# Auto-close and delete matching delimiters in zsh
plug "hlissner/zsh-autopair"

# Supercharge your zsh experience
plug "zap-zsh/supercharge"

# Fish shell like syntax highlighting for Zsh
plug "zsh-users/zsh-syntax-highlighting"

# A helper plugin for users with fzf installed
plug "zap-zsh/fzf"

# Vim plugin for zsh (alternative to standard Zsh vi mode)
plug "zap-zsh/vim"

# A zsh plugin for the Homebrew package manager
plug "wintermi/zsh-brew"

# ------------------------------------------
# ALIASES, EXPORTS, & PROMPT
# ------------------------------------------
# Load Alises and Exports
plug "$HOME/.config/zsh/aliases.zsh"
plug "$HOME/.config/zsh/exports.zsh"

# A modified prompt based on chris@machine 
plug "$HOME/.config/zsh/prompt.zsh-theme"

# ------------------------------------------
# KEYBINDS
# ------------------------------------------
bindkey '^ ' autosuggest-accept

# ------------------------------------------
# MISC
# ------------------------------------------
# Setup FZF
[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
