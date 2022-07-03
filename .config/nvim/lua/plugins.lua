local fn = vim.fn

-- Autocommand: Reload NVIM on plugins.lua Update
vim.cmd [[
  augroup packer_user_config
    autocmd!
    autocmd BufWritePost plugins.lua source <afile> | PackerCompile
  augroup end
]]

-- Protected Call: Prevent Error on Initial Use 
local status_ok, packer = pcall(require, "packer")
if not status_ok then
  return
end

-- Install Plugins Here
return packer.startup(function(use)

-- Place at End of Plugins
if packer_bootstrap then
    require('packer').sync()
  end
end)
