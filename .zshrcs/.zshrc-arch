### EXPORTS ###
export ZSH="/home/dcmag/.oh-my-zsh"
export VISUAL=vim
export EDITOR=vim

### THEME ###
ZSH_THEME="bureau"

### PLUGINS ###
plugins=(
  git
  urltools
  bgnotify
  zsh-autosuggestions
  zsh-syntax-highlighting
  dotbare
)

source $ZSH/oh-my-zsh.sh
source /usr/share/fzf/key-bindings.zsh

### ALIASES ###
alias sync="trizen -Syy"
alias update="trizen -Syyu"
alias install="trizen -S"
alias remove="trizen -Rscn"
alias clean="trizen -Scc && sudo pacman -Qtdq | pacman -Rns -"
alias search="trizen -s"
alias ls="lsd"
alias l="lsd -l"
alias la="lsd -a"
alias lla="lsd -la"
alias lt="lsd --tree"
alias off="clear && xset dpms force off"

### PATHS ###
# example
# path+=/opt/bin/
