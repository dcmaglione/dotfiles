" DCMAG'S VIMRC
" -----------------------------------------------------------------------------
"  PLUGIN SETTINGS
" -----------------------------------------------------------------------------
" set colorscheme for lightline
let g:lightline = { 'colorscheme': 'dracula' }

" disable language packs by adding them here
" let g:polygot_disabled = ['markdown']

" -----------------------------------------------------------------------------
"  PLUGINS
" -----------------------------------------------------------------------------
" install vim-plug if it's not already installed
if empty(glob('~/.vim/autoload/plug.vim'))
  silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
endif

" if plugins are missing, run PlugInstall
autocmd VimEnter * if len(filter(values(g:plugs), '!isdirectory(v:val.dir)'))
  \| PlugInstall --sync | source $MYVIMRC
\| endif

" plugin list
call plug#begin('~/.vim/plugged')

Plug 'sheerun/vim-polyglot'

Plug 'itchyny/lightline.vim'

Plug 'gko/vim-coloresque'

Plug 'dracula/vim'

Plug 'ekalinin/Dockerfile.vim'

Plug 'cdelledonne/vim-cmake'

call plug#end()

" ---------------------------------------------------------------------------
" GENERAL SETTINGS
" ---------------------------------------------------------------------------
" enable syntax highlighting
syntax on

" enable hybrid line numbers
set nu rnu

" enable automatic indentation
set autoindent

" good idea to set this
set nocompatible

" disable line wrapping
set nowrap

" always display status line
set laststatus=2

" enable file recognition
filetype on

" enable file recognition for plugins
filetype plugin on

" enable file specific indentation
filetype indent on

" set the colorscheme
colorscheme dracula

" enable color highlighting based on terminal
set termguicolors

" disable modeline
set noshowmode

" enables incremental search (searches as you type)
set incsearch

" disables case sensitive search
set ignorecase

" highlight matching braces
set showmatch

" highlight search patterns
set hlsearch

" dark mode colorscheme
set background=dark

" enable mouse movement
set mouse=a

" set insert cursor style
let &t_SI = "\e[6 q"
let &t_EI = "\e[2 q"

" enable protobuf syntax
augroup filetype
  au! BufRead,BufNewFile *.proto setfiletype proto
augroup end

" reset cursor shape (alacritty)
augroup reset_cursor_shape
  au!
  "autocmd VimEnter * startinsert | stopinsert
  autocmd VimEnter * normal! :startinsert :stopinsert
  "autocmd VimEnter * :normal :startinsert :stopinsert
  autocmd VimEnter * redraw!
augroup end
