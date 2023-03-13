### dcmag's ~/.zshrc ###

### GIT BRANCH ###
autoload -Uz vcs_info
zstyle ':vcs_info:*' enable git svn
zstyle ':vcs_info:git*' formats ": %s(%b) %m%u%c "

precmd() {
    vcs_info
}

setopt prompt_subst


### PROMPT ###
# PS1='%B%n%b@macOS %B%~%b'$'\n''> $ '
PROMPT='%B%F{red}%n%f%b@macOS %B%{%F{yellow}%}%~ %{%f%}%F{green}${vcs_info_msg_0_}%f%b'$'\n''> $ '


### ALIASES ###
alias update='brew upgrade'
alias install='brew install'
alias remove='brew uninstall'
alias clean='brew cleanup'
alias search='brew search'
alias ls='exa'
alias l='exa -l'
alias la='exa -la'
alias lt='exa --tree -L 2'
alias sql='mysql -u root -p'
alias venv='source venv/bin/activate'
alias jn='jupyter notebook'
alias python='python3'
alias pip='pip3'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gpl='git pull'
alias gs='git status'
alias gcl='git clone'

### STARTUP ###
~/Documents/GitRepos/shutthefetchup/shutthefetchup


### ZSH OPTIONS ###
CASE_SENSITIVE="true"

