/**
 * Primary file for the API
 * 
 */

//Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config.js');
const fs = require('fs');
const handlers = require('./lib/handlers.js');
const helpers = require('./lib/helpers.js');

//Instantiate the http server.
let httpServer = http.createServer(function(req,res){
	unifiedServer(req,res);
});

//Start the server, and have it listen on port determined in config.
httpServer.listen(config.httpPort,function(){
	console.log("The server is listening on "+ config.httpPort + " in " + config.env + " mode.");
});

//Instantiate the https server
httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};

let httpsServer = https.createServer(httpsServerOptions,function(req,res){
	unifiedServer(req,res);
});

//Start https serer
httpsServer.listen(config.httpsPort,function(){
	console.log("The server is listening on "+ config.httpsPort + " in " + config.env + " mode.");
});

//All server logic for both the http and https server
let unifiedServer = function(req, res){

	//Get url and parse it
	let parsedUrl = url.parse(req.url,true);

	//Get path
	let path = parsedUrl.pathname;
	let trimmedPath = path.replace(/^\/+|\/+$/g,'');

	//Get the query string as an object
	let queryStringObject = parsedUrl.query;

	//Get the http method
	let method = req.method.toLowerCase();

	//Get the headers as an object
	let headers = req.headers;

	//Get payload if exists
	let decoder = new StringDecoder('utf-8');
	let buffer = '';

	req.on('data',function(data){
		buffer += decoder.write(data);
	});

	req.on('end',function(){
		buffer += decoder.end();

		//Choose handler. Redirect to not found if one isn't found
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Construct the data object to send to the handler
		let data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		};

		//Route the request to the specified router
		chosenHandler(data,function(statusCode,payload){
			//Either use status code called back by the handler or default to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			//Use the payload called back by handler or default to empty object.
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to a string
			let payloadString = JSON.stringify(payload);

			//Return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			//Log the request path
			console.log("Returning the response: %s, %s", statusCode, payloadString);
		});
	});
};

//Define a request router
let router = {
	'ping' : handlers.ping,
	'users' : handlers.users
};