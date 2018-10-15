import { Tester } from "./tester";
import { TesterException } from "./tester.exception";

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const { exec } = require('child_process');

export class Tester_tj extends Tester {

    protected cExtensions: string[] = ['java'];

    protected gConfig: {
        file : {
            path?: string,
            ext?: string,
            name?: string,
            dir?: string
        },
        clearoldresults: boolean,
        autoopenresults: boolean,
        tj_path?: string,
        tj_args?: string,
        test: {
            dir?: string
        },
        result: {
            dir?: string
        }
    } = {
        file: {},
        clearoldresults: true,
        autoopenresults: false,
        test: {},
        result: {}
    };
    
    // Workspace
    protected prepare_paths(file: string): void {
        console.log('Preparing paths');

        // Get file paths
        this.gConfig.file.path = file;
        this.gConfig.file.ext = path.extname(this.gConfig.file.path).substr(1);
        this.gConfig.file.name = path.basename(this.gConfig.file.path,this.gConfig.file.ext);
        this.gConfig.file.name = this.gConfig.file.name.substr(0, this.gConfig.file.name.length-1);
        this.gConfig.file.dir = path.dirname(this.gConfig.file.path);

        console.log(`File path: ${this.gConfig.file.path}\nFile name: ${this.gConfig.file.name}\nFile extension: ${this.gConfig.file.ext}\nFile dir: ${this.gConfig.file.dir}`);
        
        // Check extension
        let found: boolean = false;
        this.cExtensions.forEach((ext) => {
            if (ext.toLocaleLowerCase() === this.gConfig.file.ext) {
                found = true;
                return;
            }
        });

        if (!found) {
            throw new TesterException(1, 'Invalid extension.');
        }
    }

    protected prepare_dependencies(): void {

        // Load global settings
        console.log('Loading global settings');
        this.gConfig.tj_path = vscode.workspace.getConfiguration().get('sct_tester.tj_path');
        this.gConfig.tj_args = vscode.workspace.getConfiguration().get('sct_tester.tj_args') || '';
        this.gConfig.clearoldresults = vscode.workspace.getConfiguration().get('sct_tester.clearoldresults') || true;
        this.gConfig.autoopenresults = vscode.workspace.getConfiguration().get('sct_tester.autoopenresults') || false;
        // Load local settings (if available)
        if (fs.existsSync(path.join(this.gConfig.file.dir || '', 'tj.exe'))) {
            console.log('Local executable found');
            this.gConfig.tj_path = path.join(this.gConfig.file.dir || '', 'tj.exe');
        }

        if (fs.existsSync(path.join(this.gConfig.file.dir || '', '.tconfig'))) {
            console.log('Loading local config');
            let config_file = JSON.parse(fs.readFileSync(path.join(this.gConfig.file.dir || '', '.tconfig')).toLocaleString());
            if (config_file.tj_path) {
                if (fs.existsSync(config_file.tj_path)) {
                    this.gConfig.tj_path = config_file.tj_path;
                } else {
                    console.log(config_file.tj_path + ' not found');
                    throw new TesterException(1, config_file.tj_path + ' not found');
                }
            }
                
            if (config_file.tj_args)
                this.gConfig.tj_args = config_file.tj_args;
            if (config_file.clearoldresults)
                this.gConfig.clearoldresults = config_file.clearoldresults;
            if (config_file.autoopenresults)
                this.gConfig.autoopenresults = config_file.autoopenresults;
        }

        // Check settings (trigger error if not all right)
        if (fs.existsSync(this.gConfig.tj_path || '')) {
            console.log('Executable path confirmed');
            this.gConfig.tj_path = this.gConfig.tj_path;
        } else {
            console.log(this.gConfig.tj_path + ' not found');
            throw new TesterException(1, this.gConfig.tj_path + ' not found');
        }
    }

    protected prepare_workspace(): boolean {
        // Find test case & result directory else throw error
        let test_dir_match: string[] = [];
        let result_dir_match: string[] = [];
        let test_regex: RegExp = new RegExp('^(' + this.gConfig.file.name + '_test.*)$', 'gi');
        let result_regex = new RegExp('^(' + this.gConfig.file.name + '_re[sz]ult.*)$', 'gi');
        fs.readdirSync(this.gConfig.file.dir || '').forEach((name) => {
            if (fs.statSync(path.join(this.gConfig.file.dir || '', name)).isDirectory()) {
                if (test_regex.test(name))
                    test_dir_match.push(name);
                if (result_regex.test(name))
                    result_dir_match.push(name);
            }
                
        });
        
        // Check if test case directory was found
        if (test_dir_match.length >= 1) {
            console.log('Tests directory found');
            this.gConfig.test.dir = path.join(this.gConfig.file.dir || '', test_dir_match[0]);
        } else {
            console.log('Tests directory not found');
            throw new TesterException(1, 'Tests directory not found');
            // fs.mkdirSync(this.gConfig.file.dir + '/' + this.gConfig.file.name + '_test');
        }

        // Check if result directory was found else create it
        if (result_dir_match.length >= 1) {
            console.log('Results directory found');
            this.gConfig.result.dir = path.join(this.gConfig.file.dir || '', result_dir_match[0]);
            
            // Remove all files inside results directory
            if (this.gConfig.clearoldresults) {
                console.log('Removing old results from ' + this.gConfig.result.dir);
                let objpath: string;
                fs.readdirSync(this.gConfig.result.dir).forEach((object) => {
                    objpath = path.join(this.gConfig.result.dir || '', object);
                    if (fs.statSync(objpath).isFile()) {
                        console.log('Removing ' + object);
                        fs.unlinkSync(objpath);
                    } else if (fs.statSync(objpath).isDirectory()) {
                        console.log('Removing ' + object);
                        fs.rmdirSync(objpath);
                    }
                    
                });
                // Remove .class
                let classfile: string = path.join(this.gConfig.file.dir || '', this.gConfig.file.name + '.class');
                if (fs.existsSync(classfile)) {
                    console.log('Removing ' + classfile);
                    fs.unlinkSync(classfile);
                }
            }
        } else {
            console.log('Results directory not found, creating one');
            this.gConfig.result.dir = path.join(this.gConfig.file.dir || '', this.gConfig.file.name || '', '_results');
            fs.mkdirSync(this.gConfig.result.dir);
        }

        return true;
    }
    protected clean_workspace(): void {

    }  
    
    // Main
    public test(file: string, onTest:(cmd: string) => any): void {
        this.prepare_paths(file);
        this.prepare_dependencies();

        // Check for dependancies
        if (!this.prepare_workspace())
            throw new TesterException(1, 'Can\'t prepare workspace');

        /*
            TODO section
        */
        // Open results in web browser
        let resultcmd: string = '';
        if (this.gConfig.autoopenresults) {
            if (process.platform === 'win32') {
                // TODO find any html file
                let resultfile = path.join(this.gConfig.result.dir || '', 'prikaz.htm');
                console.log('Opening ' + resultfile);
                
                /*exec(`start ${resultfile}`, (err: any, stdout: any, stderr: any) => {
                    if (err) {
                        // node couldn't execute the command
                        console.log(`stderr: ${stderr}`);
                        return;
                    }

                    // the *entire* stdout and stderr (buffered)
                    //console.log(`stdout: ${stdout}`);
                    //console.log(`stderr: ${stderr}`);
                });*/
            resultcmd = ` ; start ${resultfile}`;
            } else {
                console.log('Auto open not implemented yet');
            }
        }

        let cmd: string = `${this.gConfig.tj_path} ${this.gConfig.tj_args} ${this.gConfig.file.path} ${this.gConfig.test.dir} ${this.gConfig.result.dir}${resultcmd}`;
        console.log(cmd);
        onTest(cmd);
    }
}