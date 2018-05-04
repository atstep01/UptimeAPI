/**
 *
 * Helpers for various tasks
 * 
 */

//Dependencies
const crypto = require('crypto');
const config = require('./config')

//Container for all the helpers
let helpers = {};

helpers.hash = function(str){
	if(typeof(str) == 'string' && str.length > 0) {

		let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;

	} else {

		return false;
	}
};

//Parse a JSON string to an object in all cases without throwing 
helpers.parseJsonObject = function(str){
	try{

		let obj = JSON.parse(str);
		return obj;

	} catch(e) {

		return {};
	}
}; 

//create a string of random characters with a given length;
helpers.createRandomString = function(strLength){

	strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

	if(strLength){

		//Define all possible characters that could go into a string
		let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

		let str = ""
		for(i = 0; i < strLength; i++){

			str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
		}

		return str;

	} else {

		return false;
	}
};

//Export the module
module.exports = helpers;