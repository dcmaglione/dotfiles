### dcmag's ~/.bashrc ###
### MISC ###
# If not running interactively, don't do anything
[[ $- != *i* ]] && return
source ~/.dotbare/dotbare.plugin.bash


### PROMPT ###
# PS1='[\u@\h \W]\$ '
PS1='\e[1;37m\u\e[0m@\h \e[1;37m\w\e[0m \n> \$ '

### ALIASES ###
alias ls='ls --color=auto'
alias sync="trizen -Syy"
alias update="trizen -Syyu"
alias install="trizen -S"
alias remove="trizen -Rscn"
alias clean="trizen -Scc"
alias search="trizen -s"
alias ls="exa"
alias l="exa -l"
alias la="exa -a"
alias lla="exa -la"
alias lt="exa --tree"
alias off="clear && xset dpms force off"
alias ds4bat="cat '/sys/class/power_supply/sony_controller_battery_1c:a0:b8:46:0c:22/capacity'"

### PATHS ###
# example
# export PATH="/opt/bin:$PATH"
