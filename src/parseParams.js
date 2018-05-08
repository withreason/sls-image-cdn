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

const PARAM_PATTERN_STR = ',([a-z]+)_([a-zA-Z0-9.]+)';
const PARAM_PATTERN = new RegExp(PARAM_PATTERN_STR);
const PARAM_PATTERN_GLOBAL = new RegExp(PARAM_PATTERN_STR, 'g');

const KEY_PATTERN_STR = '(.+?)';
const FORMAT_PATTERN_STR = '\\.([a-zA-Z\\d]*)';
const PATH_PATTERN = new RegExp(`^${KEY_PATTERN_STR}((${PARAM_PATTERN_STR})*)${FORMAT_PATTERN_STR}$`);

/*
Parse path and sort params
This function takes path in the form

/file_key,param1_value1,param2_value2,param3_value3.fileExtension,

where param can be a-zA-Z0-9 and value can be a-zA-Z0-9 and . (dot)
and extension can be a-zA-Z0-9
Example:
/grandmother,w_600,h_800.jpeg

the output is an object in the form:
{
  key: file_key,
  param1: value1,
  param2: value2,
  param2: value3
  format: fileExtension
}
*/
export default (path) => {
	const groups = path.match(PATH_PATTERN);
	if (!groups) {
    console.error(`The path ${path} did not conform to the path patten and could not be parsed`);
    return {};
  }
	const key = groups[1];
  const params = groups[2];
  const format = groups[6];

  const splitParams = params.match(PARAM_PATTERN_GLOBAL);
  const paramsArr = [];
  if (splitParams) {
    for (let i = 0; i < splitParams.length; i++) {
      const splitParam = splitParams[i].match(PARAM_PATTERN);
      const paramShortName = splitParam[1];
      const value = splitParam[2];

      const name = transformers[paramShortName] || false;
      if(!name){
        console.error('transformer not found', paramShortName, transformers[paramShortName]);
        console.error('transformer not found had value', value);
      }
      paramsArr.push({ name, value });
    }
  }

	return Object.assign({ key, format },
    ...paramsArr.map(({ name, value }) => (name ? { [name]: value } : null)),
  );
};

export class UnknownParamError extends Error {
  constructor(name) {
    super(`the parameter name ${name} is not known`);
    this.name = this.constructor.name;
  }
}

export const paramsToPathString = (params) => {
	const newParams = [];

	for (const key in params) {
		if (key === 'format' || key === 'key') {
			continue;
		}
		if (!transformersReverse[key]) {
		  throw new UnknownParamError(key);
    }
    const value = params[key];
		newParams.push([transformersReverse[key], value].join('_'));
	}
	newParams.sort();
	return newParams.join(',');
};

