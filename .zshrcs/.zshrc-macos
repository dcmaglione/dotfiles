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
# ALIASES, EXPORTS, & PROMPT
# ------------------------------------------
# Load Alises and Exports
plug "$HOME/.config/zsh/aliases.zsh"
plug "$HOME/.config/zsh/exports.zsh"

# A modified prompt based on chris@machine 
plug "$HOME/.config/zsh/prompt.zsh-theme"

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

# ZSH plugin that reminds you to use existing aliases for commands you just typed
plug "MichaelAquilina/zsh-you-should-use"

# A helper plugin for users with fzf installed
plug "zap-zsh/fzf"

# Override ls and tree commands to use exa instead
plug "zap-zsh/exa"

# Vim plugin for zsh (alternative to standard Zsh vi mode)
plug "zap-zsh/vim"

# A zsh plugin for the Homebrew package manager
plug "wintermi/zsh-brew"

# A zsh plugin for the Google Cloud Command Line Interface (gcloud CLI) completions
plug "wintermi/zsh-gcloud"

# ------------------------------------------
# KEYBINDS
# ------------------------------------------
bindkey '^ ' autosuggest-accept

# ------------------------------------------
# MISC
# ------------------------------------------
# Use BAT if Installed
if command -v bat &> /dev/null; then
	alias cat="bat -pp --theme \"ansi\"" 
	alias catt="bat --theme \"ansi\"" 
fi

# Use FZF if Installed
if command -v fzf &> /dev/null; then
	[ -f ~/.fzf.zsh ] && source ~/.fzf.zsh
fi

