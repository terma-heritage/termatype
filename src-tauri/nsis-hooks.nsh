!include WinVer.nsh

!macro NSIS_HOOK_PREINSTALL
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_ICONSTOP|MB_OK "TermaType requires Windows 10 or later.$\n$\nPlease update your operating system to install TermaType."
    Abort
  ${EndIf}
!macroend
