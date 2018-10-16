# SCT tester

SCT tester was created in my 1st grade at Univerity of Ljubljana Faculty of Computer and Information Science to help me test java programs.

## Features

This plugin enables you to easily test java programs using tj.exe program and it also creates results folder for you and clean after you.

Usage:
- **Ctrl + Shift + p**
- type **>tj**
- press enter
- select terminal where you want to run command

## Requirements

* `tj.exe` program for testing, can be in following places:
    * __anywhere__ - Program can be anywhere, but then it must be imported in settings (`tj_path`)
    * __in folder beside .java file__ - Program doesn't need to be imported

## File and directory naming

Structure of file/directory names:
- Program: `<name>.java`
- Test directory: must start with `<name>_test`
- Results directory: `<name>_results` (will be automaticly created)

## Extension Settings

This extension contributes the following settings:

* `sct_tester.tj_path`: path to tj.exe (global program, it is overriden by local tj.exe if exists)
* `sct_tester.tj_args`: additional args to run tj.exe with
* `sct_tester.clearoldresults`: clear old results if present
* `sct_tester.autoopenresults`: automaticly opens results html file in web browser when tests are finished (only windows)

Or you can override global settings with specific settings for directory with `.tconfig` file:

```json
{
    "tj_path": "",
    "tj_args": "",
    "clearoldresults": true,
    "autoopenresults": false
}
```

## Known Issues

1.0.0
- Not working when results directory doesn't exist

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)
