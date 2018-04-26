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

//Users - get
handlers.__users.get = function(data,callback){

};

//Users - put
handlers.__users.put = function(data,callback){

};

//Users - delete
handlers.__users.delete = function(data,callback){

};

module.exports = handlers;