'use strict';
const bodyParser = require('body-parser');
var Session = require('express-session');
var cors = require('cors');

var Session = Session({
    secret:'secrettokenhere',
    saveUninitialized: true,
	resave: true
});
const helper = require('./helper');

var method=routes.prototype;

function routes(app){
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(Session);	
	var sessionInfo;


	/*
    * Rendering login page
    */
	app.get('/', function(req, res){
		sessionInfo = req.session;
		if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.render("index");
		}else{
			res.redirect("/home");
			res.end();
		}		
	});
	
	app.options('/login', cors())
	app.post('/login', cors(), function (req,res){
		
		sessionInfo = req.session;

		const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const email = req.body.email;
		const password = req.body.password;
		
		console.log(req.body.email);

		var response = {};

		if(! regEx.test(email)){
			res.status(400).json({
				data: "Email invalido."
			});
		}else{
			const data={
				"email" : req.body.email,
				"password" : req.body.password
			}		

			helper.isUserExists(data,function(result){

				if(result.isUserExists === true){

					/*
					* Storing data into Session
					*/ 
					sessionInfo.sessionData = {
						userID:result.id,
						name:result.name,
					};
					res.status(200).json({
						data: result
					});
				}else{
					res.status(400).json({
					data: result
				});
				}			
			});
		}
    
	});

	/*
    * performing login operation
    */
	/*app.post('/login', function(req, res){
		sessionInfo = req.session;

		const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		const email = req.body.email;
		const password = req.body.password;

		var response = {};

		if(! regEx.test(email)){
			response.process = false;
			response.message = "Enter valid Email.";
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(JSON.stringify(result));
		}else{
			const data={
				"email" : req.body.email,
				"password" : req.body.password
			}		

			helper.isUserExists(data,function(result){

				if(result.isUserExists === true){

				
					sessionInfo.sessionData = {
						userID:result.id,
						name:result.name,
					};
				}
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end(JSON.stringify(result));			
			});
		}
	});*/

	app.options('/home', cors())
	app.get('/home',cors(),function(req, res){
		//sessionInfo = req.session;
		/*if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{*/
			var response ={};
		    const data={
				_id : sessionInfo.sessionData.userID
			};

			/*
			* Fetching products and showing onto home page 
			*/

			helper.getAllProducts(data,function(products){
				response.products = products;
				response.userData = {
					name : sessionInfo.sessionData.name
				};
				res.status(200).json({
					data: response
					});
			});
		//}		
	});

	app.options('/paynow', cors())
	app.post('/paynow',cors(),function(req, res){
		/*sessionInfo = req.session;
		if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{*/
			const data ={
				userID : sessionInfo.sessionData.userID,
				data : req.body
			}
			/*
			* call to paynow helper method to call paypal sdk
			*/
			helper.payNow(data,function(error,result){
				if(error){
					/*res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end(JSON.stringify(error));*/
					res.status(400).json({
					data: error
					});
					
				}else{
					sessionInfo.paypalData = result;
					sessionInfo.clientData = req.body;
					//res.redirect(result.redirectUrl);
					res.status(200).json({
						data: result
					});
				}				
			});			
		//}	
	});

	/*
	* payment success url 
	*/
	app.options('/execute', cors())
	app.get('/execute',cors(),function(req, res){		
		sessionInfo = req.session;	
		var response = {};
		const PayerID = req.query.PayerID;
		/*if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{*/
			sessionInfo.state ="success";
			helper.getResponse(sessionInfo,PayerID,function(response) {
					/*res.render('executePayment',{
					response : response
					});*/
					res.status(200).json({
						data: response
					});
			});
		//};
	});

	/*
	* payment cancel url 
	*/
	app.options('/cancel', cors())
	app.get('/cancel',cors(),function(req, res){
		//sessionInfo = req.session;
		/*if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
			res.redirect("/");
			res.end();
		} else{*/
			var response ={};
			response.error = true;
			response.message = "Payment unsuccessful.";
			response.userData = {
				name : sessionInfo.sessionData.name
			};
							
			/*res.render('executePayment',{
				response : response
			});*/
			res.status(200).json({
						data: response
					});
		//}
	});

	app.get('/logout',function(req, res){
		req.session.sessionData = ""; 		
		res.redirect("/");
	});


}

method.getroutes=function(){
	return this;
}

module.exports = routes;