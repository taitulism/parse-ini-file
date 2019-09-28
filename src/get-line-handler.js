/* eslint-disable no-multi-assign */

const {
	cleanLine,
	parse,
	isWrappedWithBrackets,
	getKeyValue,
	normalizeValue,
	getSectionName,
	parseToList,
	isList,
} = require('./utilities');

const SECTION = 0;

function getLineHandler (rootObj) {
	let currentObj = rootObj;
	let currentList = null;

	return (line) => {
		line = cleanLine(line);

		if (!line) return;

		const lineObj = parse(line);

		if (lineObj.type === SECTION) {
			currentObj = rootObj[lineObj.name] = {};
			return;
		}

		const firstEqual = line.indexOf('=');

		// key= value/list
		if (firstEqual > 0) {
			const [key, rawValue] = getKeyValue(line, firstEqual);

			if (isList(rawValue)) {
				currentObj[key] = parseToList(rawValue, true);
				currentList = rawValue.endsWith(']') ? null : currentObj[key];
			}
			else { // key=value
				currentObj[key] = normalizeValue(rawValue);
			}
		}
		// multiline list item, with or without closing bracket ]
		else if (currentList) {
			// List End
			if (line === ']') currentList = null;

			// List Continues (multiline)
			else currentList.push(...parseToList(line, false));
		}
	};
}

module.exports = getLineHandler;
