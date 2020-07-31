// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
//const rimraf = require("rimraf");
const terminal = vscode.window.createTerminal("Build JAR");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gerador-de-jar" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.geraJAR', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const folderPath = getCurrentWorkspaceFolder();
		if (!folderPath) {
			vscode.window.showErrorMessage('Selecione um workspace!');
			return;
		}

		var file = vscode.window.activeTextEditor.document.uri.path.substring(1);

		var pathFolder = vscode.workspace.workspaceFolders[0].uri.path.substring(1);
		var pathFolderBin = pathFolder + '/build-jar/bin';
		var pathFolderBuild = pathFolder + '/build-jar';

		var diretorio = path.dirname(file).substring(pathFolder.length+1);
		var nomeJar = path.basename(diretorio);

		fs.exists(pathFolderBin, err => {
			if(!err) {
				return fs.mkdir(pathFolderBuild, err => {
					if(err) {
						return vscode.window.showErrorMessage("Não foi possível criar o diretório build-jar/");
					}
					fs.mkdir(pathFolderBin, err => {
						if(err) {
							return vscode.window.showErrorMessage("Não foi possível criar o diretório build-jar/bin/");
						}
						while(!(fs.existsSync(pathFolderBin)));
						
						fs.writeFile(path.join(pathFolderBuild, "manifest.txt"), generateManisfest(), err => {
							if (err) {
							  return vscode.window.showErrorMessage("Falha na criação do arquivo manifest.txt");
							}
							fs.writeFile(path.join(pathFolderBuild, "build.sh"), generateBuild(diretorio, nomeJar), err => {
								if (err) {
								  return vscode.window.showErrorMessage("Falha na criação do arquivo build.sh");
								}
								while(!(fs.readFileSync(path.join(pathFolderBuild, "build.sh"))));
								terminal.sendText("./build-jar/build.sh");
								terminal.sendText("rm -f build-jar/build.sh");
							});
						});

					});
				});
			}

			fs.writeFile(path.join(pathFolderBuild, "manifest.txt"), generateManisfest(), err => {
				if (err) {
				  return vscode.window.showErrorMessage("Falha na criação do arquivo manifest.txt");
				}
				fs.writeFile(path.join(pathFolderBuild, "build.sh"), generateBuild(diretorio, nomeJar), err => {
					if (err) {
					  return vscode.window.showErrorMessage("Falha na criação do arquivo build.sh");
					}
					while(!(fs.readFileSync(path.join(pathFolderBuild, "build.sh"))));
					terminal.sendText("./build-jar/build.sh");
					terminal.sendText("rm -f build-jar/build.sh");
				});
			});
		});

		//terminal.dispose();
/*		
		terminal.sendText("jar -cvfm build-jar/person.jar build-jar/manifest.txt -C build-jar/bin/ . src/");
*/
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

// Adquirir o diretório local
function getCurrentWorkspaceFolder() {
	try {
	  return vscode
		.workspace
		.workspaceFolders[0]
		.uri
		.toString()
		.split(":")[1];
	} catch (error) {
	  console.error(error);
	  return '';
	}
  }

// Gera um arquivo manifest
function generateManisfest() {
	return (
	  `Manifest-Version: 1.0
Class-Path: .`
	);
}

function generateBuild(dir, name) {
	var s = "#!/bin/bash \njavac -cp src/ "+ dir +"/*.java -d build-jar/bin/ \njar -cvfm build-jar/"+ name +".jar build-jar/manifest.txt -C build-jar/bin/ . src/ \nrm -f build-jar/manifest.txt";
	return s;
}