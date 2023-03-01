# logseq-lilypond

This plugin has a simple function, that is, allow rendering lilypond in logseq! 🎵

![](/plugin.gif)

#Setting up

Ensure you have an instance of [lilypond-web](https://github.com/dot-asterisk-nl/lilypond-web) running. ([Need hosting?](https://dot-asterisk.nl)) Then after installing the plugin,
go to the plugin settings and edit these values.

```
{
  "baseURL": "http://localhost:6969", // REQUIRED
  "username": "", //optional
  "password": "" //optional
}
```

#How to use:

The plugin knows three variants:
- Macro-compatible
- Simple
- Full

In the case of macro-compatible and simple your lilypond code will be wrapped with the following:
```
\\include "lilypond-book-preamble.ly" 
  \score { 
    {
      ${code}
    }
    \layout{}
    \midi{}
  }
```

## Macro-compatible
This makes use of the renderer macro syntax, example below:
```
{{renderer lilypond, \relative c'[<c e g> <c; e g> ] \addlyrics[aa oo]}}
```
Please note that it isn't possible to use commas (,) or curly braces ({}) due to macros not supporting them. The plugin uses (;) and ({}) instead for these ends and will be autoconverted for the eventual lilypond code.

## Simple and Full
Use command `/Lilypond` to generate a boilerplate:
```
{{renderer lilypond-codeblock}}
'''lilypond
<- your lilypond goes here
'''
```

In the case of full mode, replace the top line with `{{renderer lilypond-codeblock, full}}`. It works very similarly but does not have the 