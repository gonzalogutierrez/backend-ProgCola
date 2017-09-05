"use_strict";

/* 
* Creating Nodejs PayPal Integration application
* @author Shashank Tiwari
*/

const express = require("express");
const path= require('path'); 

const method=config.prototype;

function config(app){
    
    // Set .html as the default template extension
	app.set('view engine', 'ejs');

	// Initialize the ejs template engine
	app.engine('html', require('ejs').renderFile);

	// Tell express where it can find the templates
	app.set('views', (__dirname + '/../views'));
	//app.set('views', path.join(__dirname, '../views/'));
	//app.set('views','./views');

	// Make the files in the public folder available to the world
	app.use(express.static(path.join('publicData')));
	
	
}

method.get_config=function(){
	return this;
}

module.exports = config;