// List of currently supported modifiers
const transformers = {
    'b':"background",
    'c':"crop",
    'e':"embed",
    'h':"height",
    'q':"quality",
    'r':"rotate",
    's':"ratio",
    'w':"width"
};


const transformersReverse = {};

for (const k in transformers) {
	transformersReverse[transformers[k]] = k;
}

/*
Parse path and sort params
This function takes path in the form

/file_guid,param1_value1,param2_value2,param3_value3.fileExtension,

where param can be a-zA-Z0-9 and value can be a-zA-Z0-9 and . (dot)
and extention can be a-zA-Z (not, numbers are not currently supported in extentions)
Example:
/grandmother,w_600,h_800.jpeg

the output is an object in the form:
{
  guid: file_guid,
  param1: value1,
  param2: value2,
  param2: value3
  format: fileExtension
}
*/
export default (path) => {
console.log('path',path);
	// const params = path.match(/([a-zA-Z0-9]*_[a-zA-Z\d.]*)([^,/.a-zA-Z]+)/g) || [];
    const params = path.match(/([a-z]*_[a-zA-Z.]*)([^,/.]+)/g) || [];
	const guidRegex = /\/([a-zA-Z\d-]*)[,|.]/g;
	const fileFormatRegex = /\.([a-zA-Z\d]*)$/g;
	const guidArr = guidRegex.exec(path);
	const fileFormatArr = fileFormatRegex.exec(path);
	let guid = null;

	if (guidArr && guidArr.length > 1) {
		guid = guidArr[1];
	}
	let format = null;

	if (fileFormatArr && fileFormatArr.length > 1) {
		format = fileFormatArr[1];
	}
console.log('pre-parsed params',params);
	const paramsArr = params.map((param) => {
		const keyValueArr = param.split('_');
		if(!transformers[keyValueArr[0]]){
			console.log('transformer not found', keyValueArr[0], transformers[keyValueArr[0]]);
			console.log('transformer not found had value', keyValueArr[1]);
		}
		return { name: transformers[keyValueArr[0]] || false, value: keyValueArr[1] };
	});
console.log('parsed paramsArr',paramsArr);
	const paramsObj = Object.assign(
    { guid, format },
    ...paramsArr.map(({ name, value }) => (name ? { [name]: value } : null)),
  );
console.log('parsed paramsObj',paramsObj);
	return Object.keys(paramsObj).sort().reduce((result, key) => {
		result[key] = paramsObj[key];

		return result;
	}, {});
};

export const paramsToPathString = (params) => {
	const newParams = [];

	for (const key in params) {
		const value = params[key];

		if (key === 'format' || key === 'guid') {
			continue;
		}
		newParams.push([transformersReverse[key], value].join('_'));
	}

	newParams.sort();

	return newParams.join(',');
};

