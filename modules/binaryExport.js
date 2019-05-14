const path = require('path');
const fs = require('fs');

function GetESDInterface() {
    var esdinterface = require('./@esdebug/esdebugger-core/win/x64/esdcorelibinterface.node');
    if (esdinterface === undefined) {
        console.log('Platform not supported: ' + platform);
        process.exit(1);
    }
    return esdinterface;
}

function init() {
    var initData = GetESDInterface().esdInit();

    if (initData.status !== 0) {
        console.log('Unable to proceed. Error Code: ' + initData.status);
    }
}
function destroy() {
    GetESDInterface().esdDestroy();
}

function readFileSyncNoBOM(scriptPath) {
    var content = undefined;
    try {
        content = fs.readFileSync(scriptPath).toString();
        if (content) {
            content = content.replace(/^\uFEFF/, '');
        }
    } catch (error) {
        console.log(error);
    }

    return content;
}

function jsxToBin(scriptPath) {
    var includePath = path.dirname(scriptPath);
    var scriptSource = readFileSyncNoBOM(scriptPath);
    var scriptDirectory = includePath;

    var apiData = GetESDInterface().esdCompileToJSXBin(scriptSource, scriptPath, includePath);
    if (apiData.status != 0) {
        console.log('Error: ' + apiData.status);
        console.log(GetESDInterface().esdGetLastError().data);
    } else {
        return apiData.data;
    }
}

init();
console.log(jsxToBin('D:\\jsx\\script.jsx'));
destroy();
