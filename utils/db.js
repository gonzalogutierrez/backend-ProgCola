"use_strict";

/* 
* Creating Nodejs PayPal Integration application
* @author Shashank Tiwari
*/

/*requiring mongodb node modules */
const  mongodb=require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const assert = require('assert');
const MongoUrl='mongodb://localhost:27017/dbProgramacionColaborativa';
//const MongoUrl='mongodb://ds115214.mlab.com:15214/dbprogramacioncolaborativa';

module.exports.onConnect = function(callback){    
    MongoClient.connect(MongoUrl, function(err, db) {
		assert.equal(null, err);
		callback(db,ObjectID);
	});
}