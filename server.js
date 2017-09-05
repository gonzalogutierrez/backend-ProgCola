'use strict';

/* 
* Creating Nodejs PayPal Integration application
* @author Shashank Tiwari
*/


/*requiring node modules starts */
const app = require("express")();
const http = require('http').Server(app);
/*requiring node modules ends */

/* requiring config file starts*/
const config =require('./utils/config.js')(app);
/* requiring config file ends*/

/* requiring config db.js file starts*/
const db = require("./utils/db.js");


require('./utils/routes.js')(app);


http.listen(81,function(){
    console.log("Listening on http://127.0.0.1:81");
});