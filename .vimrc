let mapleader = "," "Used as a prefix to let you namespace arbitrary commands

syntax enable "Syntax highlighting
set number    "Line numbering
set vb        "Flashes screen on errors
set hlsearch  "Highlights search terms

"A bunch of indentation stuff.
set smartindent    "Be smart about indenting (esp. C-like languages)
set autoindent     "Open lines at same indentation level
set expandtab      "Automatically turn TABs into 'tabstop' spaces
set tabstop=4      "1 tab = 4 spaces
set shiftwidth=4   "Shift operators move 4 spaces at a time
set softtabstop=4  "Among other things, this causes <BS> to go back 4 spaces

set textwidth=76   "Exactly what it sounds like
set wildmenu       "For helpful tab completion on say, :vsp <PATH_PREFIX>
set mouse=a        "Allows the use of the mouse in all modes. Not useful in Mac Terminal
set cursorline     "Highlights/underlines the current line
set ruler          "Shows the cursor position in bottom right
"set cc=80         "Draw a bar at 80 characters
set backspace=indent,eol,start "Fixes super weird backspace problem
set nospell

colorscheme elflord

filetype on "Enable filetype detection
filetype plugin on "Enables filetype-specific plugins
filetype plugin indent on "Tries to fix indenting of # comments
au! FileType python setl nosmartindent

"Remembers where the cursor left off for each file
autocmd BufReadPost *
    \ if line("'\"") > 0 && line("'\"") <= line("$") |
    \   exe "normal! g`\"" |
    \ endif

"Some sort of hack to get the above to work
au BufWinLeave * mkview
au BufWinEnter * silent loadview

map <C-N>  <esc>:NERDTreeToggle<CR>
nmap <space> zz
nmap <C-H> <C-W>h
nmap <C-L> <C-W>l
nmap <C-J> <C-W>j
nmap <C-K> <C-W>k
nmap <C-P> <C-W>k
"Note that <CR> is used for ENTER
imap <leader>wq <esc>:wq<CR>

"Helpful esp. in Git Diff
map <F2> <esc>:qall<CR>
map <leader>w <esc>:set nowrap<CR>
"The ! means toggle
map <leader>cl <esc>:set cursorline!<CR>
":inoremap # X#  "Note that ^H is entered with Ctrl-V Ctrl-H

"Open .pde files as C-type files
au BufNewFile,BufRead *.pde set filetype=cpp

"Some custom colors
hi Visual ctermfg=Black
hi Visual ctermbg=Yellow
hi clear CursorLine
"hi CursorLine ctermfg=15 ctermbg=9
hi Pmenu cterm=bold,reverse ctermfg=0 ctermbg=15
hi PmenuSel term=reverse ctermfg=15 ctermbg=9
hi LineNr ctermfg=8
"hi Normal ctermfg=White
