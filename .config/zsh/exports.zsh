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
# GOOGLE CLOUD CLI
# ------------------------------------------
# The next line updates PATH for the Google Cloud SDK.
if [ -f '/Users/dcmag/google-cloud-sdk/path.zsh.inc' ]; then . '/Users/dcmag/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/Users/dcmag/google-cloud-sdk/completion.zsh.inc' ]; then . '/Users/dcmag/google-cloud-sdk/completion.zsh.inc'; fi
