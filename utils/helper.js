"use_strict";

/* 
* Creating Nodejs PayPal Integration application
* @author Shashank Tiwari
*/

const Mongodb = require("./db");
const paypal = require('paypal-rest-sdk');
// paypal auth configuration
var config = {
  "port" : 5000,
  "api" : {
    "host" : "api.sandbox.paypal.com",
    "port" : "",            
    "client_id" : "ASK9r2IpBrWtsSKsEOhGyDp9bcvrSfPUcK50lLDuawBpySYnk6u5JWRkS7yCFu_Y0vjK7p0pKoi4teR2",  // your paypal application client id
    "client_secret" : "EFUsldcxJfNy7P1LQMar1UY59mhpCmeSwJ10GDnsLyc8UY7fwvq_JQG_GQ0Rb9oFY8CPl6D5Q3dfl393" // your paypal application secret id
  }
}
paypal.configure(config.api);

const self={
    isUserExists:function(data,callback){
    	var response={};
		Mongodb.onConnect(function(db,ObjectID){
			db.collection('users').findOne(data,function(err, result){
				if(result != null ){
					response.process = "success";
					response.isUserExists = true;				
					response.id = result._id;
					response.name = result.name;
				}else{
					response.process = "failed";
					response.isUserExists = false;
				}					
				callback(response);
			});
		});
	},
	insertPayment:function(data,callback){
		var response={};
		Mongodb.onConnect(function(db,ObjectID){
			db.collection('payments').insertOne(data,function(err, result) {
				if(err){
					response.isPaymentAdded = false;
					response.message = "Something went Wrong,try after sometime.";
				}else{
					response.isPaymentAdded = true;
					response.id=result.ops[0]._id;
					response.message = "Payment added.";
				}
				callback(response);	
			});
		});
	},	
	getProductInfo:function(data,callback){
		var response={};
		Mongodb.onConnect(function(db,ObjectID){
			data._id = new ObjectID(data._id);
			db.collection('project').findOne(data,function(err, result){						

				if(result != null ){
					response.error = false;
					response.data = result;
				}else{
					response.error = true;
				}	
				callback(response);
			});
		});
	},
	getAllProducts:function(data,callback){
		Mongodb.onConnect(function(db,ObjectID){
			db.collection('project').find().toArray(function(err, result){
				callback(result);
				db.close();
			});
		});
	},
	payNow:function(paymentData,callback){
		var response ={};

		/* Creating Payment JSON for Paypal starts */
		const payment = {
			"intent": "authorize",
			"payer": {
				"payment_method": "paypal"
			},
			"redirect_urls": {
				"return_url": "http://127.0.0.1:4200/execute",
				"cancel_url": "http://127.0.0.1:4200/cancel"
			},
			"transactions": [{
				"amount": {
					"total": paymentData.data.price,
					"currency": "USD"
				},
				"description": paymentData.data.productName
			}]
		};
		/* Creating Payment JSON for Paypal ends */

		/* Creating Paypal Payment for Paypal starts */
		paypal.payment.create(payment, function (error, payment) {
			if (error) {
				console.log(error);
			} else {
		    	if(payment.payer.payment_method === 'paypal') {
		    		response.paymentId = payment.id;
		    		var redirectUrl;
		    		response.payment = payment;
		    		for(var i=0; i < payment.links.length; i++) {
		    			var link = payment.links[i];
		    			if (link.method === 'REDIRECT') {
		    				redirectUrl = link.href;
		    			}
		    		}
		    		response.redirectUrl = redirectUrl;
		    	}
		    }
		    /* 
		    * Sending Back Paypal Payment response 
		    */
		    callback(error,response);
		});
		/* Creating Paypal Payment for Paypal ends */		
	},
	getResponse:function(data,PayerID,callback){

		var response = {};
		
		const serverAmount = parseFloat(data.paypalData.payment.transactions[0].amount.total);
		const clientAmount = parseFloat(data.clientData.price);
		const paymentId = data.paypalData.paymentId;
		const details = {
			"payer_id": PayerID 
		};

		response.userData= {
			userID : data.sessionData.userID,
			name : data.sessionData.name
		};

		if (serverAmount !== clientAmount) {
			response.error = true;
			response.message = "Payment amount doesn't matched.";
			callback(response);
		} else{
			
			paypal.payment.execute(paymentId, details, function (error, payment) {
				if (error) {
					console.log(error);
					response.error = false;
					response.message = "Payment Successful.";
					callback(response);
				} else {

					/*
					* inserting paypal Payment in DB
					*/

					const insertPayment={
					    userId : data.sessionData.userID,
					    paymentId : paymentId,
					    createTime : payment.create_time,
					    state : payment.state,
					    currency : "USD",
					    amount: serverAmount,
					    createAt : new Date().toISOString()
					}

					self.insertPayment(insertPayment,function(result){

						if(! result.isPaymentAdded){
							response.error = true;
							response.message = "Payment Successful, but not stored.";
							callback(response);
						}else{
							response.error = false;
							response.message = "Payment Successful.";
							callback(response);
						};
					});
				};
			});
		};
    }
}
module.exports = self;