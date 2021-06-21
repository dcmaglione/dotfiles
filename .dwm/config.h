/* See LICENSE file for copyright and license details. */

/* appearance */
static const unsigned int borderpx = 2;	/* border pixel of windows */
static const unsigned int gappx = 10;	/* gaps between windows */
static const unsigned int snap = 0;	/* snap pixel */
static const int showbar = 1;	/* 0 means no bar */
static const int topbar = 1;	/* 0 means bottom bar */
static const char *fonts[] = { "ubuntu mono:style=regular:size=13",
  "font awesome 5 free solid:style=solid:size=12",
  "font awesome 5 brands regular:style=regular:size=12"
};

static const char dmenufont[] = "ubuntu mono:style=regular:size=13";
static const char color0[] = "#000000";
static const char color1[] = "#333333";
static const char color2[] = "#c1c1c1";
static const char color3[] = "#5f8787";
static const char color4[] = "#ddeecc";
static const char *colors[][4] = {
  /*              fg       bg      border */
  [SchemeNorm] =  {color2, color0, color1},
  [SchemeSel] =   {color0, color3, color3},
  [SchemeTitle] = {color4, color0, color1},
};

static const unsigned int baralpha = 255;
static const unsigned int borderalpha = 255;
static const unsigned int alphas[][3] = {
  /*              fg       bg        border      */
  [SchemeNorm] =  {OPAQUE, baralpha, borderalpha},
  [SchemeSel] =   {OPAQUE, baralpha, borderalpha},
  [SchemeTitle] = {OPAQUE, baralpha, borderalpha},
};

/* tagging */
static const char *tags[] =
  { "", "", "", "", "", "", "", "", "" };

static const Rule rules[] = {
  /* xprop(1):
   *      WM_CLASS(STRING) = instance, class
   *      WM_NAME(STRING) = title
   */
  /* class, instance, title, tmask, float, monitor */
  {"Lxappearance", NULL, NULL, 0, 1, -1},
  {"Pavucontrol", NULL, NULL, 0, 1, -1},
  {"Virtualbox Manager", NULL, NULL, 0, 1, -1},
  {"Lutris", NULL, NULL, 0, 1, -1},
  {"Wine", NULL, NULL, 0, 1, -1},
  {"Thunar", NULL, NULL, 0, 1, -1},
  {"net-technicpack-launcher-LauncherMain", NULL, NULL, 0, 1, -1},
  {"Blueman-manager", NULL, NULL, 0, 1, -1},
  {"feh", NULL, NULL, 0, 1, -1},
  {"Lxpolkit", NULL, NULL, 0, 1, -1},
  {"Timeshift-gtk", NULL, NULL, 0, 1, -1},
  {"cemu.exe", NULL, NULL, 0, 1, -1},
  {"origin.exe", NULL, NULL, 0, 1, -1},
  {"explorer.exe", NULL, NULL, 0, 1, -1},
  {"Steam", NULL, NULL, 0, 1, -1},
  {"battle.net.exe", NULL, NULL, 0, 1, -1},
  {"Termite", NULL, "vim", 0, 1, -1},
  {"Pamac-manager", NULL, NULL, 0, 1, -1},
  {"Gnome-calculator", NULL, NULL, 0, 1, -1},
  /* monitor 2 */
  {"discord", NULL, NULL, 0, 0, 1},
  {"Spotify", NULL, "-", 0, 0, 1},
  {"Spotify", NULL, "Spotify Premium", 0, 0, 1},
};

/* layout(s) */
static const float mfact = 0.55;	/* factor of master area size [0.05..0.95] */
static const int nmaster = 1;	/* number of clients in master area */
static const int resizehints = 1;	/* 1 means respect size hints in tiled resizals */

static const Layout layouts[] = {
  /* symbol     arrange function */
  {"[tile]", tile},		/* first entry is default */
  {"[float]", NULL},		/* no layout function means floating behavior */
  {"[M]", monocle},
  {NULL, NULL},
};

/* key definitions */
#define MODKEY Mod1Mask
#define TAGKEYS(KEY,TAG) \
{ MODKEY,                       KEY,      view,           {.ui = 1 << TAG} }, \
{ MODKEY|ControlMask,           KEY,      toggleview,     {.ui = 1 << TAG} }, \
{ MODKEY|ShiftMask,             KEY,      tag,            {.ui = 1 << TAG} }, \
{ MODKEY|ControlMask|ShiftMask, KEY,      toggletag,      {.ui = 1 << TAG} },

/* helper for spawning shell commands in the pre dwm-5.0 fashion */
#define SHCMD(cmd) { .v = (const char*[]){ "/bin/sh", "-c", cmd, NULL } }

/* commands */
static char dmenumon[2] = "0";	/* component of dmenucmd, manipulated in spawn() */
static const char *dmenucmd[] =
  { "dmenu_run", "-m", dmenumon, "-fn", dmenufont, "-nb", color0, "-nf",
  color2, "-sb", color3, "-sf", color0, NULL
};
static const char *termcmd[] = { "kitty", NULL };
static const char *upvol[] =
  { "pactl", "set-sink-volume", "@DEFAULT_SINK@", "+10%", NULL };
static const char *downvol[] =
  { "pactl", "set-sink-volume", "@DEFAULT_SINK@", "-10%", NULL };
static const char *mutevol[] =
  { "pactl", "set-sink-mute", "@DEFAULT_SINK@", "toggle", NULL };
static const char *playpause[] = { "playerctl", "play-pause", NULL };
static const char *next[] = { "playerctl", "next", NULL };
static const char *previous[] = { "playerctl", "previous", NULL };
static const char *flameshot[] = { "flameshot", "gui", NULL };
static const char *quitdwm[] = { "killall", "xinit", NULL };
static const char *picomk[] = { "killall", "picom", NULL };
static const char *picoms[] = { "picom", NULL };
static const char *wacomfull[] =
  { "xsetwacom", "set", "10", "resetarea", NULL };
static const char *wacomsmol[] =
  { "xsetwacom", "set", "10", "area", "0", "0", "7300", "4106", NULL };
static const char *brightup[] = { "xbacklight", "+10", NULL };
static const char *brightdown[] = { "xbacklight", "-10", NULL };

#include "movestack.c"
#include <X11/XF86keysym.h>
static Key keys[] = {
  /* modifier, key, function, argument */
  {MODKEY, XK_d, spawn, {.v = dmenucmd}},
  {MODKEY, XK_Return, spawn, {.v = termcmd}},
  {0, XF86XK_AudioLowerVolume, spawn, {.v = downvol}},
  {0, XF86XK_AudioMute, spawn, {.v = mutevol}},
  {0, XF86XK_AudioRaiseVolume, spawn, {.v = upvol}},
  {0, XF86XK_AudioPlay, spawn, {.v = playpause}},
  {0, XF86XK_AudioNext, spawn, {.v = next}},
  {0, XF86XK_AudioPrev, spawn, {.v = previous}},
  {0, XF86XK_MonBrightnessUp, spawn, {.v = brightup}},
  {0, XF86XK_MonBrightnessDown, spawn, {.v = brightdown}},
  {0, XK_Print, spawn, {.v = flameshot}},
  {MODKEY, XK_t, spawn, {.v = picomk}},
  {MODKEY | ShiftMask, XK_t, spawn, {.v = picoms}},
  {MODKEY | ShiftMask, XK_d, spawn, {.v = wacomfull}},
  {MODKEY | ShiftMask, XK_s, spawn, {.v = wacomsmol}},
  {MODKEY, XK_b, togglebar, {0}},
  {MODKEY, XK_j, focusstack, {.i = +1}},
  {MODKEY, XK_k, focusstack, {.i = -1}},
  {MODKEY | ShiftMask, XK_j, movestack, {.i = +1}},
  {MODKEY | ShiftMask, XK_k, movestack, {.i = -1}},
  {MODKEY, XK_equal, incnmaster, {.i = +1}},
  {MODKEY, XK_minus, incnmaster, {.i = -1}},
  {MODKEY, XK_h, setmfact, {.f = -0.05}},
  {MODKEY, XK_l, setmfact, {.f = +0.05}},
  {MODKEY | ShiftMask, XK_Return, zoom, {0}},
  {MODKEY | ShiftMask, XK_q, killclient, {0}},
  {MODKEY, XK_Tab, cyclelayout, {.i = +1}},
  {MODKEY | ShiftMask, XK_Tab, cyclelayout, {.i = -1}},
  {MODKEY | ShiftMask, XK_space, togglefloating, {0}},
  {MODKEY, XK_f, togglefullscr, {0}},
  {MODKEY, XK_comma, focusmon, {.i = -1}},
  {MODKEY, XK_period, focusmon, {.i = +1}},
  {MODKEY | ShiftMask, XK_comma, tagmon, {.i = -1}},
  {MODKEY | ShiftMask, XK_period, tagmon, {.i = +1}},
  TAGKEYS (XK_1, 0)
  TAGKEYS (XK_2, 1)
  TAGKEYS (XK_3, 2)
  TAGKEYS (XK_4, 3)
  TAGKEYS (XK_5, 4)
  TAGKEYS (XK_6, 5)
  TAGKEYS (XK_7, 6)
  TAGKEYS (XK_8, 7) 
	TAGKEYS (XK_9, 8) 
	{MODKEY | ShiftMask, XK_r, quit, {0}},
  {MODKEY | ShiftMask, XK_e, spawn, {.v = quitdwm}}
};

/* button definitions */
/* click can be ClkTagBar, ClkLtSymbol, ClkStatusText, ClkWinTitle, ClkClientWin, or ClkRootWin */
static Button buttons[] = {
  /* click, event mask, button, function, argument */
  {ClkLtSymbol, 0, Button1, setlayout, {0}},
  {ClkLtSymbol, 0, Button3, setlayout, {.v = &layouts[2]}},
  {ClkWinTitle, 0, Button2, zoom, {0}},
  {ClkStatusText, 0, Button2, spawn, {.v = termcmd}},
  {ClkClientWin, MODKEY, Button1, movemouse, {0}},
  {ClkClientWin, MODKEY, Button2, togglefloating, {0}},
  {ClkClientWin, MODKEY, Button3, resizemouse, {0}},
  {ClkTagBar, 0, Button1, view, {0}},
  {ClkTagBar, 0, Button3, toggleview, {0}},
  {ClkTagBar, MODKEY, Button1, tag, {0}},
  {ClkTagBar, MODKEY, Button3, toggletag, {0}},
};
