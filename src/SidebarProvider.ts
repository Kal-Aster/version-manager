import * as vscode from "vscode";
import getChanges from "./getChanges";

import getNonce from "./getNonce";
import NEW_VERSION_TYPE from "./NEW_VERSION_TYPE";
import removeChange from "./removeChange";
import setChange from "./setChange";
import stageNewVersion from "./stageNewVersion";

export class SidebarProvider implements vscode.WebviewViewProvider {
    _view?: vscode.WebviewView;
    _doc?: vscode.TextDocument;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,

            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "stage-new-major-version": {
                    stageNewVersion(NEW_VERSION_TYPE.MAJOR);
                    break;
                }
                case "stage-new-minor-version": {
                    stageNewVersion(NEW_VERSION_TYPE.MINOR);
                    break;
                }
                case "stage-new-patch-version": {
                    stageNewVersion(NEW_VERSION_TYPE.PATCH);
                    break;
                }
                case "get-changes": {
                    webviewView.webview.postMessage({
                        type: "changes",
                        value: getChanges()
                    });
                    break;
                }
                case "set-change": {
                    setChange(data.value.description, data.value.done);
                    webviewView.webview.postMessage({
                        type: "changes",
                        value: getChanges()
                    });
                    break;
                }
                case "rem-change": {
                    removeChange(data.value);
                    webviewView.webview.postMessage({
                        type: "changes",
                        value: getChanges()
                    });
                    break;
                }
                case "onInfo": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showInformationMessage(data.value);
                    break;
                }
                case "onError": {
                    if (!data.value) {
                        return;
                    }
                    vscode.window.showErrorMessage(data.value);
                    break;
                }
            }
        });
    }

    public revive(panel: vscode.WebviewView) {
        this._view = panel;
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
        );

        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
        );
        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
        );

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${
                    webview.cspSource
                }; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <script nonce="${nonce}">
                    const vscode = acquireVsCodeApi();
                </script>
            </head>
            <body>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
