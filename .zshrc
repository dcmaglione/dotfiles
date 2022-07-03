### dcmag's ~/.zshrc ###

### PROMPT ###
PS1='%B%n%b@macOS %B%~%b'$'\n''> $ '

### ALIASES ###
alias update='brew update'
alias upgrade='brew upgrade'
alias install='brew install'
alias remove='brew uninstall'
alias clean='brew cleanup'
alias search='brew search'
alias ls='ls --color=auto'
alias ls='exa'
alias l='exa -l'
alias la='exa -a'
alias lla='exa -la'
alias lt='exa --tree -L 2'
alias sql='mysql -u root -p'
alias venv='source venv/bin/activate'

### ENV VARIABLES ###


### PLUGINS ###


### ZSH OPTIONS ###
CASE_SENSITIVE="true"

