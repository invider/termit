# Termit
Web Terminal Emulator

# Controls

```
*Ctrl+Enter* - continue input on the next line (multi-line command)
*Ctrl+Z* - switch the theme
```

# Integration

**Termit** ships with only basic echo and web socket handlers.

You have to implement hanlder interface:

```
init() - process any required setup procedures here
         it is called when the handler is set for Termit

exec(cmd) - execute the command represented by the string [cmd]
```

Call ```term.setHandler(customHandler)``` to assign a handler.
