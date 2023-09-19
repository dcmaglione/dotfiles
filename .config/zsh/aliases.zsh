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

# ------------------------------------------
# DEVELOPMENT
# ------------------------------------------
alias sql='mysql -u root -p'
alias venv='source venv/bin/activate'
alias jn='jupyter notebook'
alias python='python3'
alias pip='pip3'
alias java-8='export JAVA_HOME=`/usr/libexec/java_home -v 1.8.0_361`'

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

