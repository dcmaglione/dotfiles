#! /bin/bash

function run {
  if ! pgrep -f $1; then
    $@ &
  fi
}

run picom -b
run nitrogen --restore
run flameshot
run thunar --daemon
run dunst
run lxpolkit
run xsetroot -cursor_name left_ptr

export _JAVA_AWT_WM_NONREPARENTING=1
