const fs = require('fs');
const path = require('path');

const regexG = /#include\s*".*"[\r\n]+/g;
const regex = /#include\s*"(.*)"/;

module.exports = { build };

//Concatenate a list of files in one string
function build(rootPath) {
	let fsStack = [];
	let buildArr = [];

	makeDepStack(fsStack, rootPath);

	for (let i = 0; i < fsStack.length; i++) {
		buildArr.push(
			`${i == 0 ? '' : '\r\n'}///////////////////////// ${path.basename(
				fsStack[i]
			)} /////////////////////////\r\n`
		);
		buildArr.push(fs.readFileSync(fsStack[i], 'utf8').replace(regexG, ''));
	}
	return buildArr.join('');
}

//resolve absolute path relative base file
function pathResolve(base, fileName) {
	if (base === undefined || fileName === undefined) return;
	return path.resolve(path.dirname(base), fileName.trim());
}

//Match all incudes statements and return an array of resolved absolute paths
function getIncludes(filePath) {
	if (filePath === undefined) return;
	const includes = fs.readFileSync(filePath, 'utf8').match(regexG);
	if (includes) {
		for (let i = 0; i < includes.length; i++) {
			includes[i] = pathResolve(filePath, includes[i].match(regex)[1]);
		}
	}
	return includes;
}

//Make an array of paths with priority
function makeDepStack(stackArr, root) {
	if (stackArr === undefined || root === undefined) return;
	if (stackArr.includes(root)) return;
	const includes = getIncludes(root);
	if (includes) {
		for (let i = 0; i < includes.length; i++) {
			makeDepStack(stackArr, includes[i]);
		}
	}
	stackArr.push(root);
}
