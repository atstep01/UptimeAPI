/**
 *
 *Request handlers
 * 
 */

//Dependencies
const __data = require('./data.js');
const helpers = require('./helpers.js');

//Define handlers
let handlers = {};

//Not found handler
handlers.notFound = function(data, callback){
	callback(404);
};

//Ping handler
handlers.ping = function(data, callback){
	callback(200);
};

handlers.users = function(data, callback){

	let acceptableMathods = ['post', 'get', 'put', 'delete'];

	if(acceptableMathods.indexOf(data.method) > -1 )
	{
		handlers.__users[data.method](data,callback);
	
	} else {

		callback(405);
	}
};

//Container for users submethods

handlers.__users = {};

//Users - post
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data: none
handlers.__users.post = function(data,callback){

	//Check that all required field are filled out
	let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if(firstName && lastName && phone && password && tosAgreement){

		//Check to see if user exists already
		__data.read('users', phone, function(err,data){
			if(err){

				//Hash the password
				let hashedPassword = helpers.hash(password);

				// Create the user object
				if(hashedPassword){
					let userObject = {

						'firstName' : firstName,
						'lastName' : lastName,
						'phone' : phone,
						'hashedPassword' : hashedPassword,
						'tosAgreement' : true
					};

					//Store the user 
					__data.create('users',phone,userObject,function(err){

						if(!err){

							callback(200);

						} else { 

							console.log(err);
							callback(500,{'Error' : 'Could not create the new user'});
						}
					});
				} else {

					callback(500, {'Error' : 'Could not hash the user password'});
				}
				

			} else {

				//User already exists
				callback(400,{'Error' : 'A user with that phone number already exists'});
			}
		});

	} else {

		callback(404,{'Error' : 'Missing required fields'})
	}
};

// Users - get
// Required Data: phone
// Optional Data: none
// @TODO only let authenticated users access their own objects
handlers.__users.get = function(data,callback){

	//Check if phone number is valid
	let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone){
		//Lookup the user
		__data.read('users', phone, function(err,data){

			if(!err && data){

				// Remove hashed password from user object before returning
				delete data.hashedPassword;
				callback(200,data);


			} else {

				callback(404);
			}
		});
	} else {

		callback(400, {'Error' : 'Missing required field'});
	}


};

//Users - put
//Required data: phone
//Optional data: first, last name, password (at least one most be specified)
// @TODO only let authenticated user update their own object.
handlers.__users.put = function(data,callback){

	//Check for required field
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

	//Check for optional fields
	let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	
	if(phone){

		if(firstName || lastName || password){

			//lookup user
			__data.read('users', phone, function(err, userData){
				if(!err && userData){

					//update necessary fields
					if(firstName){

						userData.firstName = firstName;

					} else if (lastName) {

						userData.lastName = lastName;

					} else {

						userData.password = helpers.hash(password);
					}
					//Store updated profile
					__data.update('users', phone, userData, function(err){
						if(!err){
							callback(200);
						} else {

							console.log(err);
							callback(500, {'Error' : 'Could not update the user'});
						}
					});

				} else {

					callback(400, {'Error' : 'The specified user does not exist'});
				}
			});

		} else {

			callback(400, {'Error' : 'Missing required fields'});
		}

	} else {

		callback(400, {'Error' : 'Missing required fields'});
	}
};

// Users - delete
// Required data: phone
// @TODO only let an authenticated user delete his own object. 
// @TODO clean up any other data files associated with this user
handlers.__users.delete = function(data,callback){

	//Check if phone number is valid
	let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

	if(phone){
		//Lookup the user
		__data.read('users', phone, function(err,data){

			if(!err && data){

				//Delete user
				__data.delete('users', phone, function(err){

					if(!err){

						callback(200);

					} else { 

						callback(500, {'Error' : 'Could not delete the specified user'});
					}
				});

			} else {

				callback(400, {'Error' : 'Could not find the specified user'});
			}
		});
	} else {

		callback(400, {'Error' : 'Missing required field'});
	}

};

handlers.tokens = function(data, callback){

	let acceptableMathods = ['post', 'get', 'put', 'delete'];

	if(acceptableMathods.indexOf(data.method) > -1 )
	{
		handlers.__tokens[data.method](data,callback);
	
	} else {

		callback(405);
	}
};

//Make tokens subcontainer
handlers.__tokens = {};

// tokens - post
// Required data: phone, password
// Optional data: none
handlers.__tokens.post = function(data, callback){

	//check for required fields
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if(phone && password){

		//lookup user who matches phone 
		__data.read('users', phone, function(err, userData){
			if(!err && userData){

				//hash sent password and compare it to userData password.
				let hashedPassword = helpers.hash(password);

				if(hashedPassword == userData.hashedPassword){
					// create token with random name that expires one hour in the future.
					let tokenId = helpers.createRandomString(20);

					//hour in milliseconds = 3600000
					let expires = Date.now() + 3600000;

					let tokenObj = {
						'phone': phone,
						'Id' : tokenId,
						'expires' : expires
					}

					//Store token
					__data.create('tokens', tokenId, tokenObj, function(err){

						if(!err){

							callback(200, tokenObj);

						} else {

							callback(500, {'Error' : 'Unable to store token'});
						}

					});

				} else {

					callback(400, {'Error' : 'Incorrect Password'});
				}

			} else {

				callback(400, {'Error' : 'User not found'});
			}
		});

	} else {

		callback(400, {'Error' : 'Missing required fields'});
	}
};

// tokens - get
// Required data: Id
// Optional data: none
handlers.__tokens.get = function(data, callback){

	//validate Id
	let Id = typeof(data.queryStringObject.Id) == 'string' && data.queryStringObject.Id.trim().length == 20 ? data.queryStringObject.Id.trim() : false;

	if(Id){
		//Lookup the user
		__data.read('tokens', Id, function(err,tokenData){

			if(!err && tokenData){

				callback(200, tokenData);

			} else {

				callback(404);
			}
		});
	} else {

		callback(400, {'Error' : 'Missing required field'});
	}
};

// tokens - put
// Required data: Id, extend
// Optional data: none
handlers.__tokens.put = function(data,callback){

	let Id = typeof(data.payload.Id) == 'string' && data.payload.Id.trim().length == 20 ? data.payload.Id.trim() : false;
	let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

	console.log("Id: %s", Id);
	console.log("Extend: " + extend)

	if(Id && extend){

		//Lookup the user
		__data.read('tokens', Id, function(err,tokenData){

			if(!err && tokenData){

				//check to see if token is still active
				if(tokenData.expires > Date.now()){

					tokenData.expires += 3600000;

					//Store new expiration time
					__data.update('tokens', Id, tokenData, function(err){
						if(!err){
							callback(200, tokenData);
						} else {
							callback(500, {'Error' : 'Could not store updated token expiration'});
						}
					});

				} else {

					callback(400, {'Error' : 'Token has already expired'});
				}
				

			} else {

				callback(400, {'Error' : 'Can not find token'});
			}
		});

	} else {

		callback(400, {'Error' : 'Missing required fields'})
	}
};

// tokens - delete
// Required data: Id
// Optional data: none
handlers.__tokens.delete = function(data, callback){

	//Check if Id is valid
	let Id = typeof(data.queryStringObject.Id) == 'string' && data.queryStringObject.Id.trim().length == 20 ? data.queryStringObject.Id.trim() : false;

	if(Id){
		//Lookup the user
		__data.read('tokens', Id, function(err,tokenData){

			if(!err && tokenData){

				//Delete user
				__data.delete('tokens', Id, function(err){

					if(!err){

						callback(200);

					} else { 

						callback(500, {'Error' : 'Could not delete the specified token'});
					}
				});

			} else {

				callback(400, {'Error' : 'Could not find the specified token'});
			}
		});
	} else {

		callback(400, {'Error' : 'Missing required field'});
	}

};

module.exports = handlers;