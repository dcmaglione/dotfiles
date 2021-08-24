#      _                            _                        __ _
#   __| | ___ _ __ ___   __ _  __ _( )___    ___ ___  _ __  / _(_) __ _
#  / _` |/ __| '_ ` _ \ / _` |/ _` |// __|  / __/ _ \| '_ \| |_| |/ _` |
# | (_| | (__| | | | | | (_| | (_| | \__ \ | (_| (_) | | | |  _| | (_| |
#  \__,_|\___|_| |_| |_|\__,_|\__, | |___/  \___\___/|_| |_|_| |_|\__, |
#                             |___/                               |___/
#
# A config for the Qtile (http://www.qtile.org) window manager
#
# Lots borrowed from Derek Taylor's (http://www.gitlab.com/dwt1) Qtile config
# and my good friend David Springfield (http://www.gitlab.com/dasprii457)
#
# Modified by Dominic Maglione

### COPYRIGHT INFORMATION ###
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# -*- coding: utf-8 -*-


### IMPORTS ###
import os
import re
import socket
import subprocess
import logging
from libqtile.config import Key, Screen, Group, Drag, Click, Match
from libqtile.command import lazy
from libqtile import layout, bar, widget, hook, qtile
from typing import List  # noqa: F401


### VARIABLES ###
# Sets mod key to ALT and terminal to KITTY
mod = "mod1"
terminal = "kitty"

### MISC FUNCTIONS ###
# Brings all floating windows to the front
@lazy.function
def float_to_front(qtile):
    logging.info("bring floating windows to front")
    for group in qtile.groups:
        for window in group.windows:
            if window.floating:
                window.cmd_bring_to_front()


### KEYBINDS ###
keys = [
    # General keybinds
    Key([mod], "Return",
        lazy.spawn(terminal),
        desc='Launch terminal'
        ),
    Key([mod, "shift"], "Return",
        lazy.spawn(
            "dmenu_run -fn 'FiraCode-Bold-11' -nb '#2e3440' -nf '#f2f2f2' -sb '#7db2eb' -sf '#f2f2f2'"),
        desc='Run dmenu launcher with prompt'
        ),
    Key([mod], "Tab",
        lazy.next_layout(),
        desc='Toggle through layouts'
        ),
    Key([mod, "shift"], "q",
        lazy.window.kill(),
        desc='Kill active window'
        ),
    Key([mod, "shift"], "r",
        lazy.restart(),
        desc='Restart Qtile'
        ),
    Key([mod, "shift"], "e",
        lazy.shutdown(),
        desc='Shutdown Qtile'
        ),

    # Window controls
    Key([mod], "j",
        lazy.layout.down(),
        desc='Move focus down in current stack pane'
        ),
    Key([mod], "k",
        lazy.layout.up(),
        desc='Move focus up in current stack pane'
        ),
    Key([mod], "h",
        lazy.layout.shrink(),
        desc='Shrink window'
        ),
    Key([mod], "l",
        lazy.layout.grow(),
        desc='Expand window'
        ),
    Key([mod, "shift"], "j",
        lazy.layout.shuffle_down(),
        desc='Move windows down in current stack'
        ),
    Key([mod, "shift"], "k",
        lazy.layout.shuffle_up(),
        desc='Move windows up in current stack'
        ),
    Key([mod], "n",
        lazy.layout.normalize(),
        desc='normalize window size ratios'
        ),
    Key([mod], "m",
        lazy.layout.maximize(),
        desc='toggle window between minimum and maximum sizes'
        ),
    Key([mod], "f",
        lazy.window.toggle_fullscreen(),
        desc='toggle fullscreen'
        ),
    Key([mod, "shift"], "f",
        lazy.window.toggle_floating(),
        desc='toggle floating'
        ),
    Key([mod, "control"], "f",
        float_to_front,
        desc='Brings floating window to front'
        ),

    # Stack controls
    Key([mod, "shift"], "Tab",
        lazy.layout.rotate(),
        lazy.layout.flip(),
        desc='Switch which side main pane occupies'
        ),
    Key([mod], "space",
        lazy.layout.next(),
        desc='Switch window focus to other pane(s) of stack'
        ),
    Key([mod, "shift"], "space",
        lazy.layout.toggle_split(),
        desc='Toggle between split and unsplit sides of stack'
        ),

    # Switch monitor focus
    Key([mod], "q",
        lazy.to_screen(0),
        desc='Keyboard focus to monitor 1'
        ),
    Key([mod], "w",
        lazy.to_screen(1),
        desc='Keyboard focus to monitor 2'
        ),
    Key([mod], "period",
        lazy.next_screen(),
        desc='Move focus to next monitor'
        ),
    Key([mod], "comma",
        lazy.prev_screen(),
        desc='Move focus to prev monitor'
        ),

    # Screenshot Tool
    Key(
        [mod, "shift"], "p",
        lazy.spawn("flameshot gui"),
        desc='Open flameshot gui interface'
    ),
    # Not in use since flameshot gui is versatile
    # Key(
    #     ["shift"], "Print",
    #     lazy.spawn("flameshot screen"),
    #     desc='Capture partial screenshot'
    # ),
    # Key(
    #     [mod, "shift"], "Print",
    #     lazy.spawn("flameshot full"),
    #     desc='Capture full screenshot'
    # ),

    # Media controls
    Key(
        [], "XF86AudioRaiseVolume",
        lazy.spawn("pactl set-sink-volume @DEFAULT_SINK@ +5%"),
        desc='Raise system volume'
    ),
    Key(
        [], "XF86AudioLowerVolume",
        lazy.spawn("pactl set-sink-volume @DEFAULT_SINK@ -5%"),
        desc='Lower system volume'
    ),
    Key(
        [], "XF86AudioMute",
        lazy.spawn("pactl set-sink-mute @DEFAULT_SINK@ toggle"),
        desc='Mute system volume'
    ),
    Key(
        [], "XF86AudioPlay",
        lazy.spawn("playerctl play-pause"),
        desc='Play/pause current media'
    ),
    Key(
        [], "XF86AudioNext",
        lazy.spawn("playerctl next"),
        desc='Next track'
    ),
    Key(
        [], "XF86AudioPrev",
        lazy.spawn("playerctl previous"),
        desc='Previous track'
    ),
]


### GROUPS ###
# Defines workspace names and layouts
group_names = [("WEB", {'layout': 'monadtall'}),
               ("DEV", {'layout': 'monadtall'}),
               ("SYS", {'layout': 'monadtall'}),
               ("MUS", {'layout': 'monadtall'}),
               ("CHAT", {'layout': 'monadtall'}),
               ("VBOX", {'layout': 'monadtall'}),
               ("DOC", {'layout': 'monadtall'}),
               ("VID", {'layout': 'monadtall'})]

groups = [Group(name, **kwargs) for name, kwargs in group_names]

for i, (name, kwargs) in enumerate(group_names, 1):
    # mod1 + letter of group = switch to group
    keys.append(Key([mod], str(i), lazy.group[name].toscreen()))

    # mod1 + shift + letter of group = switch to & move focused window to group
    keys.append(Key([mod, "shift"], str(i), lazy.window.togroup(name)))


### LAYOUTS ###
# Default theme settings
layout_theme = {"border_width": 4,
                "margin": 10,
                "border_focus": "#f2f2f2",
                "border_normal": "#2e3440"}

# Layouts used by groups
layouts = [
    layout.MonadTall(**layout_theme),
    layout.Floating(**layout_theme)
]

### COLORS ###
# Snowy Mountains [Custom Color Palette]
colors = [
    # Bar
    ["#2e3440", "#2e3440"],  # 0
    ["#3b4252", "#3b4252"],  # 1
    ["#434c5e", "#434c5e"],  # 2
    ["#4c566a", "#4c566a"],  # 3
    # Sky
    ["#fafae0", "#fafae0"],  # 4
    ["#e5e5e5", "#e5e5e5"],  # 5
    ["#d5e4ea", "#d5e4ea"],  # 6
    ["#a9d7ee", "#a9d7ee"],  # 7
    ["#80cbf4", "#80cbf4"],  # 8
    ["#72c7f4", "#72c7f4"],  # 9
    # Mountains
    ["#f2f2f2", "#f2f2f2"],  # 10
    ["#deefff", "#deefff"],  # 11
    ["#c9dff6", "#c9dff6"],  # 12
    ["#b1d5fe", "#b1d5fe"],  # 13
    ["#94c0f3", "#94c0f3"],  # 14
    ["#7db2eb", "#7db2eb"],  # 15
    # Land
    ["#0b3e6b", "#0b3e6b"],  # 16
    ["#002b54", "#002b54"],  # 17
    ["#002244", "#002244"],  # 18
    ["#001a37", "#001a37"]   # 19
]

# Nord Color Palette
# colors = [
#     # Polar Night
#     ["#2e3440", "#2e3440"], # 0
#     ["#3b4252", "#3b4252"], # 1
#     ["#434c5e", "#434c5e"], # 2
#     ["#4c566a", "#4c566a"], # 3
#     # Snow Storm
#     ["#d8dee9", "#d8dee9"], # 4
#     ["#e5e9f0", "#e5e9f0"], # 5
#     ["#eceff4", "#eceff4"], # 6
#     # Frost
#     ["#8fbcbb", "#8fbcbb"], # 7
#     ["#88c0d0", "#88c0d0"], # 8
#     ["#81a1c1", "#81a1c1"], # 9
#     ["#5e81ac", "#5e81ac"], # 10
#     # Aurora
#     ["#bf616a", "#bf616a"], # 11
#     ["#d08770", "#d08770"], # 12
#     ["#ebcb8b", "#ebcb8b"], # 13
#     ["#a3be8c", "#a3be8c"], # 14
#     ["#b48ead", "#b48ead"], # 15
# ]


### QTILE PROMPT ###
# Settings for Qtile prompt (unused since dmenu is preffered)
prompt = "{0}@{1}: ".format(os.environ["USER"], socket.gethostname())


### WIDGETS ###
# Default settings
widget_defaults = dict(
    font="FiraCode",
    fontsize=16,
    padding=4,
    background=colors[0]
)
extension_defaults = widget_defaults.copy()

# Widgets list
# Contains widgets both in and not in use (not in use commented out)
def init_widgets_list():
    widgets_list = [
        # Group box
        widget.Sep(
            linewidth=0,
            padding=6,
            background=colors[0],
            foreground=colors[2]
        ),
        widget.GroupBox(
            font="FiraCode",
            fontsize=16,
            margin_y=3,
            margin_x=0,
            padding_y=6,
            padding_x=3,
            borderwidth=3,
            active=colors[10],
            inactive=colors[3],
            rounded=False,
            highlight_color=colors[0],
            highlight_method="block",
            this_current_screen_border=colors[13],
            this_screen_border=colors[15],
            other_current_screen_border=colors[13],
            other_screen_border=colors[15],
            urgent_border=colors[16],
            urgent_text=colors[16],
            background=colors[0],
            foreground=colors[2]
        ),

        # Name of current window
        widget.Sep(
            linewidth=0,
            padding=31,
            background=colors[0],
            foreground=colors[2]
        ),
        widget.WindowName(
            background=colors[0],
            foreground=colors[10],
            padding=0
        ),

        # CPU speed and load
        widget.TextBox(
            text="",
            background=colors[0],
            foreground=colors[10],
            padding=0,
            fontsize=43
        ),
        widget.TextBox(
            text=" ",
            padding=0,
            background=colors[10],
            foreground=colors[0],
        ),
        widget.CPU(
            format=" CPU {freq_current}GHz {load_percent}%",
            update_interval=1.0,
            background=colors[10],
            foreground=colors[0],
            padding=5
        ),

        # Memory load
        widget.TextBox(
            text="",
            background=colors[10],
            foreground=colors[13],
            padding=0,
            fontsize=43
        ),
        widget.TextBox(
            text=" ",
            background=colors[13],
            foreground=colors[0],
            padding=0,
        ),
        widget.Memory(
            format=" {MemUsed:.0f}{mm}/{MemTotal:.0f}{mm}",
            update_interval=1.0,
            background=colors[13],
            foreground=colors[0],
            padding=5
        ),

        # System temperature
        widget.TextBox(
            text="",
            background=colors[13],
            foreground=colors[15],
            padding=0,
            fontsize=43
        ),
        widget.TextBox(
            text=" 🌡",
            padding=0,
            background=colors[15],
            foreground=colors[0],
        ),
        widget.ThermalSensor(
            update_interval=1.0,
            background=colors[15],
            foreground=colors[0],
            threshold=90,
            padding=5,
            tag_sensor="Package id 0"
        ),

        # Network speed (up and down)
        widget.TextBox(
            text="",
            background=colors[15],
            foreground=colors[16],
            padding=0,
            fontsize=43
        ),
        widget.Net(
            interface="enp4s0",
            format='{down}  {up}',
            update_interval=1.0,
            background=colors[16],
            foreground=colors[10],
            padding=5
        ),

        # Volume indicator
        widget.TextBox(
            text="",
            background=colors[16],
            foreground=colors[17],
            padding=0,
            fontsize=43
        ),
        widget.TextBox(
            text="  Vol",
            background=colors[17],
            foreground=colors[10],
            padding=0
        ),
        widget.Volume(
            background=colors[17],
            foreground=colors[10],
            padding=5
        ),

        # Date and time
        widget.TextBox(
            text="",
            background=colors[17],
            foreground=colors[19],
            padding=0,
            fontsize=43
        ),
        widget.Clock(
            background=colors[19],
            foreground=colors[10],
            format="%A, %B %d  %I:%M %p "
        ),
    ]
    return widgets_list


### SCREENS ###
# Defines widgets for screen 0 (primary)
def init_widgets_screen0():
    widgets_screen0 = init_widgets_list()
    return widgets_screen0

# Defines widgets for screen 1 (secondary)
def init_widgets_screen1():
    widgets_screen1 = init_widgets_list()
    # Deletes all widgets from index 4 (CPU)
    del widgets_screen1[4:]
    return widgets_screen1

# Defines screens and their corresponding widgets
def init_screens():
    return [Screen(top=bar.Bar(widgets=init_widgets_screen0(), opacity=1.0, size=24)),
            Screen(top=bar.Bar(widgets=init_widgets_screen1(), opacity=1.0, size=24))]


# Sets screens and corresponding widgets
if __name__ in ["config", "__main__"]:
    screens = init_screens()
    widgets_list = init_widgets_list()
    widgets_screen0 = init_widgets_screen0()
    widgets_screen1 = init_widgets_screen1()


### FLOATING WINDOWS ###
# Defines mousebindings for floating layout
mouse = [
    Drag([mod], "Button1", lazy.window.set_position_floating(),
         start=lazy.window.get_position()),
    Drag([mod], "Button3", lazy.window.set_size_floating(),
         start=lazy.window.get_size()),
    Click([mod], "Button2", lazy.window.bring_to_front())
]

# Default speciality settings from Qtile config
dgroups_key_binder = None
dgroups_app_rules = []  # type: List
main = None
follow_mouse_focus = True
bring_front_click = False
cursor_warp = False

# Applies floating layout to particular WM classes
floating_layout = layout.Floating(float_rules=[
    # Run the utility of `xprop` to see the wm class and name of an X client.
    # All of the below classes are simply applications/programs/etc that will
    # always run in the floating layout (add as you see fit)
    *layout.Floating.default_float_rules,
    Match(wm_class='confirm'),
    Match(wm_class='dialog'),
    Match(wm_class='download'),
    Match(wm_class='error'),
    Match(wm_class='file_progress'),
    Match(wm_class='notification'),
    Match(wm_class='splash'),
    Match(wm_class='toolbar'),
    Match(wm_class='confirmreset'),  # gitk
    Match(wm_class='makebranch'),  # gitk
    Match(wm_class='maketag'),  # gitk
    Match(wm_class='ssh-askpass'),  # ssh-askpass
    Match(wm_class='branchdialog'),  # gitk
    Match(wm_class='pinentry'),  # GPG key password entry
    Match(wm_class='Lxappearance'),
    Match(wm_class='Pavucontrol'),
    Match(wm_class='VirtualBox Manager'),
    Match(wm_class='Virt-manager'),
    Match(wm_class='feh'),
    Match(wm_class='Lxpolkit'),
    Match(wm_class='thunar'),
    Match(wm_class='evince')
], **layout_theme)
auto_fullscreen = True
focus_on_window_activation = "smart"


### STARTUP APPLICATIONS ###
# Calls autostart.sh script
@hook.subscribe.startup_once
def start_once():
    home = os.path.expanduser('~')
    subprocess.call([home + '/.config/qtile/autostart.sh'])


# XXX: Gasp! We're lying here. In fact, nobody really uses or cares about this
# string besides java UI toolkits; you can see several discussions on the
# mailing lists, GitHub issues, and other WM documentation that suggest setting
# this string if your java app doesn't work correctly. We may as well just lie
# and say that we're a working one by default.
#
# We choose LG3D to maximize irony: it is a 3D non-reparenting WM written in
# java that happens to be on java's whitelist.
wmname = "LG3D"
