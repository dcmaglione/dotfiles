local opts = { noremap = true, silent = true }
local map = vim.keymap.set

-- Map Leader Key (Space)
map("", "<Space>", "<Nop>", opts)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Normal --
-- Split Navigation
map("n", "<C-h>", "<C-w>h", opts)
map("n", "<C-j>", "<C-w>j", opts)
map("n", "<C-k>", "<C-w>k", opts)
map("n", "<C-l>", "<C-w>l", opts)

-- Resize Windows
map("n", "<S-Up>", ":resize +3<CR>", opts)
map("n", "<S-Down>", ":resize -3<CR>", opts)
map("n", "<S-Left>", ":vertical resize -3<CR>", opts)
map("n", "<S-Right>", ":vertical resize +3<CR>", opts)

-- Change Split (In Stack)
map("n", "<S-j>", "<C-w>t<C-w>J<C-w>t<C-w>H", opts)
-- map("n", "<S-k>", "<C-w>t<C-w>K<C-w>t<C-w>H", opts) //TODO

-- Buffer Navigation
map("n", "<S-l>", ":bnext<CR>", opts)
map("n", "<S-h>", ":bprevious<CR>", opts)

-- Text Movement (Up and Down)
map("n", "∆", "<Esc>:m .+1<CR>==gi", opts)
map("n", "˚", "<Esc>:m .-2<CR>==gi", opts)


-- Insert --
-- Quick Enter
map("i", "jk", "<Esc>", opts)


-- Visual --
-- Stay Indent Mode
map("v", "<", "<gv", opts)
map("v", ">", ">gv", opts)

-- Text Movement (Up and Down) 
map("v", "∆", ":m .+1<CR>==", opts)
map("v", "˚", ":m .-2<CR>==", opts)

-- Don't Update Yank (On Paste)
map("v", "p", '"_dP', opts)


-- Visual Block --
-- Text Movement (Up and Down) 
map("x", "∆", ":move '>+1<CR>gv-gv", opts)
map("x", "˚", ":move '<-2<CR>gv-gv", opts)


-- Terminal --
-- Terminal Navigation
map("t", "<C-h>", "<C-\\><C-N><C-w>h", opts)
map("t", "<C-j>", "<C-\\><C-N><C-w>j", opts)
map("t", "<C-k>", "<C-\\><C-N><C-w>k", opts)
map("t", "<C-l>", "<C-\\><C-N><C-w>l", opts)
