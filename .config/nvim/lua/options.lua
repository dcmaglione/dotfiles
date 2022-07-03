local o = vim.opt

-- General Options -- //TODO -> Organize Options
-- Boolean
o.swapfile = true
o.backup = false
o.smartcase = true
o.ignorecase = true
o.autoindent = true
o.hlsearch = true
o.incsearch = true
o.number = true
o.relativenumber = true
o.undofile = true
o.showmode = true
o.cursorline = false 
o.expandtab = true
o.splitright = true
o.splitbelow = true
o.wrap = true
o.wildmenu = true
o.autoread = true
o.hidden = true
-- o.termguicolors = true //TODO
o.title = true
o.showmatch = true

-- Integer
o.conceallevel = 0
o.laststatus = 2
o.tabstop = 4
o.shiftwidth = 4
o.scrolloff = 8
o.sidescrolloff = 8

-- String
o.undodir = os.getenv("HOME") .. "/.config/nvim/undodir"
o.fileencoding = "utf-8"
o.clipboard = "unnamed"
o.signcolumn = "yes"
o.mouse = "a"
o.wildmode = "list:longest:full"
o.completeopt = { "menuone", "noselect", "preview" }
o.iskeyword:append("-,.")
