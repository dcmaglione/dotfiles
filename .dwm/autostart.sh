#! /bin/bash 

function run {
  if ! pgrep -f $1 ;
  then
    $@&
  fi
}

#run picom -b 
run nitrogen --restore 
run flameshot 
run thunar --daemon 
run blueman-applet 
run dunst 
run lxpolkit 
run xsetwacom set 10 MapToOutput DP-2
run spotify
run kitty -e gotop
run discord

export _JAVA_AWT_WM_NONREPARENTING=1

while true; do
  xsetroot -name " [ $(pactl list sinks | grep '^[[:space:]]Volume:' | head -n $(( $SINK + 1 )) | tail -n 1 | sed -e 's,.* \([0-9][0-9]*\)%.*,\1,')%] $(date +"[ %x] [ %I:%M %P] ")"
	sleep 0.1s
done &

