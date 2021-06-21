" GENERAL "
" enable syntax highlighting
syntax on

" show line numbers
set number

" copy indentation from line above
set autoindent

" ignore case when searching
set ignorecase
set smartcase

" highlight search results
set hlsearch

" highlight all matches while typing
set incsearch


" PLUGINS "
call plug#begin('~/.vim/plugged')

Plug 'arcticicestudio/nord-vim'

call plug#end()

colorscheme nord
