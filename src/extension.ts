'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Tester_tj } from "./tester_tj";
import { TesterException } from './tester.exception';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Module sct_tester loaded');
	
    let disposable = vscode.commands.registerCommand('sct_tester.tj', () => {
		// Check if we have active text editor
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('No text editor active');
			vscode.window.showErrorMessage('No text editor is active');
			return;
		}
		
		try {
			let tester = new Tester_tj();
			tester.test(editor.document.uri.fsPath, (cmd: string) => {
				// Run tj.exe in terminal
				if (vscode.window.terminals.length === 0) { // No terminals in current VScode
					console.log('sct_tj: No terminals detected, creating new one');
					let terminal = vscode.window.createTerminal(); // Create new terminal and run code
					terminal.show(true);
					terminal.sendText(cmd);
					console.log('sct_tj: New terminal opened');
				} else {
					interface TerminalQuickPickItem extends vscode.QuickPickItem {
						terminal: vscode.Terminal | undefined,
						createNew: boolean
					}
					let termlist: TerminalQuickPickItem[] = [];
					termlist.push({
						label: 'New terminal',
						terminal: undefined,
						createNew: true
					});
					let terminalCount = 0;
					vscode.window.terminals.forEach((terminal) => {
						terminalCount++;
						termlist.push({
							label: `Terminal ${terminalCount}: ${terminal.name}`,
							terminal: terminal,
							createNew: false
						});
					});
				
					console.log('sct_tj: Terminals found, asking user what to do');
					
					// Show selection to user
					vscode.window.showQuickPick(termlist).then((selected: TerminalQuickPickItem | undefined) => {
						if (!selected) {
							console.log('sct_tj: User didn\'t select any option');
							return;
						}
						if (selected.createNew) { // Selected option that new terminal should be created
							console.log('sct_tj: Creating new terminal');
							let terminal = vscode.window.createTerminal(); // Create new terminal and run code
							terminal.show(true);
							terminal.sendText(cmd);
							console.log('sct_tj: New terminal opened');
						} else { // Run commands in selected terminal
							console.log('sct_tj: Executing commands in '+ (<any>selected.terminal).name);
							(<any>selected.terminal).show(true);
							(<any>selected.terminal).sendText(cmd);
						}
					});
					
				}
			});
		} catch (ex) {
			if (ex instanceof TesterException) {
				vscode.window.showErrorMessage(ex.message + ` (${ex.id})`);
			}
		}
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log('Module sct_tj unloaded');
}