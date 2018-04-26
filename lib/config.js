/**
 *Create and export configuration variables.
 * 
 */

let environments = {};

//Default to staging
environments.STG = {
	'httpPort': 3000,
	'httpsPort': 3001,
	'env': 'STG',
	'hashingSecret' : 'thisIsASecret'
};

environments.PRD = {
	'httpPort': 5000,
	'httpPort': 5001,
	'env': 'PRD',
	'hashingSecret' : 'thisIsAlsoASecret'
};

//Determine which environment was passed as a command-line argument
let currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//Check to see if env exists
let envToExport = typeof(environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.STG;

//Export the module
module.exports = envToExport;