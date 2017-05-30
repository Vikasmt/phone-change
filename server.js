var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
var jwt = require('jsonwebtoken');
var config = require('./config');
var pg = require('pg');

/******************EMAIL Variables*************************/
var emailhost = 'smtp.gmail.com';
var emailport = 465;
var emailsecure = true;
var emailuser = 'fmanotify@gmail.com';
var emailpassword = 'mttl@123';
/************************END*******************************/


var app = express();

app.use(express.static('public'));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.raw({limit: "50mb", type: '*/*' }));

app.set('port', process.env.PORT || 5000);
app.set('secretKey', config.secret);

var router = express.Router();  

var baseUrl='https://phone-change-con.herokuapp.com/';

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.get('/ValidateAdminPortal', function(req, res) {
    var emailaddress = req.headers.email.toLowerCase().trim();
    var password = req.headers.password;
    console.log(emailaddress);
    console.log(password);
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT um.id, um.firstname, um.lastname, um.username, um.email, um.phone, um.language, um.country, sc.sfid from UserManagement um, Salesforce.Contact sc where um.email=\''+emailaddress+'\' and um.role=\'A\'',
             function(err,result){
              if (err != null || result.rowCount == 0) {
                   return  res.json({
                            userid: -1,
                            firstname:'',
                            lastname:'',
                            username:'',
			    uhrkid:'',
			    language:'',
			    country:'',
			    alertmessage:'Please enter the admin credentials',
                            msgid: 2,
                            message: 'Invalid email.'});
                }
                 else{
                       conn.query(
                            'SELECT um.id, um.firstname, um.lastname, um.username, um.email, um.phone, um.active, um.language, um.country, sc.sfid from UserManagement um, Salesforce.Contact sc where um.email=\''+emailaddress+'\' and um.password=\''+password+'\' and um.role=\'A\' and um.contactid=sc.id',
                           function(err,result){
                               done();
                               if(err != null || result.rowCount == 0){
                                   return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
					   language:'',
			                   country:'',
                                           msgid: 3,
                                           message: 'Invalid password.'});
                               }
                               else if(result.rows[0].active == false){
                                  return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
					   language:'',
			                   country:'',
                                           msgid: 4,
                                           message: 'User is inactive.'}); 
                               }
                               else if(result.rows[0].sfid == null || result.rows[0].sfid.length == 0){
                                  return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
					   language:'',
			                   country:'',
                                           msgid: 4,
                                           message: 'User is not synced. Please wait...'}); 
                               }
                               else{
                                    var token = {};
                                    token.userid = result.rows[0].sfid;
                                    token.firstname = result.rows[0].firstname;
                                    token.lastname = result.rows[0].lastname;
                                    token.username = result.rows[0].email;
                                    token.uhrkid = result.rows[0].id;
                                    token.language = result.rows[0].language;
                                    token.country = result.rows[0].country;
                                   
                                   var rawtoken = jwt.sign(token, app.get('secretKey'), {
					                       expiresIn: 86400 // expires in 24 hours
                                    });
                                   
                                  return res.json({
                                            token: rawtoken,
                                            uhrkid: result.rows[0].id,
                                            userid: result.rows[0].sfid,
					    alertmessage:'You have logged in successfully',
                                            msgid: 1,
                                            message: 'Success.'});
                               }
                            });
                 }
             });
     });
});


router.get('/ValidateAdmin', function(req, res) {
    var emailaddress = req.headers.email.toLowerCase().trim();
    var password = req.headers.password;
    console.log(emailaddress);
    console.log(password);
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT um.id, um.firstname, um.lastname, um.username, um.email, um.phone, um.language, um.country, sc.sfid from UserManagement um, Salesforce.Contact sc where um.email=\''+emailaddress+'\'',
	      function(err,result){
              if (err != null || result.rowCount == 0) {
                   return  res.json({
                            userid: -1,
                            firstname:'',
                            lastname:'',
                            username:'',
			    uhrkid:'',
			    language:'',
			    country:'',
                            msgid: 2,
                            message: 'Invalid email.'});
                }
                 else{
                       conn.query(
                            'SELECT um.id, um.firstname, um.lastname, um.username, um.email, um.phone, um.active, um.language, um.country, sc.sfid from UserManagement um, Salesforce.Contact sc where um.email=\''+emailaddress+'\' and um.password=\''+password+'\' and um.contactid=sc.id',
                           function(err,result){
                               done();
                               if(err != null || result.rowCount == 0){
                                   return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
					   language:'',
			                   country:'',
                                           msgid: 3,
                                           message: 'Invalid password.'});
                               }
                               else if(result.rows[0].active == false){
                                  return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
					   language:'',
			                   country:'',
                                           msgid: 4,
                                           message: 'User is inactive.'}); 
                               }
                               else if(result.rows[0].sfid == null || result.rows[0].sfid.length == 0){
                                  return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
					   language:'',
			                   country:'',
                                           msgid: 4,
                                           message: 'User is not synced. Please wait...'}); 
                               }
                               else{
                                    var token = {};
                                    token.userid = result.rows[0].sfid;
                                    token.firstname = result.rows[0].firstname;
                                    token.lastname = result.rows[0].lastname;
                                    token.username = result.rows[0].email;
                                    token.uhrkid = result.rows[0].id;
                                    token.language = result.rows[0].language;
                                    token.country = result.rows[0].country;
                                   
                                   var rawtoken = jwt.sign(token, app.get('secretKey'), {
					                       expiresIn: 86400 // expires in 24 hours
                                    });
                                   
                                  return res.json({
                                            token: rawtoken,
                                            uhrkid: result.rows[0].id,
                                            userid: result.rows[0].sfid,
                                            msgid: 1,
                                            message: 'Success.'});
                               }
                            });
                 }
             });
     });
});

router.get('/getProducts', function(req, res) {
	var type;
    if(req.param('producttype') === 'Medical') type = 'Medical Device';
	if(req.param('producttype') === 'Combination') type = 'Combination Product';
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT sfid, Name, Productcode__c, Product_Type__c, Type__c, Product_Description__c, Product_Italy_Description__c, Serial_Batch_code__c, Serial_Batch_code_format__c, Serial_Batch_code_contains__c, BrandingColor__c, Formulation_Dosage__c FROM salesforce.FMA_Product__c WHERE Type__c=\''+type+'\' and Name IN (\''+'RebiSmart'+'\', \''+'EasyPod'+'\')',
            function(err,result){
                done();
                if(err){
                   return res.status(400).json({error: err.message});
                }
                else{                    
                    for(var i=0; i<result.rows.length; i++){
                        result.rows[i].imageUrl = baseUrl + 'api/showImage?imageid='+result.rows[i].sfid+'&fromloc=Product';
                    }
                    return res.json(result.rows);
                }
            });
     });
});

/*router.put('/forgotPassword', function(req,res){
    var emailAddress = req.param('email').trim();
    console.log(emailAddress);
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT id, firstname, lastname, username, email, phone from UserManagement where trim(email)=\''+emailAddress+'\'',
             function(err,result){
		  done();
		  if (result.rowCount == 0) {
                             return  res.json({
                                      msgid: -1,
                                      message: 'Invalid Username/Email.'});
                   }
                
                   if(err){
                      res.status(400).json({error: 'Email not found.'});
                    }
		
                else{
                    var resetPassword = randomstring.generate(12);
                    var queryStr = 'Update UserManagement set password=\''+resetPassword+'\' where trim(email)=\''+emailAddress+'\'';
                    console.log(queryStr);
                    
                    conn.query(queryStr, 
                        function(err,result){
                        done();
                        if(err){
                            return res.status(400).json({error: err.message});
                        }
                        else{
                            var subject = 'FMA - Finished Reset Password';
                            var text = 'Merck Feedback Managemant App recently received a request to reset the password.\n\nUsername/Email: '+emailAddress+' \n\ncurrent password :  '+resetPassword+' \n\n Thanks';
                            var resultStr = sendEmail(emailAddress, subject, text);
                            return res.json({
                                            msgid: 1,
                                            message: 'Success.'});
                        }
                    });
                }
            });
     });
});*/

router.put('/forgotPassword', function(req,res){
    var emailAddress = req.param('email').trim();
    console.log(emailAddress);
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT id, firstname, lastname, username, email, phone from UserManagement where trim(email)=\''+emailAddress+'\'',
             function(err,result){
		  done();
		  if (result.rowCount == 0) {
                             return  res.json({
                                      msgid: -1,
                                      message: 'Invalid Username/Email.'});
                   }
                
                   if(err){
                      res.status(400).json({error: 'Email not found.'});
                    }
		
                else{
                    var resetPassword = randomstring.generate(12);
                    var queryStr = 'Update UserManagement set password=\''+resetPassword+'\' where trim(email)=\''+emailAddress+'\'';
                    console.log(queryStr);
                    
                    conn.query(queryStr, 
                        function(err,result){
                        done();
                        if(err){
                            return res.status(400).json({error: err.message});
                        }
                        else{
							var queryStrCon = 'Update salesforce.contact set IVOPPassword__c=\''+resetPassword+'\' , IVOPPasswordStatus__c=\''+'Reset'+'\' where trim(email)=\''+emailAddress+'\'';
							console.log(queryStrCon);
							
							conn.query(queryStrCon, 
								function(err,result){
								done();
								if(err){
									return res.status(400).json({error: err.message});
								}
								else{
									var subject = 'IVOP - Finished Reset Password';
									var text = 'Merck iVOP App recently received a request to reset the password.\n\nUsername/Email: '+emailAddress+' \n\nNew Password :  '+resetPassword+' \n\n Thanks';
									var resultStr = sendEmail(emailAddress, subject, text);
									return res.json({
													msgid: 1,
													message: 'Success.'});
								}
							});
                        }
                    });
                }
            });
     });
});

router.get('/showImage', function(req, res) {
    var imageid = req.param('imageid');
    var fromLoc = req.param('fromloc');
    console.log('ImageId:'+imageid);
    
    var query = '';
        if(fromLoc == "Product"){
            query = 'SELECT *FROM productattachment WHERE sfdcproductid = \''+imageid+'\'';
        }else{
            query = 'SELECT *FROM caseattachment WHERE id = '+imageid+'';
        }
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(query,
            function(err,result){
                done();
                if (err != null || result.rowCount == 0) {
                   return res.json({
                            userid: -1,
                            msgid: 2,
                            message: 'Invalid id.'});
                }
                else{
                    var contenttype = result.rows[0].contenttype;
                    contenttype = contenttype.replace('"','').replace('"','');
                    //contenttype = contenttype.replace('"','');
                    console.log(contenttype);
                    var img = new Buffer(result.rows[0].body, 'base64');
                    res.writeHead(200, {
                     'Content-Type': contenttype,
                     'Content-Length': img.length
                   });
                    res.end(img);
                }
            });
    });
});

router.get('/getDisclaimercontent', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT id, country, language, content from disclaimercontent',
            function(err,result){
                done();
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
                }
            });
    });
});

router.get('/getHelpcontent', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT id, eng_question, eng_answer, ita_question, ita_answer, email, helpcontactnum from Helpcontent',
            function(err,result){
                done();
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
                }
            });
    });
});

router.post('/productImageSync', function(req, res) {
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    console.log('Body:'+data);
    var splitteddata=data.replace("{","").replace("}","").split(',');
    var filename = splitteddata[0];
    var sfdcproductid = splitteddata[1];
    var contenttype = splitteddata[2];
    var imagedata = splitteddata[3];
    
    console.log(filename);
    console.log(sfdcproductid);
    console.log(contenttype);
    
    var getPoductIDQuery = 'SELECT id from salesforce.FMA_Product__c WHERE sfid='+sfdcproductid+'';
    console.log('getPoductIDQuery:'+getPoductIDQuery);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
       if (err) console.log(err);
        conn.query('SELECT id from salesforce.FMA_Product__c WHERE sfid='+sfdcproductid+'',
           function(err,result){
            if (err != null || result.rowCount == 0) {
                return res.json({
                        msgid: 2,
                        message: 'product id not found.'});
            }else{
                var productId = result.rows[0].id;
                console.log(productId);
                
                conn.query('SELECT id, sfdcproductid from productattachment WHERE sfdcproductid='+sfdcproductid+'',
                        function(err,result){
                            if (err != null || result.rowCount == 0){
                                conn.query('INSERT INTO productattachment (name, contenttype, sfdcproductid, herokuproductid, body) VALUES ('+filename+', '+contenttype+', '+sfdcproductid+', '+productId+', '+imagedata+')',
                                    function(err,result){
                                        if(err){
                                            return res.json({
                                                msgid: 2,
                                                message: err});
                                            }else {
                                                return res.json({
                                                    msgid: 1,
                                                    message: 'Success.'});
                                            }
                                    });
                            }else{
                                conn.query('UPDATE productattachment SET body='+imagedata+', name='+filename+', contenttype='+contenttype+' WHERE sfdcproductid='+sfdcproductid+'',
                                    function(err,result){
                                     if(err){
                                            return res.json({
                                                msgid: 2,
                                                message: err});
                                        }else {
                                            return res.json({
                                                msgid: 1,
                                                message: 'Success.'});
                                        }
                                });
                            }
                    });
            }
        });
    });
});

router.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['token'];
	
    // decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('secretKey'), function(err, decoded) {			
			if (err) {
				return res.json({ msgid: 5, success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
            msgid: 0,
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});


router.post('/insertNeedleIssue', function(req, res) {
    console.log('............insertDecisiontree...............');   
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);       
       
        var jsonData = req.body;
        console.log('.....req..body......'+req.body);
        conn.query('SELECT *from salesforce.Case WHERE id='+jsonData.caseid+'',
        function(err,result){
          if (err != null || result.rowCount == 0){
                          return res.json({
                                    caseid: -1,
                                    msgid: 2,
                                    message: 'case id not found.'});
          }else{
            
            var updateValueData = '';
            var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
            var valuesData=' VALUES ('; 
                
            if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0){
                   insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ',';
                   updateValueData += 'DT_DecisionTreeIssueType__c = \''+jsonData.DecisionTreeIssueType+'\',';
                }
            else { updateValueData += 'DT_DecisionTreeIssueType__c = \'\','; }            

            if (jsonData.NeedleIssue !== undefined && jsonData.NeedleIssue !== null && jsonData.NeedleIssue !== "null" && jsonData.NeedleIssue.length > 0){
                   insertQueryData += 'NI_NeedleIssue__c,'; valuesData += '\'' + jsonData.NeedleIssue + '\'' + ','; 
                   updateValueData += 'NI_NeedleIssue__c = \''+jsonData.NeedleIssue+'\',';
                }
            else { updateValueData += 'NI_NeedleIssue__c = \'\','; }          
            
            if (jsonData.NeedleBatchNumber !== undefined && jsonData.NeedleBatchNumber !== null && jsonData.NeedleBatchNumber !== "null" && jsonData.NeedleBatchNumber.length > 0){
                   insertQueryData += 'NI_NeedleBatchNumber__c,'; valuesData += '\'' + jsonData.NeedleBatchNumber + '\'' + ',';
                   updateValueData += 'NI_NeedleBatchNumber__c = \''+jsonData.NeedleBatchNumber+'\',';
                }
            else { updateValueData += 'NI_NeedleBatchNumber__c = \'\','; }    
                
            if (jsonData.NeedleAttachmentDetachment !== undefined && jsonData.NeedleAttachmentDetachment !== null && jsonData.NeedleAttachmentDetachment !== "null" && jsonData.NeedleAttachmentDetachment.length > 0){
                   insertQueryData += 'NI_NeedleAttachmentDetachment__c,'; valuesData += '\'' + jsonData.NeedleAttachmentDetachment + '\'' + ',';
                   updateValueData += 'NI_NeedleAttachmentDetachment__c = \''+jsonData.NeedleAttachmentDetachment+'\',';
                }
            else { updateValueData += 'NI_NeedleAttachmentDetachment__c =  \'\','; }   
                
            if (jsonData.NeedleWarningMessage !== undefined && jsonData.NeedleWarningMessage !== null && jsonData.NeedleWarningMessage !== "null" && jsonData.NeedleWarningMessage.length > 0){
                   insertQueryData += 'NI_Needlewarningmessage__c,'; valuesData += '\'' + jsonData.NeedleWarningMessage + '\'' + ',';
                   updateValueData += 'NI_Needlewarningmessage__c = \''+jsonData.NeedleWarningMessage+'\',';
                }
            else { updateValueData += 'NI_Needlewarningmessage__c =  \'\','; } 
                
            if (jsonData.OtherNeedleIssue !== undefined && jsonData.OtherNeedleIssue !== null && jsonData.OtherNeedleIssue !== "null" && jsonData.OtherNeedleIssue.length > 0){
                   insertQueryData += 'NI_OtherNeedleIssue__c,'; valuesData += '\'' + jsonData.OtherNeedleIssue + '\'' + ',';
                   updateValueData += 'NI_OtherNeedleIssue__c = \''+jsonData.OtherNeedleIssue+'\',';
                }
            else { updateValueData += 'NI_OtherNeedleIssue__c = \'\','; } 
            
            // Needle warning message - Needle warning message selection
            
            if (jsonData.NeedleWarningMessageSelection !== undefined && jsonData.NeedleWarningMessageSelection !== null && jsonData.NeedleWarningMessageSelection !== "null" && jsonData.NeedleWarningMessageSelection.length > 0){
                   insertQueryData += 'NW_NeedleWarningMessageSelection__c,'; valuesData += '\'' + jsonData.NeedleWarningMessageSelection + '\'' + ',';
                   updateValueData += 'NW_NeedleWarningMessageSelection__c = \''+jsonData.NeedleWarningMessageSelection+'\',';
                }
            else { updateValueData += 'NW_NeedleWarningMessageSelection__c = \'\','; }
                
            if (jsonData.IsWarningmsgDisplayedWhenNedleAttd !== undefined && jsonData.IsWarningmsgDisplayedWhenNedleAttd !== null && jsonData.IsWarningmsgDisplayedWhenNedleAttd !== "null" && jsonData.IsWarningmsgDisplayedWhenNedleAttd.length > 0){
                   insertQueryData += 'NW_IsWarningmsgDisplayedWhenNedleAttd__c,'; valuesData += '\'' + jsonData.IsWarningmsgDisplayedWhenNedleAttd + '\'' + ',';
                   updateValueData += 'NW_IsWarningmsgDisplayedWhenNedleAttd__c = \''+jsonData.IsWarningmsgDisplayedWhenNedleAttd+'\',';
                }
            else { updateValueData += 'NW_IsWarningmsgDisplayedWhenNedleAttd__c = \''+'False'+'\','; }
                
            if (jsonData.NeedleIsTheInjectionStillPossible !== undefined && jsonData.NeedleIsTheInjectionStillPossible !== null && jsonData.NeedleIsTheInjectionStillPossible !== "null" && jsonData.NeedleIsTheInjectionStillPossible.length > 0){
                   insertQueryData += 'NW_NeedleIstheinjectionstillpossible__c,'; valuesData += '\'' + jsonData.NeedleIsTheInjectionStillPossible + '\'' + ',';
                   updateValueData += 'NW_NeedleIstheinjectionstillpossible__c = \''+jsonData.NeedleIsTheInjectionStillPossible+'\',';
                }
            else { updateValueData += 'NW_NeedleIstheinjectionstillpossible__c = \''+'False'+'\','; }
                
            if (jsonData.MessageDisplayByInterruptingTheInje !== undefined && jsonData.MessageDisplayByInterruptingTheInje !== null && jsonData.MessageDisplayByInterruptingTheInje !== "null" && jsonData.MessageDisplayByInterruptingTheInje.length > 0){
                  insertQueryData += 'NW_MessageDisplayByInterruptingTheInje__c,'; valuesData += '\'' + jsonData.MessageDisplayByInterruptingTheInje + '\'' + ',';
                  updateValueData += 'NW_MessageDisplayByInterruptingTheInje__c = \''+jsonData.MessageDisplayByInterruptingTheInje+'\',';
                }
            else { updateValueData += 'NW_MessageDisplayByInterruptingTheInje__c = \''+'False'+'\','; }              
                
            if (jsonData.NeedleCapDeviceWarningMsgUponStart !== undefined && jsonData.NeedleCapDeviceWarningMsgUponStart !== null && jsonData.NeedleCapDeviceWarningMsgUponStart !== "null" && jsonData.NeedleCapDeviceWarningMsgUponStart.length > 0){
                  insertQueryData += 'NW_NeedleCapDeviceWarningMsgUponStart__c,'; valuesData += '\'' + jsonData.NeedleCapDeviceWarningMsgUponStart + '\'' + ',';
                  updateValueData += 'NW_NeedleCapDeviceWarningMsgUponStart__c = \''+jsonData.NeedleCapDeviceWarningMsgUponStart+'\',';
                }
            else { updateValueData += 'NW_NeedleCapDeviceWarningMsgUponStart__c = \''+'False'+'\',';}
                
            if (jsonData.NeedleCapIsInjectionStillPossible !== undefined && jsonData.NeedleCapIsInjectionStillPossible !== null && jsonData.NeedleCapIsInjectionStillPossible !== "null" && jsonData.NeedleCapIsInjectionStillPossible.length > 0){
                  insertQueryData += 'NW_NeedleCapIsInjectionStillPossible__c,'; valuesData += '\'' + jsonData.NeedleCapIsInjectionStillPossible + '\'' + ',';
                  updateValueData += 'NW_NeedleCapIsInjectionStillPossible__c = \''+jsonData.NeedleCapIsInjectionStillPossible+'\',';
                }
            else { updateValueData += 'NW_NeedleCapIsInjectionStillPossible__c =  \''+'False'+'\','; }                
                
            if (jsonData.DoesNeedleCavityShowResidue !== undefined && jsonData.DoesNeedleCavityShowResidue !== null && jsonData.DoesNeedleCavityShowResidue !== "null" && jsonData.DoesNeedleCavityShowResidue.length > 0){
                  insertQueryData += 'NW_DoesNeedleCavityShowResidue__c,'; valuesData += '\'' + jsonData.DoesNeedleCavityShowResidue + '\'' + ',';
                  updateValueData += 'NW_DoesNeedleCavityShowResidue__c = \''+jsonData.DoesNeedleCavityShowResidue+'\',';
                }
            else { updateValueData += 'NW_DoesNeedleCavityShowResidue__c =  \''+'False'+'\','; }
                
            if (jsonData.NeedleDetatcDeviceWarningMsguponStart !== undefined && jsonData.NeedleDetatcDeviceWarningMsguponStart !== null && jsonData.NeedleDetatcDeviceWarningMsguponStart !== "null" && jsonData.NeedleDetatcDeviceWarningMsguponStart.length > 0){
                  insertQueryData += 'NW_NeedleDetatcDeviceWarningMsguponStart__c,'; valuesData += '\'' + jsonData.NeedleDetatcDeviceWarningMsguponStart + '\'' + ',';
                  updateValueData += 'NW_NeedleDetatcDeviceWarningMsguponStart__c = \''+jsonData.NeedleDetatcDeviceWarningMsguponStart+'\',';
                }
            else { updateValueData += 'NW_NeedleDetatcDeviceWarningMsguponStart__c = \''+'False'+'\','; }
                
            if (jsonData.NeedleDetatchIsInjectionStillPossible !== undefined && jsonData.NeedleDetatchIsInjectionStillPossible !== null && jsonData.NeedleDetatchIsInjectionStillPossible !== "null" && jsonData.NeedleDetatchIsInjectionStillPossible.length > 0){
                  insertQueryData += 'NW_NeedleDetatchIsInjectionStillPossible__c,'; valuesData += '\'' + jsonData.NeedleDetatchIsInjectionStillPossible + '\'' + ',';
                  updateValueData += 'NW_NeedleDetatchIsInjectionStillPossible__c = \''+jsonData.NeedleDetatchIsInjectionStillPossible+'\',';
                }
            else { updateValueData += 'NW_NeedleDetatchIsInjectionStillPossible__c = \''+'False'+'\','; }
            
            if (jsonData.IsNeedleStillAttachedtoCartridge !== undefined && jsonData.IsNeedleStillAttachedtoCartridge !== null && jsonData.IsNeedleStillAttachedtoCartridge !== "null" && jsonData.IsNeedleStillAttachedtoCartridge.length > 0){
                   insertQueryData += 'NW_IsNeedleStillAttachedtoCartridge__c,'; valuesData += '\'' + jsonData.IsNeedleStillAttachedtoCartridge + '\'' + ',';
                   updateValueData += 'NW_IsNeedleStillAttachedtoCartridge__c = \''+jsonData.IsNeedleStillAttachedtoCartridge+'\',';
                }
            else { updateValueData += 'NW_IsNeedleStillAttachedtoCartridge__c = \''+'False'+'\',';}
               
            if (jsonData.WarningMsgAfterNeedleDetatchment !== undefined && jsonData.WarningMsgAfterNeedleDetatchment !== null && jsonData.WarningMsgAfterNeedleDetatchment !== "null" && jsonData.WarningMsgAfterNeedleDetatchment.length > 0){
                   insertQueryData += 'NW_Warningmsgafterneedledetatchment__c,'; valuesData += '\'' + jsonData.WarningMsgAfterNeedleDetatchment + '\'' + ',';
                   updateValueData += 'NW_Warningmsgafterneedledetatchment__c = \''+jsonData.WarningMsgAfterNeedleDetatchment+'\',';
                }
            else { updateValueData += 'NW_Warningmsgafterneedledetatchment__c = \''+'False'+'\','; }
                
             if (jsonData.NeedleButtonAfterNeedleDetatchment !== undefined && jsonData.NeedleButtonAfterNeedleDetatchment !== null && jsonData.NeedleButtonAfterNeedleDetatchment !== "null" && jsonData.NeedleButtonAfterNeedleDetatchment.length > 0){
                   insertQueryData += 'NW_Needlebuttonafterneedledetatchment__c,'; valuesData += '\'' + jsonData.NeedleButtonAfterNeedleDetatchment + '\'' + ',';
                   updateValueData += 'NW_Needlebuttonafterneedledetatchment__c = \''+jsonData.NeedleButtonAfterNeedleDetatchment+'\',';
                }
            else { updateValueData += 'NW_Needlebuttonafterneedledetatchment__c = \''+'False'+'\','; }
                
            if (jsonData.NeedleDetatchedByPushing !== undefined && jsonData.NeedleDetatchedByPushing !== null && jsonData.NeedleDetatchedByPushing !== "null" && jsonData.NeedleDetatchedByPushing.length > 0){
                   insertQueryData += 'NW_NeedleDetatchedByPushing__c,'; valuesData += '\'' + jsonData.NeedleDetatchedByPushing + '\'' + ',';
                   updateValueData += 'NW_NeedleDetatchedByPushing__c = \''+jsonData.NeedleDetatchedByPushing+'\',';
                }
            else { updateValueData += 'NW_NeedleDetatchedByPushing__c = \''+'False'+'\',';}
                
            if (jsonData.DoestheNeedleButtonReact !== undefined && jsonData.DoestheNeedleButtonReact !== null && jsonData.DoestheNeedleButtonReact !== "null" && jsonData.DoestheNeedleButtonReact.length > 0){
                   insertQueryData += 'NW_DoestheNeedleButtonReact__c,'; valuesData += '\'' + jsonData.DoestheNeedleButtonReact + '\'' + ',';
                   updateValueData += 'NW_DoestheNeedleButtonReact__c = \''+jsonData.DoestheNeedleButtonReact+'\',';
                }
            else { updateValueData += 'NW_DoestheNeedleButtonReact__c = \''+'False'+'\','; }

            if (jsonData.OtherWarningMessage !== undefined && jsonData.OtherWarningMessage !== null && jsonData.OtherWarningMessage !== "null" && jsonData.OtherWarningMessage.length > 0){
                   insertQueryData += 'NW_OtherWarningMessage__c,'; valuesData += '\'' + jsonData.OtherWarningMessage + '\'' + ',';
                   updateValueData += 'NW_OtherWarningMessage__c = \''+jsonData.OtherWarningMessage+'\',';
                }
            else { updateValueData += 'NW_OtherWarningMessage__c = \'\','; }
                
            if (jsonData.FrequencyoftheWMdiplay !== undefined && jsonData.FrequencyoftheWMdiplay !== null && jsonData.FrequencyoftheWMdiplay !== "null" && jsonData.FrequencyoftheWMdiplay.length > 0){
                   insertQueryData += 'NW_FrequencyoftheWMdiplay__c,'; valuesData += '\'' + jsonData.FrequencyoftheWMdiplay + '\'' + ',';
                   updateValueData += 'NW_FrequencyoftheWMdiplay__c = \''+jsonData.FrequencyoftheWMdiplay+'\',';
                }
            else { updateValueData += 'NW_FrequencyoftheWMdiplay__c = \'\','; }

            if (jsonData.WhenApproximatelyIssueObservedLastly !== undefined && jsonData.WhenApproximatelyIssueObservedLastly !== null && jsonData.WhenApproximatelyIssueObservedLastly !== "null" && jsonData.WhenApproximatelyIssueObservedLastly.length > 0){
                   insertQueryData += 'NW_WhenApproximatelyIssueObservedLastly__c,'; valuesData += '\'' + jsonData.WhenApproximatelyIssueObservedLastly + '\'' + ',';
                   updateValueData += 'NW_WhenApproximatelyIssueObservedLastly__c = \''+jsonData.WhenApproximatelyIssueObservedLastly+'\',';
                }
            else { updateValueData += 'NW_WhenApproximatelyIssueObservedLastly__c = \'\','; }  // Date

            if (jsonData.ApproximateDate !== undefined && jsonData.ApproximateDate !== null && jsonData.ApproximateDate !== "null" && jsonData.ApproximateDate.length > 0){
                   insertQueryData += 'NW_ApproximateDate__c,'; valuesData += '\'' + jsonData.ApproximateDate + '\'' + ',';
                   updateValueData += 'NW_ApproximateDate__c = \''+jsonData.ApproximateDate+'\',';
                }
            //else { updateValueData += 'NW_ApproximateDate__c = \'\','; }   // Date

            if (jsonData.WarngMsgDisplayedAtParticularStep !== undefined && jsonData.WarngMsgDisplayedAtParticularStep !== null && jsonData.WarngMsgDisplayedAtParticularStep !== "null" && jsonData.WarngMsgDisplayedAtParticularStep.length > 0){
                   insertQueryData += 'NW_WarngMsgDisplayedAtParticularStep__c,'; valuesData += '\'' + jsonData.WarngMsgDisplayedAtParticularStep + '\'' + ',';
                   updateValueData += 'NW_WarngMsgDisplayedAtParticularStep__c = \''+jsonData.WarngMsgDisplayedAtParticularStep+'\',';
                }
            else { updateValueData += 'NW_WarngMsgDisplayedAtParticularStep__c = \''+'False'+'\','; }
                
            if (jsonData.PleaseSelectTheInjectionStep !== undefined && jsonData.PleaseSelectTheInjectionStep !== null && jsonData.PleaseSelectTheInjectionStep !== "null" && jsonData.PleaseSelectTheInjectionStep.length > 0){
                   insertQueryData += 'NW_PleaseSelectTheInjectionStep__c,'; valuesData += '\'' + jsonData.PleaseSelectTheInjectionStep + '\'' + ',';
                   updateValueData += 'NW_PleaseSelectTheInjectionStep__c = \''+jsonData.PleaseSelectTheInjectionStep+'\',';
                }
            else { updateValueData += 'NW_PleaseSelectTheInjectionStep__c = \'\','; }

            if (jsonData.IsMsgDisplayedOnUseOfNewNdleBatc !== undefined && jsonData.IsMsgDisplayedOnUseOfNewNdleBatc !== null && jsonData.IsMsgDisplayedOnUseOfNewNdleBatc !== "null" && jsonData.IsMsgDisplayedOnUseOfNewNdleBatc.length > 0){
                   insertQueryData += 'NW_IsMsgDisplayedOnUseOfNewNdleBatc__c,'; valuesData += '\'' + jsonData.IsMsgDisplayedOnUseOfNewNdleBatc + '\'' + ',';
                   updateValueData += 'NW_IsMsgDisplayedOnUseOfNewNdleBatc__c = \''+jsonData.IsMsgDisplayedOnUseOfNewNdleBatc+'\',';
                }
            else { updateValueData += 'NW_IsMsgDisplayedOnUseOfNewNdleBatc__c = \''+'False'+'\','; }

            if (jsonData.PleaseProvideTheNeedleBatch !== undefined && jsonData.PleaseProvideTheNeedleBatch !== null && jsonData.PleaseProvideTheNeedleBatch !== "null" && jsonData.PleaseProvideTheNeedleBatch.length > 0){
                  insertQueryData += 'NW_PleaseProvideTheNeedleBatch__c,'; valuesData += '\'' + jsonData.PleaseProvideTheNeedleBatch + '\'' + ',';
                  updateValueData += 'NW_PleaseProvideTheNeedleBatch__c = \''+jsonData.PleaseProvideTheNeedleBatch+'\',';
                }
            else { updateValueData += 'NW_PleaseProvideTheNeedleBatch__c = \'\','; }
                
            if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0){ 
			     insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\'';
			     updateValueData += 'HerokuCaseId__c = \''+jsonData.caseid+ '\'';
			    }

             
            var combinedQuery;
            
            if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0)           
               combinedQuery = 'UPDATE salesforce.IVOP_DecisionTree__c SET '+updateValueData+' WHERE id='+jsonData.DecisionTreeId+'';
            else
               combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
            
            console.log('............combinedQuery.............'+combinedQuery); 
            //var temp = combinedQuery;    
            //combinedQuery = temp.replace("%2527","\\'");    
            //console.log('--------------------------------temp-------------------------------'+combinedQuery);
            conn.query(combinedQuery,
                function(err, result) {
                            done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                   }
                                            else{
						  if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0){
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:jsonData.DecisionTreeId,
                                                        message: 'Success.'});
						    }
						    else{
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:result.rows[0].id,
                                                        message: 'Success.'});
						    }
                                   }
                });
            }
        });
    });
});


router.post('/updateCase', function(req, res) {
   
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
         var jsonData = req.body;
	 console.log('....updateCase...'+jsonData);
         conn.query('SELECT *from salesforce.Case WHERE id='+jsonData.caseid+'',
                function(err,result){
                 if (err != null || result.rowCount == 0) {
                      return res.json({
				caseid: -1,
                                msgid: 2,
                                message: 'case id not found.'});
                 }else{									
				    var valueData = '';
									
				    if (jsonData.DeviceName !== undefined && jsonData.DeviceName !== null && jsonData.DeviceName !== "null" && jsonData.DeviceName.length > 0)
					{ valueData += 'FMA_DeviceName__c = \''+jsonData.DeviceName+'\','; }
					else 
					{ return res.json({caseid: -1,msgid: 2,message: 'Please select device name.'});}
					
					if (jsonData.userid !== undefined && jsonData.userid !== null && jsonData.userid !== "null" && jsonData.userid.toString().length > 0)
					{ valueData += 'ContactId = \''+jsonData.userid+'\','; }
					else 
					{ return res.json({caseid: -1,msgid: 2,message: 'Userid should not be empty.'});}
					
					if (jsonData.ProductId !== undefined && jsonData.ProductId !== null && jsonData.ProductId !== "null" && jsonData.ProductId.toString().length > 0)
					{ valueData += 'FMA_Product__c = \''+jsonData.ProductId+'\','; }
					else 
					{ return res.json({caseid: -1,msgid: 2,message: 'ProductId should not be empty.'});}
					
					if (jsonData.Gender !== undefined && jsonData.Gender !== null && jsonData.Gender !== "null" && jsonData.Gender.length > 0)
					{ valueData += 'FMA_Gender__c = \''+jsonData.Gender+'\','; }
					//else { return res.json({caseid: -1,msgid: 2,message: 'Please select gender.'});}
				
					if (jsonData.FormulationDosage !== undefined && jsonData.FormulationDosage !== null && jsonData.FormulationDosage !== "null" && jsonData.FormulationDosage.length > 1)
					{ valueData += 'FMA_Dosage__c = \''+jsonData.FormulationDosage+'\','; }
				        else{valueData += 'FMA_Dosage__c = \'\',';}
				
					if (jsonData.TrainingDate !== undefined && jsonData.TrainingDate !== null && jsonData.TrainingDate !== "null" && jsonData.TrainingDate.length > 1)
					{ valueData += 'FMA_Whenthepatientgottrained__c = \''+jsonData.TrainingDate+'\','; }
					
					if (jsonData.ComplainantCategory !== undefined && jsonData.ComplainantCategory !== null && jsonData.ComplainantCategory !== "null" && jsonData.ComplainantCategory.length > 1)
					{ valueData += 'FMA_ComplainantCategory__c = \''+jsonData.ComplainantCategory+'\','; }
				        else{valueData += 'FMA_ComplainantCategory__c = \'\',';}
					
					if (jsonData.AffiliateIfStillNeeded !== undefined && jsonData.AffiliateIfStillNeeded !== null && jsonData.AffiliateIfStillNeeded !== "null" && jsonData.AffiliateIfStillNeeded.length > 1)
					{ valueData += 'FMA_AffiliateIfStillNeeded__c = \''+jsonData.AffiliateIfStillNeeded+'\','; }
				        else{valueData += 'FMA_AffiliateIfStillNeeded__c = \''+'False'+'\',';}

					if (jsonData.BatchSerialNbr !== undefined && jsonData.BatchSerialNbr !== null && jsonData.BatchSerialNbr !== "null" && jsonData.BatchSerialNbr.length > 1)
					{ valueData += 'FMA_BatchSerialnumber__c = \''+jsonData.BatchSerialNbr+'\','; }
				        else{valueData += 'FMA_BatchSerialnumber__c = \'\',';}

					if (jsonData.DateOfFirstUse !== undefined && jsonData.DateOfFirstUse !== null && jsonData.DateOfFirstUse !== "null" && jsonData.DateOfFirstUse.length > 7)
					{ valueData += 'FMA_Dateoffirstuse__c = \''+jsonData.DateOfFirstUse+'\','; }

					if (jsonData.ExpiryDate !== undefined && jsonData.ExpiryDate !== null && jsonData.ExpiryDate !== "null" && jsonData.ExpiryDate.length > 7)
					{ valueData += 'FMA_Expirydate__c = \''+jsonData.ExpiryDate+'\','; }
				    
					if (jsonData.InitialPatientName !== undefined && jsonData.InitialPatientName !== null && jsonData.InitialPatientName !== "null" && jsonData.InitialPatientName.length > 1)
					{ valueData += 'FMA_Initialpatientname__c = \''+jsonData.InitialPatientName+'\','; }
				        else{valueData += 'FMA_Initialpatientname__c = \'\',';}

					if (jsonData.InitialPatientSurName !== undefined && jsonData.InitialPatientSurName !== null && jsonData.InitialPatientSurName !== "null" && jsonData.InitialPatientSurName.length > 0)
					{ valueData += 'FMA_Initialpatientsurname__c = \''+jsonData.InitialPatientSurName+'\','; }
				        else{valueData += 'FMA_Initialpatientsurname__c = \'\',';}

					if (jsonData.Age !== undefined && jsonData.Age !== null && jsonData.Age !== "null" && jsonData.Age.length > 0)
					{ valueData += 'FMA_Age__c = \''+jsonData.Age+'\','; }
				        //else{valueData += 'FMA_Age__c = \'\',';}
					
					if (jsonData.Phoneno !== undefined && jsonData.Phoneno !== null && jsonData.Phoneno !== "null" && jsonData.Phoneno.length > 0)
					{ valueData += 'FMA_Phoneno__c = \''+jsonData.Phoneno+'\','; }
				    else{valueData += 'FMA_Phoneno__c = \'\',';}
						
					if (jsonData.Email !== undefined && jsonData.Email !== null && jsonData.Email !== "null" && jsonData.Email.length > 0)
					{ valueData += 'FMA_Email__c = \''+jsonData.Email+'\','; }
				    else{valueData += 'FMA_Email__c = \'\',';}
						
					if (jsonData.Hasthepatientbeentrained !== undefined && jsonData.Hasthepatientbeentrained !== null && jsonData.Hasthepatientbeentrained !== "null" && jsonData.Hasthepatientbeentrained.length > 0)
					{ valueData += 'FMA_Hasthepatientbeentrained__c = \''+jsonData.Hasthepatientbeentrained+'\','; }
				    else{valueData += 'FMA_Hasthepatientbeentrained__c = \''+'False'+'\',';}
						
					if (jsonData.Whomadethetraining !== undefined && jsonData.Whomadethetraining !== null && jsonData.Whomadethetraining !== "null" && jsonData.Whomadethetraining.length > 0)
					{ valueData += 'FMA_Whomadethetraining__c = \''+jsonData.Whomadethetraining+'\','; }
				    else{valueData += 'FMA_Whomadethetraining__c = \'\',';}
					
					if (jsonData.WhomadetheTrainingOther !== undefined && jsonData.WhomadetheTrainingOther !== null && jsonData.WhomadetheTrainingOther !== "null" && jsonData.WhomadetheTrainingOther.length > 0)
					{ valueData += 'Who_made_the_training_Other__c = \''+jsonData.WhomadetheTrainingOther+'\','; }
				    else{valueData += 'Who_made_the_training_Other__c = \'\',';}

					if (jsonData.NameOfCompliant !== undefined && jsonData.NameOfCompliant !== null && jsonData.NameOfCompliant !== "null" && jsonData.NameOfCompliant.length > 1)
					{ valueData += 'FMA_NameofComplainant__c = \''+jsonData.NameOfCompliant+'\','; }
				    else{valueData += 'FMA_NameofComplainant__c = \'\',';}

					if (jsonData.DefectDescription !== undefined && jsonData.DefectDescription !== null && jsonData.DefectDescription !== "null" && jsonData.DefectDescription.length > 1)
					{ valueData += 'FMA_Defectdescription__c = \''+jsonData.DefectDescription+'\','; }
				    else{valueData += 'FMA_Defectdescription__c = \'\',';}

					if (jsonData.IsComplaintSampleAvailable !== undefined && jsonData.IsComplaintSampleAvailable !== null && jsonData.IsComplaintSampleAvailable !== "null" && jsonData.IsComplaintSampleAvailable.length > 0)
					{ valueData += 'FMA_Isthecomplaintsampleavailable__c = \''+jsonData.IsComplaintSampleAvailable+'\','; }
				    else{valueData += 'FMA_Isthecomplaintsampleavailable__c = \''+'False'+'\',';}

					if (jsonData.HasResponseBeenRequested !== undefined && jsonData.HasResponseBeenRequested !== null && jsonData.HasResponseBeenRequested !== "null" && jsonData.HasResponseBeenRequested.length > 0)
					{ valueData += 'FMA_Hasresponsebeenrequested__c = \''+jsonData.HasResponseBeenRequested+'\','; }
				    else{valueData += 'FMA_Hasresponsebeenrequested__c = \''+'False'+'\',';}

					if (jsonData.IsPatientFamiliarWithDeviceUsage !== undefined && jsonData.IsPatientFamiliarWithDeviceUsage !== null && jsonData.IsPatientFamiliarWithDeviceUsage !== "null" && jsonData.IsPatientFamiliarWithDeviceUsage.length > 0)
					{ valueData += 'FMA_Ispatientfamiliarwithdeviceusage__c = \''+jsonData.IsPatientFamiliarWithDeviceUsage+'\','; }
				    else{valueData += 'FMA_Ispatientfamiliarwithdeviceusage__c = \''+'False'+'\',';}

					if (jsonData.SinceWhenPatientUseThisDevice !== undefined && jsonData.SinceWhenPatientUseThisDevice !== null && jsonData.SinceWhenPatientUseThisDevice !== "null" && jsonData.SinceWhenPatientUseThisDevice.length > 1)
					{ valueData += 'FMA_Sincewhendoespatientusethiskind__c = \''+jsonData.SinceWhenPatientUseThisDevice+'\','; }

					if (jsonData.IsDevicePhysicallyDamaged !== undefined && jsonData.IsDevicePhysicallyDamaged !== null && jsonData.IsDevicePhysicallyDamaged !== "null" && jsonData.IsDevicePhysicallyDamaged.length > 1)
					{ valueData += 'FMA_Isthedevicephysicallydamaged__c = \''+jsonData.IsDevicePhysicallyDamaged+'\','; }
				    else{valueData += 'FMA_Isthedevicephysicallydamaged__c = \''+'False'+'\',';}

					if (jsonData.DamageDuetoAccidentalFall !== undefined && jsonData.DamageDuetoAccidentalFall !== null && jsonData.DamageDuetoAccidentalFall !== "null" && jsonData.DamageDuetoAccidentalFall.length > 0)
					{ valueData += 'FMA_Thedamageisduetoanaccidentalfall__c = \''+jsonData.DamageDuetoAccidentalFall+'\','; }
				    else{valueData += 'FMA_Thedamageisduetoanaccidentalfall__c = \''+'False'+'\',';}

					if (jsonData.IsDefectedDuetomisusebypatient !== undefined && jsonData.IsDefectedDuetomisusebypatient !== null && jsonData.IsDefectedDuetomisusebypatient !== "null" && jsonData.IsDefectedDuetomisusebypatient.length > 0)
					{ valueData += 'FMA_Isthedefectduetoamisusebypatient__c = \''+jsonData.IsDefectedDuetomisusebypatient+'\',' }
				    else{valueData += 'FMA_Isthedefectduetoamisusebypatient__c = \''+'False'+'\',';}

					if (jsonData.WhatStuckinside !== undefined && jsonData.WhatStuckinside !== null && jsonData.WhatStuckinside !== "null" && jsonData.WhatStuckinside.length > 0)
					{ valueData += 'FMA_whatstuckinside__c = \''+jsonData.WhatStuckinside+'\','; }
				    else{valueData += 'FMA_whatstuckinside__c = \'\',';}

					if (jsonData.Adverseeventassociatedtodefect !== undefined && jsonData.Adverseeventassociatedtodefect !== null && jsonData.Adverseeventassociatedtodefect !== "null" && jsonData.Adverseeventassociatedtodefect.length > 0)
					{ valueData += 'FMA_Adverseeventassociatedtodefect__c = \''+jsonData.Adverseeventassociatedtodefect+'\','; }
				        else{valueData += 'FMA_Adverseeventassociatedtodefect__c = \''+'False'+'\',';}

					if (jsonData.AdverseEventAssociatedWitchOne !== undefined && jsonData.AdverseEventAssociatedWitchOne !== null && jsonData.AdverseEventAssociatedWitchOne !== "null" && jsonData.AdverseEventAssociatedWitchOne.length > 0)
					{ valueData += 'FMA_Adverseeventassociatedwhichone__c = \''+jsonData.AdverseEventAssociatedWitchOne+'\','; }
				        else{valueData += 'FMA_Adverseeventassociatedwhichone__c = \'\',';}				
					
					if (jsonData.Subject !== undefined && jsonData.Subject !== null && jsonData.Subject !== "null" && jsonData.Subject.length > 0)
					{ valueData += 'Subject = \''+jsonData.Subject+'\','; }
					 else{valueData += 'Subject = \'\',';}
			 
					if (jsonData.Description !== undefined && jsonData.Description !== null && jsonData.Description !== "null" && jsonData.Description.length > 1)
					{ valueData += 'Description = \''+jsonData.Description+'\','; }
				        else{valueData += 'Description = \'\',';}
			 
			                if (jsonData.recordStatus !== undefined && jsonData.recordStatus !== null && jsonData.recordStatus !== "null" && jsonData.recordStatus.length > 1)
					{ valueData += 'FMA_Recordstatus__c = \''+jsonData.recordStatus+'\','; }
				       
			                if (jsonData.patientId !== undefined && jsonData.patientId !== null && jsonData.patientId !== "null" && jsonData.patientId.length > 0)
					{ valueData += 'FMA_PatientId__c = \''+jsonData.patientId+'\''; }
				        else{valueData += 'FMA_PatientId__c = \'\'';}

				    console.log('............update Case...1......valueData......'+valueData);					
									
                    conn.query('UPDATE salesforce.case SET '+valueData+' WHERE id='+jsonData.caseid+'',
                         function(err, result) {
                          done();
                            if(err){
                                    return res.json({
                                         msgid: 2,
                                            message: err.message});
                                }
                                else{
                                    return res.json({ 
                                         msgid: 1,
					 caseid: jsonData.id,
                                         message: 'Success.'});
                                }
                         });
                    }
             });
     });
 });



router.post('/updateDefectDescription', function(req, res) {
var caseid = req.param('caseid');
var Description = req.param('DefectDescription'); 	
         pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
             if (err) console.log(err);
             conn.query('SELECT *from salesforce.Case WHERE id='+caseid+'',
                function(err,result){
                 if (err != null || result.rowCount == 0) {
                      return res.json({
                                msgid: 2,
                                message: 'case id not found.'});
                         }else{
			        var Des = 'Description';
                                conn.query('UPDATE salesforce.Case SET '+Des+' = \''+Description+'\' WHERE id='+caseid+'',
                                    function(err,result){
                                        done();
                                        if(err){
                                            return res.json({
                                                    msgid: 2,
                                                    message: err.message});
                                        }
                                        else{
                                           return res.json({
                                                    msgid: 1,
						    caseid:result.rows[0].id,
                                                    message: 'Success.'});
                                        }
                                   });
                              }
                        });
                     
             });
     });


// insertCatridgeIssue



// insertAppFeedback

router.post('/insertAppFeedback', function(req, res) {
	var userid = req.param('id');
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        
        console.log(req.body);
        var jsonData = req.body;
        var insertQueryData = 'INSERT INTO salesforce.IVOP_Appfeedback__c (';
        var valuesData=' VALUES ('; 
	    
    if (jsonData.IssueRelatedTo !== undefined && jsonData.IssueRelatedTo !== null && jsonData.IssueRelatedTo !== "null" && jsonData.IssueRelatedTo.length > 0)
        { insertQueryData += 'IssueRelatedTo__c,'; valuesData += '\'' + jsonData.IssueRelatedTo + '\'' + ','; }
	    
    if (jsonData.Comment !== undefined && jsonData.Comment !== null && jsonData.Comment !== "null" && jsonData.Comment.length > 0)
        { insertQueryData += 'Comment__c,'; valuesData += '\'' + jsonData.Comment + '\'' + ','; }
	
    if (jsonData.Rating !== undefined && jsonData.Rating !== null && jsonData.Rating !== "null" && jsonData.Rating.length > 0)
        { insertQueryData += 'Rating__c,'; valuesData += '\'' + jsonData.Rating + '\'' + ','; }
	    
    if (jsonData.ProvideEmail !== undefined && jsonData.ProvideEmail !== null && jsonData.ProvideEmail !== "null" && jsonData.ProvideEmail.length > 0)
       { insertQueryData += 'ProvideEmail__c,'; valuesData += '\'' + jsonData.ProvideEmail + '\'' + ','; }
	
	if (jsonData.userid !== undefined && jsonData.userid !== null && jsonData.userid !== "null" && jsonData.userid.length > 0)
        { insertQueryData += 'Contact__c'; valuesData += '\'' + jsonData.userid + '\''}

        var combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
        console.log(combinedQuery); 
        
        conn.query(combinedQuery,
                function(err, result) {
			                done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                   }
                                            else{
                                                return res.json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                   }
                });
    });
});


router.post('/updateHerokuCaseID', function(req, res) {
var caseid = req.param('caseid');
	
         pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
             if (err) console.log(err);
             conn.query('SELECT *from salesforce.Case WHERE id='+caseid+'',
                function(err,result){
                 if (err != null || result.rowCount == 0) {
                      return res.json({
                                msgid: 2,
                                message: 'case id not found.'});
                         }else{
			        var herokucaseid = 'fma_herokucaseid__c';
                                conn.query('UPDATE salesforce.Case SET '+herokucaseid+' = \''+caseid+'\' WHERE id='+caseid+'',
                                    function(err,result){
                                        done();
                                        if(err){
                                            return res.json({
                                                    msgid: 2,
                                                    message: err.message});
                                        }
                                        else{
                                           return res.json({
                                                    msgid: 1,
                                                    message: 'Success.'});
                                        }
                                   });
                              }
                        });
                     
             });
     });





router.post('/insertDiviceGeneralFunctioning', function(req, res) {
    console.log('............insertDecisiontree...............');   
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);       
       
        var jsonData = req.body;
        console.log('.....req..body......'+req.body);
        conn.query('SELECT *from salesforce.Case WHERE id='+jsonData.caseid+'',
        function(err,result){
          if (err != null || result.rowCount == 0){
                          return res.json({
                                    caseid: -1,
                                    msgid: 3,
                                    message: 'case id not found.'});
          }else{
            
            var updateValueData = '';
            var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
            var valuesData=' VALUES ('; 
                
            if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0){
                   insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ',';
                   updateValueData += 'DT_DecisionTreeIssueType__c = \''+jsonData.DecisionTreeIssueType+'\',';
                }
            else { updateValueData += 'DT_DecisionTreeIssueType__c = \'\','; }  

            if (jsonData.Devicefunctioningoptions !== undefined && jsonData.Devicefunctioningoptions !== null && jsonData.Devicefunctioningoptions !== "null" && jsonData.Devicefunctioningoptions.length > 0){ 
				  insertQueryData += 'DF_Devicefunctioningoptions__c,'; valuesData += '\'' + jsonData.Devicefunctioningoptions + '\'' + ','; 
				  updateValueData += 'DF_Devicefunctioningoptions__c = \''+jsonData.Devicefunctioningoptions+'\',';
				}
	        else { updateValueData += 'DF_Devicefunctioningoptions__c = \'\','; } 
			if (jsonData.CanTheDeviceBeTurnedOn !== undefined && jsonData.CanTheDeviceBeTurnedOn !== null && jsonData.CanTheDeviceBeTurnedOn !== "null" && jsonData.CanTheDeviceBeTurnedOn.length > 0){ 
			      insertQueryData += 'DF_CanTheDeviceBeTurnedOn__c,'; valuesData += '\'' + jsonData.CanTheDeviceBeTurnedOn + '\'' + ',';
                  updateValueData += 'DF_CanTheDeviceBeTurnedOn__c = \''+jsonData.CanTheDeviceBeTurnedOn+'\',';
				}
				
			if (jsonData.SomeThingDisplayedPreventingAcess !== undefined && jsonData.SomeThingDisplayedPreventingAcess !== null && jsonData.SomeThingDisplayedPreventingAcess !== "null" && jsonData.SomeThingDisplayedPreventingAcess.length > 0){
			      insertQueryData += 'DF_somethingdisplayedpreventingacess__c,'; valuesData += '\'' + jsonData.SomeThingDisplayedPreventingAcess + '\'' + ','; 
				  updateValueData += 'DF_somethingdisplayedpreventingacess__c = \''+jsonData.SomeThingDisplayedPreventingAcess+'\',';
				  }
				
			if (jsonData.LinkedToaDeviceOption !== undefined && jsonData.LinkedToaDeviceOption !== null && jsonData.LinkedToaDeviceOption !== "null" && jsonData.LinkedToaDeviceOption.length > 0)
				{ insertQueryData += 'DF_Linkedtoadeviceoption__c,'; valuesData += '\'' + jsonData.LinkedToaDeviceOption + '\'' + ','; 
				  updateValueData += 'DF_Linkedtoadeviceoption__c = \''+jsonData.LinkedToaDeviceOption+'\',';
				}
			
			if (jsonData.CommentIfNo !== undefined && jsonData.CommentIfNo !== null && jsonData.CommentIfNo !== "null" && jsonData.CommentIfNo.length > 0)
				{ insertQueryData += 'DF_CommentDeviceFunction__c,'; valuesData += '\'' + jsonData.CommentIfNo + '\'' + ','; 
				  updateValueData += 'DF_CommentDeviceFunction__c = \''+jsonData.CommentIfNo+'\',';
				}
			else { updateValueData += 'DF_CommentDeviceFunction__c = \'\','; } 		
			if (jsonData.ListOfOptions !== undefined && jsonData.ListOfOptions !== null && jsonData.ListOfOptions !== "null" && jsonData.ListOfOptions.length > 0)
				{ insertQueryData += 'DF_ListOfOptions__c,'; valuesData += '\'' + jsonData.ListOfOptions + '\'' + ','; 
				  updateValueData += 'DF_ListOfOptions__c = \''+jsonData.ListOfOptions+'\',';
				}
			else { updateValueData += 'DF_ListOfOptions__c = \'\','; } 		
			if (jsonData.ChangeIndevicesBehaviour !== undefined && jsonData.ChangeIndevicesBehaviour !== null && jsonData.ChangeIndevicesBehaviour !== "null" && jsonData.ChangeIndevicesBehaviour.length > 0)
				{ insertQueryData += 'DF_Changeindevicesbehaviour__c,'; valuesData += '\'' + jsonData.ChangeIndevicesBehaviour + '\'' + ','; 
				  updateValueData += 'DF_Changeindevicesbehaviour__c = \''+jsonData.ChangeIndevicesBehaviour+'\',';
				}
				
			if (jsonData.IsDeviceFunctioningSlowerThanUsual !== undefined && jsonData.IsDeviceFunctioningSlowerThanUsual !== null && jsonData.IsDeviceFunctioningSlowerThanUsual !== "null" && jsonData.IsDeviceFunctioningSlowerThanUsual.length > 0)
				{ insertQueryData += 'DF_Isdevicefunctioningslowerthanusual__c,'; valuesData += '\'' + jsonData.IsDeviceFunctioningSlowerThanUsual + '\'' + ','; 
				  updateValueData += 'DF_Isdevicefunctioningslowerthanusual__c = \''+jsonData.IsDeviceFunctioningSlowerThanUsual+'\',';
				}
				
			if (jsonData.WhenItHasObservedForTheFirstTime !== undefined && jsonData.WhenItHasObservedForTheFirstTime !== null && jsonData.WhenItHasObservedForTheFirstTime !== "null" && jsonData.WhenItHasObservedForTheFirstTime.length > 0)
				{ insertQueryData += 'DF_Whenithasobservedforthefirsttime__c,'; valuesData += '\'' + jsonData.WhenItHasObservedForTheFirstTime + '\'' + ','; 
				  updateValueData += 'DF_Whenithasobservedforthefirsttime__c = \''+jsonData.WhenItHasObservedForTheFirstTime+'\',';
				}
				
			if (jsonData.IsTheDeviceLouderThanUsually !== undefined && jsonData.IsTheDeviceLouderThanUsually !== null && jsonData.IsTheDeviceLouderThanUsually !== "null" && jsonData.IsTheDeviceLouderThanUsually.length > 0)
				{ insertQueryData += 'DF_Isthedevicelouderthanusually__c,'; valuesData += '\'' + jsonData.IsTheDeviceLouderThanUsually + '\'' + ','; 
				  updateValueData += 'DF_Isthedevicelouderthanusually__c = \''+jsonData.IsTheDeviceLouderThanUsually+'\',';
				}
				
			if (jsonData.WhenItHasBeenObservedForTheFirstTime !== undefined && jsonData.WhenItHasBeenObservedForTheFirstTime !== null && jsonData.WhenItHasBeenObservedForTheFirstTime !== "null" && jsonData.WhenItHasBeenObservedForTheFirstTime.length > 0)
				{ insertQueryData += 'DF_Whenithasbeenobservedforthefirsttime__c,'; valuesData += '\'' + jsonData.WhenItHasBeenObservedForTheFirstTime + '\'' + ','; 
				  updateValueData += 'DF_Whenithasbeenobservedforthefirsttime__c = \''+jsonData.WhenItHasBeenObservedForTheFirstTime+'\',';
				}
				
			if (jsonData.CommentDeviceFunctioning !== undefined && jsonData.CommentDeviceFunctioning !== null && jsonData.CommentDeviceFunctioning !== "null" && jsonData.CommentDeviceFunctioning.length > 0)
				{ insertQueryData += 'DF_CommentDeviceFunctioning__c,'; valuesData += '\'' + jsonData.CommentDeviceFunctioning + '\'' + ','; 
				  updateValueData += 'DF_CommentDeviceFunctioning__c = \''+jsonData.CommentDeviceFunctioning+'\',';
				}
			else { updateValueData += 'DF_CommentDeviceFunctioning__c = \'\','; } 
                
            if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0){ 
			     insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\'';
			     updateValueData += 'HerokuCaseId__c = \''+jsonData.caseid+ '\'';
			    }

             
            var combinedQuery;
            
            if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0)           
               combinedQuery = 'UPDATE salesforce.IVOP_DecisionTree__c SET '+updateValueData+' WHERE id='+jsonData.DecisionTreeId+'';
            else
               combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
            
            console.log('............combinedQuery.............'+combinedQuery); 
            conn.query(combinedQuery,
                function(err, result) {
                            done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                   }
                             else{
                                                 if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0){
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:jsonData.DecisionTreeId,
                                                        message: 'Success.'});
						    }
						    else{
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:result.rows[0].id,
                                                        message: 'Success.'});
						    }
                            }
                });
            }
        });
    });
});

	
router.post('/insertDataandtransfer', function(req, res) {
    console.log('............insertDecisiontree...............');   
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);       
       
        var jsonData = req.body;
        console.log('.....req..body......'+req.body);
        conn.query('SELECT *from salesforce.Case WHERE id='+jsonData.caseid+'',
        function(err,result){
          if (err != null || result.rowCount == 0){
                          return res.json({
                                    caseid: -1,
                                    msgid: 3,
                                    message: 'case id not found.'});
          }else{
            
            var updateValueData = '';
            var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
            var valuesData=' VALUES ('; 
                
            if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0){
                   insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ',';
                   updateValueData += 'DT_DecisionTreeIssueType__c = \''+jsonData.DecisionTreeIssueType+'\',';
                }
            else { updateValueData += 'DT_DecisionTreeIssueType__c = \'\','; }  

            if (jsonData.DataAndTransfer !== undefined && jsonData.DataAndTransfer !== null && jsonData.DataAndTransfer !== "null" && jsonData.DataAndTransfer.length > 0)
                { insertQueryData += 'DT_Dataandtransfer__c,'; valuesData += '\'' + jsonData.DataAndTransfer + '\'' + ','; 
				  updateValueData += 'DT_Dataandtransfer__c = \''+jsonData.DataAndTransfer+'\',';
				}
	        else { updateValueData += 'DT_Dataandtransfer__c = \'\','; } 
			if (jsonData.InfoDisplayedByDeviceNotAccurate !== undefined && jsonData.InfoDisplayedByDeviceNotAccurate !== null && jsonData.InfoDisplayedByDeviceNotAccurate !== "null" && jsonData.InfoDisplayedByDeviceNotAccurate.length > 0)
				{ insertQueryData += 'DT_InfoDisplayedByDeviceNotAccurate__c,'; valuesData += '\'' + jsonData.InfoDisplayedByDeviceNotAccurate + '\'' + ','; 
				  updateValueData += 'DT_InfoDisplayedByDeviceNotAccurate__c = \''+jsonData.InfoDisplayedByDeviceNotAccurate+'\',';
				}
			else { updateValueData += 'DT_InfoDisplayedByDeviceNotAccurate__c = \''+'False'+'\','; }		
			if (jsonData.DateandTime !== undefined && jsonData.DateandTime !== null && jsonData.DateandTime !== "null" && jsonData.DateandTime.length > 0)
				{ insertQueryData += 'DT_Dateandtime__c,'; valuesData += '\'' + jsonData.DateandTime + '\'' + ','; 
				  updateValueData += 'DT_Dateandtime__c = \''+jsonData.DateandTime+'\',';
				}
				
			if (jsonData.LastInjectionInformation !== undefined && jsonData.LastInjectionInformation !== null && jsonData.LastInjectionInformation !== "null" && jsonData.LastInjectionInformation.length > 0)
				{ insertQueryData += 'DT_Lastinjectioninformation__c,'; valuesData += '\'' + jsonData.LastInjectionInformation + '\'' + ','; 
				  updateValueData += 'DT_Lastinjectioninformation__c = \''+jsonData.LastInjectionInformation+'\',';
				}
			else { updateValueData += 'DT_Lastinjectioninformation__c = \'\','; } 	
			if (jsonData.InformationFromTheDevicesHistory !== undefined && jsonData.InformationFromTheDevicesHistory !== null && jsonData.InformationFromTheDevicesHistory !== "null" && jsonData.InformationFromTheDevicesHistory.length > 0)
				{ insertQueryData += 'DT_Informationfromthedeviceshistory__c,'; valuesData += '\'' + jsonData.InformationFromTheDevicesHistory + '\'' + ','; 
				  updateValueData += 'DT_Informationfromthedeviceshistory__c = \''+jsonData.InformationFromTheDevicesHistory+'\',';
				}
			else { updateValueData += 'DT_Informationfromthedeviceshistory__c = \'\','; } 	
			if (jsonData.More !== undefined && jsonData.More !== null && jsonData.More !== "null" && jsonData.More.length > 0)
				{ insertQueryData += 'DT_More__c,'; valuesData += '\'' + jsonData.More + '\'' + ','; 
				  updateValueData += 'DT_More__c = \''+jsonData.More+'\',';
				}
			else { updateValueData += 'DT_More__c = \'\','; } 	
			if (jsonData.DidTheDataTransferPerformedByHCP !== undefined && jsonData.DidTheDataTransferPerformedByHCP !== null && jsonData.DidTheDataTransferPerformedByHCP !== "null" && jsonData.DidTheDataTransferPerformedByHCP.length > 0)
				{ insertQueryData += 'DT_DidthedatatransferperformedbyHCP1__c,'; valuesData += '\'' + jsonData.DidTheDataTransferPerformedByHCP + '\'' + ','; 
				  updateValueData += 'DT_DidthedatatransferperformedbyHCP1__c = \''+jsonData.DidTheDataTransferPerformedByHCP+'\',';
				}
			else { updateValueData += 'DT_DidthedatatransferperformedbyHCP1__c = \'\','; } 
			if (jsonData.InfoDisplayedByEdeviceIfYES !== undefined && jsonData.InfoDisplayedByEdeviceIfYES !== null && jsonData.InfoDisplayedByEdeviceIfYES !== "null" && jsonData.InfoDisplayedByEdeviceIfYES.length > 0)
				{ insertQueryData += 'DT_InfodisplayedbyedeviceifYES__c,'; valuesData += '\'' + jsonData.InfoDisplayedByEdeviceIfYES + '\'' + ','; 
				  updateValueData += 'DT_InfodisplayedbyedeviceifYES__c = \''+jsonData.InfoDisplayedByEdeviceIfYES+'\',';
				}
			else {updateValueData += 'DT_InfodisplayedbyedeviceifYES__c = \'\',';  } 		
			if (jsonData.DataTransferFromEdeviceToEasypod !== undefined && jsonData.DataTransferFromEdeviceToEasypod !== null && jsonData.DataTransferFromEdeviceToEasypod !== "null" && jsonData.DataTransferFromEdeviceToEasypod.length > 0)
				{ insertQueryData += 'DT_DatatransferfromedevicetoEasypod__c,'; valuesData += '\'' + jsonData.DataTransferFromEdeviceToEasypod + '\'' + ',';
                  updateValueData += 'DT_DatatransferfromedevicetoEasypod__c = \''+jsonData.DataTransferFromEdeviceToEasypod+'\',';
				}
			else { updateValueData += 'DT_DatatransferfromedevicetoEasypod__c = \'\','; } 		
			if (jsonData.ProvideSerialNumberOfTransmitter !== undefined && jsonData.ProvideSerialNumberOfTransmitter !== null && jsonData.ProvideSerialNumberOfTransmitter !== "null" && jsonData.ProvideSerialNumberOfTransmitter.length > 0)
				{ insertQueryData += 'DT_Provideserialnumberoftransmitter__c,'; valuesData += '\'' + jsonData.ProvideSerialNumberOfTransmitter + '\'' + ','; 
				  updateValueData += 'DT_Provideserialnumberoftransmitter__c = \''+jsonData.ProvideSerialNumberOfTransmitter+'\',';
				}
			else { updateValueData += 'DT_Provideserialnumberoftransmitter__c = \'\','; } 		
			if (jsonData.WasUserAbleToPerformDataTransfer !== undefined && jsonData.WasUserAbleToPerformDataTransfer !== null && jsonData.WasUserAbleToPerformDataTransfer !== "null" && jsonData.WasUserAbleToPerformDataTransfer.length > 0)
				{ insertQueryData += 'DT_Wasuserabletoperformdatatransfer__c,'; valuesData += '\'' + jsonData.WasUserAbleToPerformDataTransfer + '\'' + ','; 
				  updateValueData += 'DT_Wasuserabletoperformdatatransfer__c = \''+jsonData.WasUserAbleToPerformDataTransfer+'\',';
				}	
			else { updateValueData += 'DT_Wasuserabletoperformdatatransfer__c = \''+'False'+'\','; }	
			if (jsonData.WasUserAbleToSeeUploadedData !== undefined && jsonData.WasUserAbleToSeeUploadedData !== null && jsonData.WasUserAbleToSeeUploadedData !== "null" && jsonData.WasUserAbleToSeeUploadedData.length > 0)
				{ insertQueryData += 'DT_Wasuserabletoseeuploadeddata__c,'; valuesData += '\'' + jsonData.WasUserAbleToSeeUploadedData + '\'' + ','; 
				  updateValueData += 'DT_Wasuserabletoseeuploadeddata__c = \''+jsonData.WasUserAbleToSeeUploadedData+'\',';
				}
			else { updateValueData += 'DT_Wasuserabletoseeuploadeddata__c = \''+'False'+'\','; }	
			if (jsonData.AreTheUploadedDataAccurate !== undefined && jsonData.AreTheUploadedDataAccurate !== null && jsonData.AreTheUploadedDataAccurate !== "null" && jsonData.AreTheUploadedDataAccurate.length > 0)
				{ insertQueryData += 'DT_AreTheUploadedDataAccurate__c,'; valuesData += '\'' + jsonData.AreTheUploadedDataAccurate + '\'' + ','; 
				  updateValueData += 'DT_AreTheUploadedDataAccurate__c = \''+jsonData.AreTheUploadedDataAccurate+'\',';
				}
			else { updateValueData += 'DT_AreTheUploadedDataAccurate__c = \''+'False'+'\','; }	
			if (jsonData.PleaseProvideDiscrepancyAndDate !== undefined && jsonData.PleaseProvideDiscrepancyAndDate !== null && jsonData.PleaseProvideDiscrepancyAndDate !== "null" && jsonData.PleaseProvideDiscrepancyAndDate.length > 0)
				{ insertQueryData += 'DT_Pleaseprovidediscrepancyanddate__c,'; valuesData += '\'' + jsonData.PleaseProvideDiscrepancyAndDate + '\'' + ','; 
				  updateValueData += 'DT_Pleaseprovidediscrepancyanddate__c = \''+jsonData.PleaseProvideDiscrepancyAndDate+'\',';
				}
			else { updateValueData += 'DT_Pleaseprovidediscrepancyanddate__c = \'\','; } 		
			if (jsonData.DateWhenIssueOccurred !== undefined && jsonData.DateWhenIssueOccurred !== null && jsonData.DateWhenIssueOccurred !== "null" && jsonData.DateWhenIssueOccurred.length > 0)
				{ insertQueryData += 'DT_Datewhenissueoccurred__c,'; valuesData += '\'' + jsonData.DateWhenIssueOccurred + '\'' + ','; 
				  updateValueData += 'DT_Datewhenissueoccurred__c = \''+jsonData.DateWhenIssueOccurred+'\',';
				}
				
			if (jsonData.UserAbleToPerformDataTransferIfNO !== undefined && jsonData.UserAbleToPerformDataTransferIfNO !== null && jsonData.UserAbleToPerformDataTransferIfNO !== "null" && jsonData.UserAbleToPerformDataTransferIfNO.length > 0)
				{ insertQueryData += 'DT_userabletoperformdatatransferifno1__c,'; valuesData += '\'' + jsonData.UserAbleToPerformDataTransferIfNO + '\'' + ','; 
				  updateValueData += 'DT_userabletoperformdatatransferifno1__c = \''+jsonData.UserAbleToPerformDataTransferIfNO+'\',';
				}
			else { updateValueData += 'DT_userabletoperformdatatransferIfNO__c = \'\','; } 		
			if (jsonData.DateWhenTheIssueObservedIfNO !== undefined && jsonData.DateWhenTheIssueObservedIfNO !== null && jsonData.DateWhenTheIssueObservedIfNO !== "null" && jsonData.DateWhenTheIssueObservedIfNO.length > 0)
				{ insertQueryData += 'DT_DateWhenTheIssueObservedIfNO__c,'; valuesData += '\'' + jsonData.DateWhenTheIssueObservedIfNO + '\'' + ','; 
				  updateValueData += 'DT_DateWhenTheIssueObservedIfNO__c = \''+jsonData.DateWhenTheIssueObservedIfNO+'\',';
				}
				
			if (jsonData.IsitaRecurrentFailure !== undefined && jsonData.IsitaRecurrentFailure !== null && jsonData.IsitaRecurrentFailure !== "null" && jsonData.IsitaRecurrentFailure.length > 0)
				{ insertQueryData += 'DT_Isitarecurrentfailure__c,'; valuesData += '\'' + jsonData.IsitaRecurrentFailure + '\'' + ','; 
				  updateValueData += 'DT_Isitarecurrentfailure__c = \''+jsonData.IsitaRecurrentFailure+'\',';
				}
				else { updateValueData += 'DT_Isitarecurrentfailure__c = \''+'False'+'\','; }	
			if (jsonData.PleaseProvideFrequencyIfYES !== undefined && jsonData.PleaseProvideFrequencyIfYES !== null && jsonData.PleaseProvideFrequencyIfYES !== "null" && jsonData.PleaseProvideFrequencyIfYES.length > 0)
				{ insertQueryData += 'DT_ifyesPleaseprovidefrequency__c,'; valuesData += '\'' + jsonData.PleaseProvideFrequencyIfYES + '\'' + ','; 
				  updateValueData += 'DT_ifyesPleaseprovidefrequency__c = \''+jsonData.PleaseProvideFrequencyIfYES+'\',';
				}
			else { updateValueData += 'DT_ifyesPleaseprovidefrequency__c = \'\','; } 		
			if (jsonData.IssueLinkedToTheTransmitter !== undefined && jsonData.IssueLinkedToTheTransmitter !== null && jsonData.IssueLinkedToTheTransmitter !== "null" && jsonData.IssueLinkedToTheTransmitter.length > 0)
				{ insertQueryData += 'DT_IssueLinkedToTheTransmitter__c,'; valuesData += '\'' + jsonData.IssueLinkedToTheTransmitter + '\'' + ','; 
				  updateValueData += 'DT_IssueLinkedToTheTransmitter__c = \''+jsonData.IssueLinkedToTheTransmitter+'\',';
				}
			else { updateValueData += 'DT_IssueLinkedToTheTransmitter__c = \''+'False'+'\','; }		
			if (jsonData.AbnormalBlinkingOfTheTransmitter !== undefined && jsonData.AbnormalBlinkingOfTheTransmitter !== null && jsonData.AbnormalBlinkingOfTheTransmitter !== "null" && jsonData.AbnormalBlinkingOfTheTransmitter.length > 0)
				{ insertQueryData += 'DT_AbnormalBlinkingOfTheTransmitter__c,'; valuesData += '\'' + jsonData.AbnormalBlinkingOfTheTransmitter + '\'' + ','; 
				  updateValueData += 'DT_AbnormalBlinkingOfTheTransmitter__c = \''+jsonData.AbnormalBlinkingOfTheTransmitter+'\',';
				}
	        else { updateValueData += 'DT_AbnormalBlinkingOfTheTransmitter__c = \''+'False'+'\','; }		
	        if (jsonData.WarngMsgDisplaydUponDataTransfer !== undefined && jsonData.WarngMsgDisplaydUponDataTransfer !== null && jsonData.WarngMsgDisplaydUponDataTransfer !== "null" && jsonData.WarngMsgDisplaydUponDataTransfer.length > 0)
                { insertQueryData += 'DT_WarngMsgDisplaydUponDataTransfer__c,'; valuesData += '\'' + jsonData.WarngMsgDisplaydUponDataTransfer + '\'' + ','; 
				  updateValueData += 'DT_WarngMsgDisplaydUponDataTransfer__c = \''+jsonData.WarngMsgDisplaydUponDataTransfer+'\',';
				}
			else { updateValueData += 'DT_WarngMsgDisplaydUponDataTransfer__c = \''+'False'+'\','; }	
                
            if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0){ 
			     insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\'';
			     updateValueData += 'HerokuCaseId__c = \''+jsonData.caseid+ '\'';
			    }

             
            var combinedQuery;
            
            if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0)           
               combinedQuery = 'UPDATE salesforce.IVOP_DecisionTree__c SET '+updateValueData+' WHERE id='+jsonData.DecisionTreeId+'';
            else
               combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
            
            console.log('............combinedQuery.............'+combinedQuery); 
            conn.query(combinedQuery,
                function(err, result) {
                            done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                   }
                                            else{
                                                  if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0){
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:jsonData.DecisionTreeId,
                                                        message: 'Success.'});
						    }
						    else{
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:result.rows[0].id,
                                                        message: 'Success.'});
						    }
                                   }
                });
            }
        });
    });
});



router.post('/insertPowerFailure', function(req, res) {
    console.log('............insertDecisiontree...............');   
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);       
       
        var jsonData = req.body;
        console.log('.....req..body......'+req.body);
        conn.query('SELECT *from salesforce.Case WHERE id='+jsonData.caseid+'',
        function(err,result){
          if (err != null || result.rowCount == 0){
                          return res.json({
                                    caseid: -1,
                                    msgid: 3,
                                    message: 'case id not found.'});
          }else{
            
            var updateValueData = '';
            var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
            var valuesData=' VALUES ('; 
                
            if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0){
                   insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ',';
                   updateValueData += 'DT_DecisionTreeIssueType__c = \''+jsonData.DecisionTreeIssueType+'\',';
                }
            else { updateValueData += 'DT_DecisionTreeIssueType__c = \'\','; }  

            if (jsonData.PFPowerFailure !== undefined && jsonData.PFPowerFailure !== null && jsonData.PFPowerFailure !== "null" && jsonData.PFPowerFailure.length > 0)
                { insertQueryData += 'PF_PowerFailure__c,'; valuesData += '\'' + jsonData.PFPowerFailure + '\'' + ','; 
				  updateValueData += 'PF_PowerFailure__c = \''+jsonData.PFPowerFailure+'\',';
				}
	        else { updateValueData += 'PF_PowerFailure__c = \'\','; } 
			if (jsonData.NPIsTheNoPowerIssueObserved !== undefined && jsonData.NPIsTheNoPowerIssueObserved !== null && jsonData.NPIsTheNoPowerIssueObserved !== "null" && jsonData.NPIsTheNoPowerIssueObserved.length > 0)
				{ insertQueryData += 'PF_NP_Isthenopowerissueobserved__c,'; valuesData += '\'' + jsonData.NPIsTheNoPowerIssueObserved + '\'' + ','; 
				  updateValueData += 'PF_NP_Isthenopowerissueobserved__c = \''+jsonData.NPIsTheNoPowerIssueObserved+'\',';
				}
			 else { updateValueData += 'PF_NP_Isthenopowerissueobserved__c = \'\','; } 
			if (jsonData.NPIsSomethingDisplayedOnDevice !== undefined && jsonData.NPIsSomethingDisplayedOnDevice !== null && jsonData.NPIsSomethingDisplayedOnDevice !== "null" && jsonData.NPIsSomethingDisplayedOnDevice.length > 0)
				{ insertQueryData += 'PF_NP_Issomethingdisplayedondevice__c,'; valuesData += '\'' + jsonData.NPIsSomethingDisplayedOnDevice + '\'' + ','; 
				  updateValueData += 'PF_NP_Issomethingdisplayedondevice__c = \''+jsonData.NPIsSomethingDisplayedOnDevice+'\',';
				}
				
			if (jsonData.NPIsSomethingDisplayedOnDeiviceIfyes !== undefined && jsonData.NPIsSomethingDisplayedOnDeiviceIfyes !== null && jsonData.NPIsSomethingDisplayedOnDeiviceIfyes !== "null" && jsonData.NPIsSomethingDisplayedOnDeiviceIfyes.length > 0)
			   { insertQueryData += 'PF_NP_IssomethingdisplayedondeiviceIfyes__c,'; valuesData += '\'' + jsonData.NPIsSomethingDisplayedOnDeiviceIfyes + '\'' + ','; 
			     updateValueData += 'PF_NP_IssomethingdisplayedondeiviceIfyes__c = \''+jsonData.NPIsSomethingDisplayedOnDeiviceIfyes+'\',';
			   }
			 else { updateValueData += 'PF_NP_IssomethingdisplayedondeiviceIfyes__c = \'\','; } 	
			if (jsonData.NPDoesTheInjectionButtonShowRedLight !== undefined && jsonData.NPDoesTheInjectionButtonShowRedLight !== null && jsonData.NPDoesTheInjectionButtonShowRedLight !== "null" && jsonData.NPDoesTheInjectionButtonShowRedLight.length > 0)
				{ insertQueryData += 'PF_NP_Doestheinjectionbuttonshowredlight__c,'; valuesData += '\'' + jsonData.NPDoesTheInjectionButtonShowRedLight + '\'' + ','; 
				  updateValueData += 'PF_NP_Doestheinjectionbuttonshowredlight__c = \''+jsonData.NPDoesTheInjectionButtonShowRedLight+'\',';
				}
				
			if (jsonData.NPHasthedevicebeendropped !== undefined && jsonData.NPHasthedevicebeendropped !== null && jsonData.NPHasthedevicebeendropped !== "null" && jsonData.NPHasthedevicebeendropped.length > 0)
				{ insertQueryData += 'PF_NP_Hasthedevicebeendropped__c,'; valuesData += '\'' + jsonData.NPHasthedevicebeendropped + '\'' + ','; 
				  updateValueData += 'PF_NP_Hasthedevicebeendropped__c = \''+jsonData.NPHasthedevicebeendropped+'\',';
				}
				
			if (jsonData.NPHasTheDeviceImpactedByColdOrHumid !== undefined && jsonData.NPHasTheDeviceImpactedByColdOrHumid !== null && jsonData.NPHasTheDeviceImpactedByColdOrHumid !== "null" && jsonData.NPHasTheDeviceImpactedByColdOrHumid.length > 0)
				{ insertQueryData += 'PF_NP_Hasthedeviceimpactedbycoldorhumid__c,'; valuesData += '\'' + jsonData.NPHasTheDeviceImpactedByColdOrHumid + '\'' + ','; 
				  updateValueData += 'PF_NP_Hasthedeviceimpactedbycoldorhumid__c = \''+jsonData.NPHasTheDeviceImpactedByColdOrHumid+'\',';
				}
				
			if (jsonData.NPSpecify !== undefined && jsonData.NPSpecify !== null && jsonData.NPSpecify !== "null" && jsonData.NPSpecify.length > 0)
				{ insertQueryData += 'PF_NP_Specify__c,'; valuesData += '\'' + jsonData.NPSpecify + '\'' + ','; 
				  updateValueData += 'PF_NP_Specify__c = \''+jsonData.NPSpecify+'\',';
				}
			else { updateValueData += 'PF_NP_Specify__c = \'\','; } 	
			if (jsonData.NPIsInsertedBatterySpecification !== undefined && jsonData.NPIsInsertedBatterySpecification !== null && jsonData.NPIsInsertedBatterySpecification !== "null" && jsonData.NPIsInsertedBatterySpecification.length > 0)
				{ insertQueryData += 'PF_NP_Isinsertedbatteryspecification__c,'; valuesData += '\'' + jsonData.NPIsInsertedBatterySpecification + '\'' + ','; 
				  updateValueData += 'PF_NP_Isinsertedbatteryspecification__c = \''+jsonData.NPIsInsertedBatterySpecification+'\',';
				}
			
			if (jsonData.NPIsTheBatteryCoverDamaged !== undefined && jsonData.NPIsTheBatteryCoverDamaged !== null && jsonData.NPIsTheBatteryCoverDamaged !== "null" && jsonData.NPIsTheBatteryCoverDamaged.length > 0)
				{ insertQueryData += 'PF_NP_Isthebatterycoverdamaged__c,'; valuesData += '\'' + jsonData.NPIsTheBatteryCoverDamaged + '\'' + ','; 
				  updateValueData += 'PF_NP_Isthebatterycoverdamaged__c = \''+jsonData.NPIsTheBatteryCoverDamaged+'\',';
				}
				
			if (jsonData.NPSometimes !== undefined && jsonData.NPSometimes !== null && jsonData.NPSometimes !== "null" && jsonData.NPSometimes.length > 0)
			   { insertQueryData += 'PF_NP_Sometimes__c,'; valuesData += '\'' + jsonData.NPSometimes + '\'' + ','; 
			     updateValueData += 'PF_NP_Sometimes__c = \''+jsonData.NPSometimes+'\',';
			   }
				
			if (jsonData.NPFrequency !== undefined && jsonData.NPFrequency !== null && jsonData.NPFrequency !== "null" && jsonData.NPFrequency.length > 0)
				{ insertQueryData += 'PF_NP_Frequency__c,'; valuesData += '\'' + jsonData.NPFrequency + '\'' + ','; 
				  updateValueData += 'PF_NP_Frequency__c = \''+jsonData.NPFrequency+'\',';
				}
			else { updateValueData += 'PF_NP_Frequency__c = \'\','; } 	
			if (jsonData.NPSTWhenWasLasttimeIssueObserved !== undefined && jsonData.NPSTWhenWasLasttimeIssueObserved !== null && jsonData.NPSTWhenWasLasttimeIssueObserved !== "null" && jsonData.NPSTWhenWasLasttimeIssueObserved.length > 0)
				{ insertQueryData += 'PF_NP_ST_Whenwaslasttimeissueobserved__c,'; valuesData += '\'' + jsonData.NPSTWhenWasLasttimeIssueObserved + '\'' + ','; 
				  updateValueData += 'PF_NP_ST_Whenwaslasttimeissueobserved__c = \''+jsonData.NPSTWhenWasLasttimeIssueObserved+'\',';
				}
				
				//Power failure - power off
			if (jsonData.PODoesthedeviceturnoffsuddenly !== undefined && jsonData.PODoesthedeviceturnoffsuddenly !== null && jsonData.PODoesthedeviceturnoffsuddenly !== "null" && jsonData.PODoesthedeviceturnoffsuddenly.length > 0)
				{ insertQueryData += 'PF_PO_Doesthedeviceturnoffsuddenly__c,'; valuesData += '\'' + jsonData.PODoesthedeviceturnoffsuddenly + '\'' + ','; 
				  updateValueData += 'PF_PO_Doesthedeviceturnoffsuddenly__c = \''+jsonData.PODoesthedeviceturnoffsuddenly+'\',';
				}
				
			if (jsonData.POPleaseSpecifyInjectionProcess !== undefined && jsonData.POPleaseSpecifyInjectionProcess !== null && jsonData.POPleaseSpecifyInjectionProcess !== "null" && jsonData.POPleaseSpecifyInjectionProcess.length > 0)
				{ insertQueryData += 'PF_PO_Pleasespecifyinjectionprocess__c,'; valuesData += '\'' + jsonData.POPleaseSpecifyInjectionProcess + '\'' + ','; 
				  updateValueData += 'PF_PO_Pleasespecifyinjectionprocess__c = \''+jsonData.POPleaseSpecifyInjectionProcess+'\',';
				}
			else { updateValueData += 'PF_PO_Pleasespecifyinjectionprocess__c = \'\','; } 
			if (jsonData.PODoesTheDeviceStillTurnOn !== undefined && jsonData.PODoesTheDeviceStillTurnOn !== null && jsonData.PODoesTheDeviceStillTurnOn !== "null" && jsonData.PODoesTheDeviceStillTurnOn.length > 0)
				{ insertQueryData += 'PF_PO_Doesthedevicestillturnon__c,'; valuesData += '\'' + jsonData.PODoesTheDeviceStillTurnOn + '\'' + ','; 
				  updateValueData += 'PF_PO_Doesthedevicestillturnon__c = \''+jsonData.PODoesTheDeviceStillTurnOn+'\',';
				}
			
			if (jsonData.PODoesthedevicestillturnonIfYes !== undefined && jsonData.PODoesthedevicestillturnonIfYes !== null && jsonData.PODoesthedevicestillturnonIfYes !== "null" && jsonData.PODoesthedevicestillturnonIfYes.length > 0)
				{ insertQueryData += 'PF_PO_DoesthedevicestillturnonIfYes__c,'; valuesData += '\'' + jsonData.PODoesthedevicestillturnonIfYes + '\'' + ','; 
				  updateValueData += 'PF_PO_DoesthedevicestillturnonIfYes__c = \''+jsonData.PODoesthedevicestillturnonIfYes+'\',';
				}
			 else { updateValueData += 'PF_PO_DoesthedevicestillturnonIfYes__c = \'\','; } 	
			if (jsonData.POHasaWarningMessageBeenDisplayed !== undefined && jsonData.POHasaWarningMessageBeenDisplayed !== null && jsonData.POHasaWarningMessageBeenDisplayed !== "null" && jsonData.POHasaWarningMessageBeenDisplayed.length > 0)
			   { insertQueryData += 'PF_PO_Hasawarningmessagebeendisplayed__c,'; valuesData += '\'' + jsonData.POHasaWarningMessageBeenDisplayed + '\'' + ','; 
			     updateValueData += 'PF_PO_Hasawarningmessagebeendisplayed__c = \''+jsonData.POHasaWarningMessageBeenDisplayed+'\',';
			   }
				
			if (jsonData.POPleaseSpecify !== undefined && jsonData.POPleaseSpecify !== null && jsonData.POPleaseSpecify !== "null" && jsonData.POPleaseSpecify.length > 0)
				{ insertQueryData += 'PF_PO_Pleasespecify__c,'; valuesData += '\'' + jsonData.POPleaseSpecify + '\'' + ','; 
				  updateValueData += 'PF_PO_Pleasespecify__c = \''+jsonData.POPleaseSpecify+'\',';
				}
			 else { updateValueData += 'PF_PO_Pleasespecify__c = \'\','; } 	
			if (jsonData.POPowerOffisAreCurrentFailureObserved !== undefined && jsonData.POPowerOffisAreCurrentFailureObserved !== null && jsonData.POPowerOffisAreCurrentFailureObserved !== "null" && jsonData.POPowerOffisAreCurrentFailureObserved.length > 0)
				{ insertQueryData += 'PF_PO_Poweroffisarecurrentfailureobserve__c,'; valuesData += '\'' + jsonData.POPowerOffisAreCurrentFailureObserved + '\'' + ','; 
				  updateValueData += 'PF_PO_Poweroffisarecurrentfailureobserve__c = \''+jsonData.POPowerOffisAreCurrentFailureObserved+'\',';
				}
				
			if (jsonData.POProvideFrequency !== undefined && jsonData.POProvideFrequency !== null && jsonData.POProvideFrequency !== "null" && jsonData.POProvideFrequency.length > 0)
				{ insertQueryData += 'PF_PO_Providefrequency__c,'; valuesData += '\'' + jsonData.POProvideFrequency + '\'' + ','; 
				  updateValueData += 'PF_PO_Providefrequency__c = \''+jsonData.POProvideFrequency+'\',';
				}
				
			if (jsonData.PODoesDevicePowersoffWithSmallShocks !== undefined && jsonData.PODoesDevicePowersoffWithSmallShocks !== null && jsonData.PODoesDevicePowersoffWithSmallShocks !== "null" && jsonData.PODoesDevicePowersoffWithSmallShocks.length > 0)
				{ insertQueryData += 'PF_PO_Doesdevicepowersoffwithsmallshocks__c,'; valuesData += '\'' + jsonData.PODoesDevicePowersoffWithSmallShocks + '\'' + ','; 
				  updateValueData += 'PF_PO_Doesdevicepowersoffwithsmallshocks__c = \''+jsonData.PODoesDevicePowersoffWithSmallShocks+'\',';
				}
			
			if (jsonData.POHasUserTrytoRemoveandReinsertBattery !== undefined && jsonData.POHasUserTrytoRemoveandReinsertBattery !== null && jsonData.POHasUserTrytoRemoveandReinsertBattery !== "null" && jsonData.POHasUserTrytoRemoveandReinsertBattery.length > 0)
				{ insertQueryData += 'PF_PO_Hasusertrytoremoveandreinsertbatte__c,'; valuesData += '\'' + jsonData.POHasUserTrytoRemoveandReinsertBattery + '\'' + ','; 
				  updateValueData += 'PF_PO_Hasusertrytoremoveandreinsertbatte__c = \''+jsonData.POHasUserTrytoRemoveandReinsertBattery+'\',';
				}	    
				
			// power failure - No power off
			
			if (jsonData.NPODeviceBlckedPreventingToBeTurnoff !== undefined && jsonData.NPODeviceBlckedPreventingToBeTurnoff !== null && jsonData.NPODeviceBlckedPreventingToBeTurnoff !== "null" && jsonData.NPODeviceBlckedPreventingToBeTurnoff.length > 0)
				{ insertQueryData += 'PF_NPO_DeviceBlckedPreventingToBeTurnoff__c,'; valuesData += '\'' + jsonData.NPODeviceBlckedPreventingToBeTurnoff + '\'' + ','; 
				  updateValueData += 'PF_NPO_DeviceBlckedPreventingToBeTurnoff__c = \''+jsonData.NPODeviceBlckedPreventingToBeTurnoff+'\',';
				}
			
			if (jsonData.NPODeviceBlckedPreventingToBeTurnoffIfNo !== undefined && jsonData.NPODeviceBlckedPreventingToBeTurnoffIfNo !== null && jsonData.NPODeviceBlckedPreventingToBeTurnoffIfNo !== "null" && jsonData.NPODeviceBlckedPreventingToBeTurnoffIfNo.length > 0)
				{ insertQueryData += 'PF_NPO_DeviceBlckdPreventingToTurnofIfNo__c,'; valuesData += '\'' + jsonData.NPODeviceBlckedPreventingToBeTurnoffIfNo + '\'' + ','; 
				  updateValueData += 'PF_NPO_DeviceBlckdPreventingToTurnofIfNo__c = \''+jsonData.NPODeviceBlckedPreventingToBeTurnoffIfNo+'\',';
				}   
				
			if (jsonData.NPOWarningMessage !== undefined && jsonData.NPOWarningMessage !== null && jsonData.NPOWarningMessage !== "null" && jsonData.NPOWarningMessage.length > 0)
				{ insertQueryData += 'PF_NPO1_WarningMessage__c,'; valuesData += '\'' + jsonData.NPOWarningMessage + '\'' + ','; 
				  updateValueData += 'PF_NPO1_WarningMessage__c = \''+jsonData.NPOWarningMessage+'\',';
				}
				
			if (jsonData.NPONopoweroffIssueDisplydAtWhatStep !== undefined && jsonData.NPONopoweroffIssueDisplydAtWhatStep !== null && jsonData.NPONopoweroffIssueDisplydAtWhatStep !== "null" && jsonData.NPONopoweroffIssueDisplydAtWhatStep.length > 0)
			   { insertQueryData += 'PF_NPO_NopoweroffIssueDisplydAtWhatStep__c,'; valuesData += '\'' + jsonData.NPONopoweroffIssueDisplydAtWhatStep + '\'' + ','; 
			     updateValueData += 'PF_NPO_NopoweroffIssueDisplydAtWhatStep__c = \''+jsonData.NPONopoweroffIssueDisplydAtWhatStep+'\',';
			   }
				
			if (jsonData.NPOPleaseSpecifyInjectionStep !== undefined && jsonData.NPOPleaseSpecifyInjectionStep !== null && jsonData.NPOPleaseSpecifyInjectionStep !== "null" && jsonData.NPOPleaseSpecifyInjectionStep.length > 0)
				{ insertQueryData += 'PF_NPO_PleaseSpecifyInjectionStep__c,'; valuesData += '\'' + jsonData.NPOPleaseSpecifyInjectionStep + '\'' + ','; 
				  updateValueData += 'PF_NPO_PleaseSpecifyInjectionStep__c = \''+jsonData.NPOPleaseSpecifyInjectionStep+'\',';
				}
			else { updateValueData += 'PF_NPO_PleaseSpecifyInjectionStep__c = \'\','; } 	
			if (jsonData.NPONeedToRemoveBateryToTurnoffDevice !== undefined && jsonData.NPONeedToRemoveBateryToTurnoffDevice !== null && jsonData.NPONeedToRemoveBateryToTurnoffDevice !== "null" && jsonData.NPONeedToRemoveBateryToTurnoffDevice.length > 0)
				{ insertQueryData += 'PF_NPO_NeedToRemoveBateryToTurnoffDevice__c,'; valuesData += '\'' + jsonData.NPONeedToRemoveBateryToTurnoffDevice + '\'' + ','; 
				  updateValueData += 'PF_NPO_NeedToRemoveBateryToTurnoffDevice__c = \''+jsonData.NPONeedToRemoveBateryToTurnoffDevice+'\',';
				}
				
			 if (jsonData.NPOIsSomethingStuckInsideTheDevice !== undefined && jsonData.NPOIsSomethingStuckInsideTheDevice !== null && jsonData.NPOIsSomethingStuckInsideTheDevice !== "null" && jsonData.NPOIsSomethingStuckInsideTheDevice.length > 0)
				{ insertQueryData += 'PF_NPO_IsSomethingStuckInsideTheDevice__c,'; valuesData += '\'' + jsonData.NPOIsSomethingStuckInsideTheDevice + '\'' + ','; 
				  updateValueData += 'PF_NPO_IsSomethingStuckInsideTheDevice__c = \''+jsonData.NPOIsSomethingStuckInsideTheDevice+'\',';
				}
				
			if (jsonData.NPOSpecify !== undefined && jsonData.NPOSpecify !== null && jsonData.NPOSpecify !== "null" && jsonData.NPOSpecify.length > 0)
				{ insertQueryData += 'PF_NPO_Specify__c,'; valuesData += '\'' + jsonData.NPOSpecify + '\'' + ','; 
			      updateValueData += 'PF_NPO_Specify__c = \''+jsonData.NPOSpecify+'\',';	
				}
			 else { updateValueData += 'PF_NPO_Specify__c = \'\','; } 
			if (jsonData.NPOIsItARecurrentFailure !== undefined && jsonData.NPOIsItARecurrentFailure !== null && jsonData.NPOIsItARecurrentFailure !== "null" && jsonData.NPOIsItARecurrentFailure.length > 0)
				{ insertQueryData += 'PF_NPO_IsItARecurrentFailure__c,'; valuesData += '\'' + jsonData.NPOIsItARecurrentFailure + '\'' + ','; 
				  updateValueData += 'PF_NPO_IsItARecurrentFailure__c = \''+jsonData.NPOIsItARecurrentFailure+'\',';
				}
				
			if (jsonData.NPOFrequency !== undefined && jsonData.NPOFrequency !== null && jsonData.NPOFrequency !== "null" && jsonData.NPOFrequency.length > 0)
			   { insertQueryData += 'PF_NPO_Frequency__c,'; valuesData += '\'' + jsonData.NPOFrequency + '\'' + ','; 
			     updateValueData += 'PF_NPO_Frequency__c = \''+jsonData.NPOFrequency+'\',';
			   }
			 else { updateValueData += 'PF_NPO_Frequency__c = \'\','; }  
			if (jsonData.NPOTheLastNoPowerOffIssueObserved !== undefined && jsonData.NPOTheLastNoPowerOffIssueObserved !== null && jsonData.NPOTheLastNoPowerOffIssueObserved !== "null" && jsonData.NPOTheLastNoPowerOffIssueObserved.length > 0)
			   { insertQueryData += 'PF_NPO_TheLastNoPowerOffIssueObserved__c,'; valuesData += '\'' + jsonData.NPOTheLastNoPowerOffIssueObserved + '\'' + ','; 
			     updateValueData += 'PF_NPO_TheLastNoPowerOffIssueObserved__c = \''+jsonData.NPOTheLastNoPowerOffIssueObserved+'\',';
			   }
			   
			 // power failure - Battery consumption   
			
			if (jsonData.BatteryConsumption !== undefined && jsonData.BatteryConsumption !== null && jsonData.BatteryConsumption !== "null" && jsonData.BatteryConsumption.length > 0)
				{ insertQueryData += 'PF_BatteryConsumption__c,'; valuesData += '\'' + jsonData.BatteryConsumption + '\'' + ','; 
				  updateValueData += 'PF_BatteryConsumption__c = \''+jsonData.BatteryConsumption+'\',';
				}
			 else { updateValueData += 'PF_BatteryConsumption__c = \'\','; } 
			if (jsonData.BCWhenWasTheBatteryInserted !== undefined && jsonData.BCWhenWasTheBatteryInserted !== null && jsonData.BCWhenWasTheBatteryInserted !== "null" && jsonData.BCWhenWasTheBatteryInserted.length > 0)
				{ insertQueryData += 'PF_BC_WhenWasTheBatteryInserted__c,'; valuesData += '\'' + jsonData.BCWhenWasTheBatteryInserted + '\'' + ','; 
				  updateValueData += 'PF_BC_WhenWasTheBatteryInserted__c = \''+jsonData.BCWhenWasTheBatteryInserted+'\',';
				}
				
			if (jsonData.BCWhenWasTheBatteryDischarged !== undefined && jsonData.BCWhenWasTheBatteryDischarged !== null && jsonData.BCWhenWasTheBatteryDischarged !== "null" && jsonData.BCWhenWasTheBatteryDischarged.length > 0)
			   { insertQueryData += 'PF_BC_WhenWasTheBatteryDischarged__c,'; valuesData += '\'' + jsonData.BCWhenWasTheBatteryDischarged + '\'' + ','; 
			     updateValueData += 'PF_BC_WhenWasTheBatteryDischarged__c = \''+jsonData.BCWhenWasTheBatteryDischarged+'\',';
			   }
				
			if (jsonData.BCIsAWarningMessageDisplayed !== undefined && jsonData.BCIsAWarningMessageDisplayed !== null && jsonData.BCIsAWarningMessageDisplayed !== "null" && jsonData.BCIsAWarningMessageDisplayed.length > 0)
				{ insertQueryData += 'PF_BC_IsAWarningMessageDisplayed__c,'; valuesData += '\'' + jsonData.BCIsAWarningMessageDisplayed + '\'' + ','; 
				  updateValueData += 'PF_BC_IsAWarningMessageDisplayed__c = \''+jsonData.BCIsAWarningMessageDisplayed+'\',';
				}
				
			if (jsonData.BCWarningMessage !== undefined && jsonData.BCWarningMessage !== null && jsonData.BCWarningMessage !== "null" && jsonData.BCWarningMessage.length > 0)
				{ insertQueryData += 'PF_BC_WarningMessage__c,'; valuesData += '\'' + jsonData.BCWarningMessage + '\'' + ','; 
				  updateValueData += 'PF_BC_WarningMessage__c = \''+jsonData.BCWarningMessage+'\',';
				}
			 else { updateValueData += 'PF_BC_WarningMessage__c = \'\','; } 	
			if (jsonData.BCHasTheFailureBeenFrequentlyObservd !== undefined && jsonData.BCHasTheFailureBeenFrequentlyObservd !== null && jsonData.BCHasTheFailureBeenFrequentlyObservd !== "null" && jsonData.BCHasTheFailureBeenFrequentlyObservd.length > 0)
				{ insertQueryData += 'PF_BC_HasTheFailureBeenFrequentlyObservd__c,'; valuesData += '\'' + jsonData.BCHasTheFailureBeenFrequentlyObservd + '\'' + ','; 
				  updateValueData += 'PF_BC_HasTheFailureBeenFrequentlyObservd__c = \''+jsonData.BCHasTheFailureBeenFrequentlyObservd+'\',';
				}
				
			if (jsonData.BCPleaseProvideFrequency !== undefined && jsonData.BCPleaseProvideFrequency !== null && jsonData.BCPleaseProvideFrequency !== "null" && jsonData.BCPleaseProvideFrequency.length > 0)
				{ insertQueryData += 'PF_BC_PleaseProvideFrequency__c,'; valuesData += '\'' + jsonData.BCPleaseProvideFrequency + '\'' + ','; 
				  updateValueData += 'PF_BC_PleaseProvideFrequency__c = \''+jsonData.BCPleaseProvideFrequency+'\',';
				}
			 else { updateValueData += 'PF_BC_PleaseProvideFrequency__c = \'\','; } 	
			if (jsonData.BCBatteryWithinSpecifications !== undefined && jsonData.BCBatteryWithinSpecifications !== null && jsonData.BCBatteryWithinSpecifications !== "null" && jsonData.BCBatteryWithinSpecifications.length > 0)
				{ insertQueryData += 'PF_BC_BatteryWithinSpecifications__c,'; valuesData += '\'' + jsonData.BCBatteryWithinSpecifications + '\'' + ','; 
				  updateValueData += 'PF_BC_BatteryWithinSpecifications__c = \''+jsonData.BCBatteryWithinSpecifications+'\',';
				}
				
			if (jsonData.BCBatteryProperlyPlaced !== undefined && jsonData.BCBatteryProperlyPlaced !== null && jsonData.BCBatteryProperlyPlaced !== "null" && jsonData.BCBatteryProperlyPlaced.length > 0)
				{ insertQueryData += 'PF_BC_BatteryProperlyPlaced__c,'; valuesData += '\'' + jsonData.BCBatteryProperlyPlaced + '\'' + ','; 
				  updateValueData += 'PF_BC_BatteryProperlyPlaced__c = \''+jsonData.BCBatteryProperlyPlaced+'\',';
				}
				
			if (jsonData.BCBatteryCoverClosed !== undefined && jsonData.BCBatteryCoverClosed !== null && jsonData.BCBatteryCoverClosed !== "null" && jsonData.BCBatteryCoverClosed.length > 0)
				{ insertQueryData += 'PF_BC_BatteryCoverClosed__c,'; valuesData += '\'' + jsonData.BCBatteryCoverClosed + '\'' + ','; 
				  updateValueData += 'PF_BC_BatteryCoverClosed__c = \''+jsonData.BCBatteryCoverClosed+'\',';
				}
				
			if (jsonData.BCHasTheDeviceBeenImpactedByHumidity !== undefined && jsonData.BCHasTheDeviceBeenImpactedByHumidity !== null && jsonData.BCHasTheDeviceBeenImpactedByHumidity !== "null" && jsonData.BCHasTheDeviceBeenImpactedByHumidity.length > 0)
				{ insertQueryData += 'PF_BC_HasTheDeviceBeenImpactedByHumidity__c,'; valuesData += '\'' + jsonData.BCHasTheDeviceBeenImpactedByHumidity + '\'' + ','; 
				  updateValueData += 'PF_BC_HasTheDeviceBeenImpactedByHumidity__c = \''+jsonData.BCHasTheDeviceBeenImpactedByHumidity+'\',';
				}
	    
                
            if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0){ 
			     insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\'';
			     updateValueData += 'HerokuCaseId__c = \''+jsonData.caseid+ '\'';
			    }

             
            var combinedQuery;
            
            if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0)           
               combinedQuery = 'UPDATE salesforce.IVOP_DecisionTree__c SET '+updateValueData+' WHERE id='+jsonData.DecisionTreeId+'';
            else
               combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
            
            console.log('............combinedQuery.............'+combinedQuery); 
            conn.query(combinedQuery,
                function(err, result) {
                            done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                   }
                                            else{
                                                   if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0){
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:jsonData.DecisionTreeId,
                                                        message: 'Success.'});
						    }
						    else{
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:result.rows[0].id,
                                                        message: 'Success.'});
						    }
                                   }
                });
            }
        });
    });
});


router.post('/insertCatridgeIssue', function(req, res) {
    console.log('............insertDecisiontree...............');   
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);       
       
        var jsonData = req.body;
        console.log('.....req..body......'+req.body);
        conn.query('SELECT *from salesforce.Case WHERE id='+jsonData.caseid+'',
        function(err,result){
          if (err != null || result.rowCount == 0){
                          return res.json({
                                    caseid: -1,
                                    msgid: 3,
                                    message: 'case id not found.'});
          }else{
            
            var updateValueData = '';
            var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
            var valuesData=' VALUES ('; 
                
            if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0){
                   insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ',';
                   updateValueData += 'DT_DecisionTreeIssueType__c = \''+jsonData.DecisionTreeIssueType+'\',';
                }
            else { updateValueData += 'DT_DecisionTreeIssueType__c = \'\','; }  

             //Cartridgeissue
	    
			if (jsonData.CartridgeIssue !== undefined && jsonData.CartridgeIssue !== null && jsonData.CartridgeIssue !== "null" && jsonData.CartridgeIssue.length > 0)
				{ insertQueryData += 'CI_Cartridgeissue__c,'; valuesData += '\'' + jsonData.CartridgeIssue + '\'' + ',';
                  updateValueData += 'CI_Cartridgeissue__c = \''+jsonData.CartridgeIssue+'\',';
				}
				else { updateValueData += 'CI_Cartridgeissue__c = \'\','; } 
				
			if (jsonData.CDCartridgeDetection !== undefined && jsonData.CDCartridgeDetection !== null && jsonData.CDCartridgeDetection !== "null" && jsonData.CDCartridgeDetection.length > 0)
				{ insertQueryData += 'CI_CartridgeDetection__c,'; valuesData += '\'' + jsonData.CDCartridgeDetection + '\'' + ','; 
				updateValueData += 'CI_CartridgeDetection__c = \''+jsonData.CDCartridgeDetection+'\',';
				}
				else { updateValueData += 'CI_CartridgeDetection__c = \'\','; } 
			if (jsonData.CDTypeOfCartridgeSelectedInSetting !== undefined && jsonData.CDTypeOfCartridgeSelectedInSetting !== null && jsonData.CDTypeOfCartridgeSelectedInSetting !== "null" && jsonData.CDTypeOfCartridgeSelectedInSetting.length > 0)
				{ insertQueryData += 'CI_CD_TypeOfCartridgeSelectedInSetting__c,'; valuesData += '\'' + jsonData.CDTypeOfCartridgeSelectedInSetting + '\'' + ','; 
				updateValueData += 'CI_CD_TypeOfCartridgeSelectedInSetting__c = \''+jsonData.CDTypeOfCartridgeSelectedInSetting+'\',';
				}
			else { updateValueData += 'CI_CD_TypeOfCartridgeSelectedInSetting__c = \'\','; } 
			if (jsonData.CDWhatIsTheTypeOfInsertedCartridge !== undefined && jsonData.CDWhatIsTheTypeOfInsertedCartridge !== null && jsonData.CDWhatIsTheTypeOfInsertedCartridge !== "null" && jsonData.CDWhatIsTheTypeOfInsertedCartridge.length > 0)
				{ insertQueryData += 'CI_CD_WhatIsTheTypeOfInsertedCartridge__c,'; valuesData += '\'' + jsonData.CDWhatIsTheTypeOfInsertedCartridge + '\'' + ','; 
				updateValueData += 'CI_CD_WhatIsTheTypeOfInsertedCartridge__c = \''+jsonData.CDWhatIsTheTypeOfInsertedCartridge+'\',';
				}
				else { updateValueData += 'CI_CD_WhatIsTheTypeOfInsertedCartridge__c = \'\','; } 
			if (jsonData.CDIsAWarningMessageDisplayed !== undefined && jsonData.CDIsAWarningMessageDisplayed !== null && jsonData.CDIsAWarningMessageDisplayed !== "null" && jsonData.CDIsAWarningMessageDisplayed.length > 0)
			   { insertQueryData += 'CI_CD_IsAWarningMessageDisplayed__c,'; valuesData += '\'' + jsonData.CDIsAWarningMessageDisplayed + '\'' + ','; 
			   updateValueData += 'CI_CD_IsAWarningMessageDisplayed__c = \''+jsonData.CDIsAWarningMessageDisplayed+'\',';
			   }
				
			if (jsonData.CDIsAWarningMessageDisplayedIfYes !== undefined && jsonData.CDIsAWarningMessageDisplayedIfYes !== null && jsonData.CDIsAWarningMessageDisplayedIfYes !== "null" && jsonData.CDIsAWarningMessageDisplayedIfYes.length > 0)
				{ insertQueryData += 'CI_CD_IsAWarningMessageDisplayedIfYes__c,'; valuesData += '\'' + jsonData.CDIsAWarningMessageDisplayedIfYes + '\'' + ','; 
				updateValueData += 'CI_CD_IsAWarningMessageDisplayedIfYes__c = \''+jsonData.CDIsAWarningMessageDisplayedIfYes+'\',';
				}
				else { updateValueData += 'CI_CD_IsAWarningMessageDisplayedIfYes__c = \'\','; } 
			if (jsonData.CDCartridgeStillContainingMedication !== undefined && jsonData.CDCartridgeStillContainingMedication !== null && jsonData.CDCartridgeStillContainingMedication !== "null" && jsonData.CDCartridgeStillContainingMedication.length > 0)
				{ insertQueryData += 'CI_CD_CartridgeStillContainingMedication__c,'; valuesData += '\'' + jsonData.CDCartridgeStillContainingMedication + '\'' + ','; 
				updateValueData += 'CI_CD_CartridgeStillContainingMedication__c = \''+jsonData.CDCartridgeStillContainingMedication+'\',';
				}
			
			if (jsonData.CDCartridgeexpired !== undefined && jsonData.CDCartridgeexpired !== null && jsonData.CDCartridgeexpired !== "null" && jsonData.CDCartridgeexpired.length > 0)
				{ insertQueryData += 'CI_CD_Cartridgeexpired__c,'; valuesData += '\'' + jsonData.CDCartridgeexpired + '\'' + ','; 
				updateValueData += 'CI_CD_Cartridgeexpired__c = \''+jsonData.CDCartridgeexpired+'\',';
				}
				else { updateValueData += 'CI_CD_Cartridgeexpired__c = \'\','; } 
			if (jsonData.CDWhenCartridgeWasInsertedInDevice !== undefined && jsonData.CDWhenCartridgeWasInsertedInDevice !== null && jsonData.CDWhenCartridgeWasInsertedInDevice !== "null" && jsonData.CDWhenCartridgeWasInsertedInDevice.length > 0)
				{ insertQueryData += 'CI_CD_WhenCartridgeWasInsertedInDevice__c,'; valuesData += '\'' + jsonData.CDWhenCartridgeWasInsertedInDevice + '\'' + ','; 
				updateValueData += 'CI_CD_WhenCartridgeWasInsertedInDevice__c = \''+jsonData.CDWhenCartridgeWasInsertedInDevice+'\',';
				}
				
			if (jsonData.CDDevicePromptToRemoveTheCartridge !== undefined && jsonData.CDDevicePromptToRemoveTheCartridge !== null && jsonData.CDDevicePromptToRemoveTheCartridge !== "null" && jsonData.CDDevicePromptToRemoveTheCartridge.length > 0)
				{ insertQueryData += 'CI_CD_DevicePromptToRemoveTheCartridge__c,'; valuesData += '\'' + jsonData.CDDevicePromptToRemoveTheCartridge + '\'' + ','; 
				updateValueData += 'CI_CD_DevicePromptToRemoveTheCartridge__c = \''+jsonData.CDDevicePromptToRemoveTheCartridge+'\',';
				}
			
			if (jsonData.CDCatridgeDetectionIssueWithOneOrAll !== undefined && jsonData.CDCatridgeDetectionIssueWithOneOrAll !== null && jsonData.CDCatridgeDetectionIssueWithOneOrAll !== "null" && jsonData.CDCatridgeDetectionIssueWithOneOrAll.length > 0)
				{ insertQueryData += 'CI_CD_CatridgeDetectionIssueWithOneOrAll__c,'; valuesData += '\'' + jsonData.CDCatridgeDetectionIssueWithOneOrAll + '\'' + ','; 
				updateValueData += 'CI_CD_CatridgeDetectionIssueWithOneOrAll__c = \''+jsonData.CDCatridgeDetectionIssueWithOneOrAll+'\',';
				}
				else { updateValueData += 'CI_CD_CatridgeDetectionIssueWithOneOrAll__c = \'\','; } 
			if (jsonData.CDIsTheCartridgeDoorDamaged !== undefined && jsonData.CDIsTheCartridgeDoorDamaged !== null && jsonData.CDIsTheCartridgeDoorDamaged !== "null" && jsonData.CDIsTheCartridgeDoorDamaged.length > 0)
			   { insertQueryData += 'CI_CD_IsTheCartridgeDoorDamaged__c,'; valuesData += '\'' + jsonData.CDIsTheCartridgeDoorDamaged + '\'' + ','; 
			   updateValueData += 'CI_CD_IsTheCartridgeDoorDamaged__c = \''+jsonData.CDIsTheCartridgeDoorDamaged+'\',';
			   }
				
			if (jsonData.CDPlungerRodMoveOnInsertingCartridge !== undefined && jsonData.CDPlungerRodMoveOnInsertingCartridge !== null && jsonData.CDPlungerRodMoveOnInsertingCartridge !== "null" && jsonData.CDPlungerRodMoveOnInsertingCartridge.length > 0)
				{ insertQueryData += 'CI_CD_PlungerRodMoveOnInsertingCartridge__c,'; valuesData += '\'' + jsonData.CDPlungerRodMoveOnInsertingCartridge + '\'' + ','; 
				updateValueData += 'CI_CD_PlungerRodMoveOnInsertingCartridge__c = \''+jsonData.CDPlungerRodMoveOnInsertingCartridge+'\',';
				}
				
			if (jsonData.CDIsTheCartridgeNew !== undefined && jsonData.CDIsTheCartridgeNew !== null && jsonData.CDIsTheCartridgeNew !== "null" && jsonData.CDIsTheCartridgeNew.length > 0)
				{ insertQueryData += 'CI_CD_IsTheCartridgeNew__c,'; valuesData += '\'' + jsonData.CDIsTheCartridgeNew + '\'' + ','; 
				updateValueData += 'CI_CD_IsTheCartridgeNew__c = \''+jsonData.CDIsTheCartridgeNew+'\',';
				}
			 else { updateValueData += 'CI_CD_IsTheCartridgeNew__c = \''+'False'+'\','; }
		  
		        if (jsonData.CDCartridgeLabelBeenRemovedReplaced !== undefined && jsonData.CDCartridgeLabelBeenRemovedReplaced !== null && jsonData.CDCartridgeLabelBeenRemovedReplaced !== "null" && jsonData.CDCartridgeLabelBeenRemovedReplaced.length > 0)
				{ insertQueryData += 'CI_CD_CartridgeLabelBeenRemovedReplaced__c,'; valuesData += '\'' + jsonData.CDCartridgeLabelBeenRemovedReplaced + '\'' + ','; 
				updateValueData += 'CI_CD_CartridgeLabelBeenRemovedReplaced__c = \''+jsonData.CDCartridgeLabelBeenRemovedReplaced+'\',';
				}
			 else { updateValueData += 'CI_CD_CartridgeLabelBeenRemovedReplaced__c = \''+'False'+'\','; }
		  
			if (jsonData.CDIsTheCartridgeNewIfNo !== undefined && jsonData.CDIsTheCartridgeNewIfNo !== null && jsonData.CDIsTheCartridgeNewIfNo !== "null" && jsonData.CDIsTheCartridgeNewIfNo.length > 0)
				{ insertQueryData += 'CI_CD_IsTheCartridgeNewIfNo__c,'; valuesData += '\'' + jsonData.CDIsTheCartridgeNewIfNo + '\'' + ','; 
				updateValueData += 'CI_CD_IsTheCartridgeNewIfNo__c = \''+jsonData.CDIsTheCartridgeNewIfNo+'\',';
				}
				else { updateValueData += 'CI_CD_IsTheCartridgeNewIfNo__c = \'\','; } 
			if (jsonData.CDDidTheDevicPromptToRemoveCartridge !== undefined && jsonData.CDDidTheDevicPromptToRemoveCartridge !== null && jsonData.CDDidTheDevicPromptToRemoveCartridge !== "null" && jsonData.CDDidTheDevicPromptToRemoveCartridge.length > 0)
				{ insertQueryData += 'CI_CD_DidTheDevicPromptToRemoveCartridge__c,'; valuesData += '\'' + jsonData.CDDidTheDevicPromptToRemoveCartridge + '\'' + ','; 
				updateValueData += 'CI_CD_DidTheDevicPromptToRemoveCartridge__c = \''+jsonData.CDDidTheDevicPromptToRemoveCartridge+'\',';
				}
				
			if (jsonData.CDCartridgeDetectionIssueWitOneOrAll !== undefined && jsonData.CDCartridgeDetectionIssueWitOneOrAll !== null && jsonData.CDCartridgeDetectionIssueWitOneOrAll !== "null" && jsonData.CDCartridgeDetectionIssueWitOneOrAll.length > 0)
				{ insertQueryData += 'CI_CD_CartridgeDetectionIssueWitOneOrAll__c,'; valuesData += '\'' + jsonData.CDCartridgeDetectionIssueWitOneOrAll + '\'' + ','; 
				updateValueData += 'CI_CD_CartridgeDetectionIssueWitOneOrAll__c = \''+jsonData.CDCartridgeDetectionIssueWitOneOrAll+'\',';
				}
               else { updateValueData += 'CI_CD_CartridgeDetectionIssueWitOneOrAll__c = \'\','; } 
			//Cartridge warning message
			if (jsonData.CWMCartridgeWarningMessage !== undefined && jsonData.CWMCartridgeWarningMessage !== null && jsonData.CWMCartridgeWarningMessage !== "null" && jsonData.CWMCartridgeWarningMessage.length > 0)
				{ insertQueryData += 'CI_CWM_CartridgeWarningMessage__c,'; valuesData += '\'' + jsonData.CWMCartridgeWarningMessage + '\'' + ','; 
				updateValueData += 'CI_CWM_CartridgeWarningMessage__c = \''+jsonData.CWMCartridgeWarningMessage+'\',';
				}
				else { updateValueData += 'CI_CWM_CartridgeWarningMessage__c = \'\','; } 
			//Broken cartridge
			 if (jsonData.BCIsBrokenCartridgeInsideTheDevice !== undefined && jsonData.BCIsBrokenCartridgeInsideTheDevice !== null && jsonData.BCIsBrokenCartridgeInsideTheDevice !== "null" && jsonData.BCIsBrokenCartridgeInsideTheDevice.length > 0)
				{ insertQueryData += 'CI_BC_IsBrokenCartridgeInsideTheDevice__c,'; valuesData += '\'' + jsonData.BCIsBrokenCartridgeInsideTheDevice + '\'' + ','; 
				updateValueData += 'CI_BC_IsBrokenCartridgeInsideTheDevice__c = \''+jsonData.BCIsBrokenCartridgeInsideTheDevice+'\',';
				}   
				
			if (jsonData.BCHasTheDeviceBeenDropped !== undefined && jsonData.BCHasTheDeviceBeenDropped !== null && jsonData.BCHasTheDeviceBeenDropped !== "null" && jsonData.BCHasTheDeviceBeenDropped.length > 0)
				{ insertQueryData += 'CI_BC_HasTheDeviceBeenDropped__c,'; valuesData += '\'' + jsonData.BCHasTheDeviceBeenDropped + '\'' + ','; 
				updateValueData += 'CI_BC_HasTheDeviceBeenDropped__c = \''+jsonData.BCHasTheDeviceBeenDropped+'\',';
				}
						
			if (jsonData.BCCatridgeBrokenDueImproperFunctning !== undefined && jsonData.BCCatridgeBrokenDueImproperFunctning !== null && jsonData.BCCatridgeBrokenDueImproperFunctning !== "null" && jsonData.BCCatridgeBrokenDueImproperFunctning.length > 0)
				{ insertQueryData += 'CI_BC_CatridgeBrokenDueImproperFunctning__c,'; valuesData += '\'' + jsonData.BCCatridgeBrokenDueImproperFunctning + '\'' + ','; 
				updateValueData += 'CI_BC_CatridgeBrokenDueImproperFunctning__c = \''+jsonData.BCCatridgeBrokenDueImproperFunctning+'\',';
				}
				
			if (jsonData.BCIsAWarningMessageDisplayed !== undefined && jsonData.BCIsAWarningMessageDisplayed !== null && jsonData.BCIsAWarningMessageDisplayed !== "null" && jsonData.BCIsAWarningMessageDisplayed.length > 0)
				{ insertQueryData += 'CI_BC_IsAWarningMessageDisplayed__c,'; valuesData += '\'' + jsonData.BCIsAWarningMessageDisplayed + '\'' + ','; 
				updateValueData += 'CI_BC_IsAWarningMessageDisplayed__c = \''+jsonData.BCIsAWarningMessageDisplayed+'\',';
				}
			
			if (jsonData.BCWarningMessage !== undefined && jsonData.BCWarningMessage !== null && jsonData.BCWarningMessage !== "null" && jsonData.BCWarningMessage.length > 0)
				{ insertQueryData += 'CI_BC_WarningMessage__c,'; valuesData += '\'' + jsonData.BCWarningMessage + '\'' + ','; 
				updateValueData += 'CI_BC_WarningMessage__c = \''+jsonData.BCWarningMessage+'\',';
				}
			else { updateValueData += 'CI_BC_WarningMessage__c = \'\','; } 	
			if (jsonData.BCShowCartridgeSubCategory !== undefined && jsonData.BCShowCartridgeSubCategory !== null && jsonData.BCShowCartridgeSubCategory !== "null" && jsonData.BCShowCartridgeSubCategory.length > 0)
			   { insertQueryData += 'CI_BC_ShowCartridgeSubCategory__c,'; valuesData += '\'' + jsonData.BCShowCartridgeSubCategory + '\'' + ','; 
			   updateValueData += 'CI_BC_ShowCartridgeSubCategory__c = \''+jsonData.BCShowCartridgeSubCategory+'\',';
			   }
			 else { updateValueData += 'CI_BC_ShowCartridgeSubCategory__c = \'\','; }   
			//Cartridge Consumption
			
			if (jsonData.CartridgeConsumption !== undefined && jsonData.CartridgeConsumption !== null && jsonData.CartridgeConsumption !== "null" && jsonData.CartridgeConsumption.length > 0)
				{ insertQueryData += 'CI_CartridgeConsumption__c,'; valuesData += '\'' + jsonData.CartridgeConsumption + '\'' + ','; 
				updateValueData += 'CI_CartridgeConsumption__c = \''+jsonData.CartridgeConsumption+'\',';
				}
				else { updateValueData += 'CI_CartridgeConsumption__c = \'\','; } 
			if (jsonData.CCMoreInjectionsCouldHavPerformed !== undefined && jsonData.CCMoreInjectionsCouldHavPerformed !== null && jsonData.CCMoreInjectionsCouldHavPerformed !== "null" && jsonData.CCMoreInjectionsCouldHavPerformed.length > 0)
				{ insertQueryData += 'CI_CC_MoreInjectionsCouldHavPerformed__c,'; valuesData += '\'' + jsonData.CCMoreInjectionsCouldHavPerformed + '\'' + ','; 
				updateValueData += 'CI_CC_MoreInjectionsCouldHavPerformed__c = \''+jsonData.CCMoreInjectionsCouldHavPerformed+'\',';
				}
			else { updateValueData += 'CI_CC_MoreInjectionsCouldHavPerformed__c = \'\','; } 
			if (jsonData.CCIssueLinkedToTheDoseCountDisplay !== undefined && jsonData.CCIssueLinkedToTheDoseCountDisplay !== null && jsonData.CCIssueLinkedToTheDoseCountDisplay !== "null" && jsonData.CCIssueLinkedToTheDoseCountDisplay.length > 0)
				{ insertQueryData += 'CI_CC_IssueLinkedToTheDoseCountDisplay__c,'; valuesData += '\'' + jsonData.CCIssueLinkedToTheDoseCountDisplay + '\'' + ','; 
				updateValueData += 'CI_CC_IssueLinkedToTheDoseCountDisplay__c = \''+jsonData.CCIssueLinkedToTheDoseCountDisplay+'\',';
				}
				
			if (jsonData.CCFrequency !== undefined && jsonData.CCFrequency !== null && jsonData.CCFrequency !== "null" && jsonData.CCFrequency.length > 0)
			   { insertQueryData += 'CI_CC_Frequency__c,'; valuesData += '\'' + jsonData.CCFrequency + '\'' + ','; 
			   updateValueData += 'CI_CC_Frequency__c = \''+jsonData.CCFrequency+'\',';
			   }
				else { updateValueData += 'CI_CC_Frequency__c = \'\','; } 
			if (jsonData.CCHasSettingOfDeviceChangedRecently !== undefined && jsonData.CCHasSettingOfDeviceChangedRecently !== null && jsonData.CCHasSettingOfDeviceChangedRecently !== "null" && jsonData.CCHasSettingOfDeviceChangedRecently.length > 0)
				{ insertQueryData += 'CI_CC_HasSettingOfDeviceChangedRecently__c,'; valuesData += '\'' + jsonData.CCHasSettingOfDeviceChangedRecently + '\'' + ','; 
				updateValueData += 'CI_CC_HasSettingOfDeviceChangedRecently__c = \''+jsonData.CCHasSettingOfDeviceChangedRecently+'\',';
				}
				
			if (jsonData.CCSpecify !== undefined && jsonData.CCSpecify !== null && jsonData.CCSpecify !== "null" && jsonData.CCSpecify.length > 0)
				{ insertQueryData += 'CI_CC_Specify__c,'; valuesData += '\'' + jsonData.CCSpecify + '\'' + ','; 
				updateValueData += 'CI_CC_Specify__c = \''+jsonData.CCSpecify+'\',';
				}
			else { updateValueData += 'CI_CC_Specify__c = \'\','; } 
			if (jsonData.CCWhenTheIssueHasBeenObserved !== undefined && jsonData.CCWhenTheIssueHasBeenObserved !== null && jsonData.CCWhenTheIssueHasBeenObserved !== "null" && jsonData.CCWhenTheIssueHasBeenObserved.length > 0)
				{ insertQueryData += 'CI_CC_WhenTheIssueHasBeenObserved__c,'; valuesData += '\'' + jsonData.CCWhenTheIssueHasBeenObserved + '\'' + ','; 
				updateValueData += 'CI_CC_WhenTheIssueHasBeenObserved__c = \''+jsonData.CCWhenTheIssueHasBeenObserved+'\',';
				}
			
			if (jsonData.CCWhenCartridgeWithMoreInjectinPerfm !== undefined && jsonData.CCWhenCartridgeWithMoreInjectinPerfm !== null && jsonData.CCWhenCartridgeWithMoreInjectinPerfm !== "null" && jsonData.CCWhenCartridgeWithMoreInjectinPerfm.length > 0)
				{ insertQueryData += 'CI_CC_WhenCartridgeWithMoreInjectinPerfm__c,'; valuesData += '\'' + jsonData.CCWhenCartridgeWithMoreInjectinPerfm + '\'' + ','; 
				updateValueData += 'CI_CC_WhenCartridgeWithMoreInjectinPerfm__c = \''+jsonData.CCWhenCartridgeWithMoreInjectinPerfm+'\',';
				}
			
			if (jsonData.CCLesInjectnsThanExpectedHavPerformd !== undefined && jsonData.CCLesInjectnsThanExpectedHavPerformd !== null && jsonData.CCLesInjectnsThanExpectedHavPerformd !== "null" && jsonData.CCLesInjectnsThanExpectedHavPerformd.length > 0)
				{ insertQueryData += 'CI_CC_LesInjectnsThanExpectedHavPerformd__c,'; valuesData += '\'' + jsonData.CCLesInjectnsThanExpectedHavPerformd + '\'' + ','; 
				updateValueData += 'CI_CC_LesInjectnsThanExpectedHavPerformd__c = \''+jsonData.CCLesInjectnsThanExpectedHavPerformd+'\',';
				}
			else { updateValueData += 'CI_CC_LesInjectnsThanExpectedHavPerformd__c = \'\','; } 	
			if (jsonData.CCHowManyInjectionShouldHavePerformd !== undefined && jsonData.CCHowManyInjectionShouldHavePerformd !== null && jsonData.CCHowManyInjectionShouldHavePerformd !== "null" && jsonData.CCHowManyInjectionShouldHavePerformd.length > 0)
				{ insertQueryData += 'CI_CC_HowManyInjectionShouldHavePerformd__c,'; valuesData += '\'' + jsonData.CCHowManyInjectionShouldHavePerformd + '\'' + ','; 
				updateValueData += 'CI_CC_HowManyInjectionShouldHavePerformd__c = \''+jsonData.CCHowManyInjectionShouldHavePerformd+'\',';
				}
			else { updateValueData += 'CI_CC_HowManyInjectionShouldHavePerformd__c = \'\','; } 
			if (jsonData.CCHowManyInjectionCouldHavPerformd !== undefined && jsonData.CCHowManyInjectionCouldHavPerformd !== null && jsonData.CCHowManyInjectionCouldHavPerformd !== "null" && jsonData.CCHowManyInjectionCouldHavPerformd.length > 0)
				{ insertQueryData += 'CI_CC_HowManyInjectionCouldHavPerformd__c,'; valuesData += '\'' + jsonData.CCHowManyInjectionCouldHavPerformd + '\'' + ','; 
				updateValueData += 'CI_CC_HowManyInjectionCouldHavPerformd__c = \''+jsonData.CCHowManyInjectionCouldHavPerformd+'\',';
				}
			else { updateValueData += 'CI_CC_HowManyInjectionCouldHavPerformd__c = \'\','; } 	
			if (jsonData.CCProvideDoseSetAndDoseAdjustment !== undefined && jsonData.CCProvideDoseSetAndDoseAdjustment !== null && jsonData.CCProvideDoseSetAndDoseAdjustment !== "null" && jsonData.CCProvideDoseSetAndDoseAdjustment.length > 0)
			   { insertQueryData += 'CI_CC_ProvideDoseSetAndDoseAdjustment__c,'; valuesData += '\'' + jsonData.CCProvideDoseSetAndDoseAdjustment + '\'' + ','; 
			   updateValueData += 'CI_CC_ProvideDoseSetAndDoseAdjustment__c = \''+jsonData.CCProvideDoseSetAndDoseAdjustment+'\',';
			   }
			else { updateValueData += 'CI_CC_ProvideDoseSetAndDoseAdjustment__c = \'\','; } 	
			if (jsonData.CCWhenTheCartridgeBeenInserted !== undefined && jsonData.CCWhenTheCartridgeBeenInserted !== null && jsonData.CCWhenTheCartridgeBeenInserted !== "null" && jsonData.CCWhenTheCartridgeBeenInserted.length > 0)
				{ insertQueryData += 'CI_CC_WhenTheCartridgeBeenInserted__c,'; valuesData += '\'' + jsonData.CCWhenTheCartridgeBeenInserted + '\'' + ','; 
				updateValueData += 'CI_CC_WhenTheCartridgeBeenInserted__c = \''+jsonData.CCWhenTheCartridgeBeenInserted+'\',';
				}
				
			if (jsonData.CCHasTheCartridgeBeenRejectedByDevic !== undefined && jsonData.CCHasTheCartridgeBeenRejectedByDevic !== null && jsonData.CCHasTheCartridgeBeenRejectedByDevic !== "null" && jsonData.CCHasTheCartridgeBeenRejectedByDevic.length > 0)
				{ insertQueryData += 'CI_CC_HasTheCartridgeBeenRejectedByDevic__c,'; valuesData += '\'' + jsonData.CCHasTheCartridgeBeenRejectedByDevic + '\'' + ','; 
				updateValueData += 'CI_CC_HasTheCartridgeBeenRejectedByDevic__c = \''+jsonData.CCHasTheCartridgeBeenRejectedByDevic+'\',';
				}
			
			if (jsonData.CCHasCartridgeRejectedByDeviceIfNO !== undefined && jsonData.CCHasCartridgeRejectedByDeviceIfNO !== null && jsonData.CCHasCartridgeRejectedByDeviceIfNO !== "null" && jsonData.CCHasCartridgeRejectedByDeviceIfNO.length > 0)
				{ insertQueryData += 'CI_CC_HasCartridgeRejectedByDeviceIfNo__c,'; valuesData += '\'' + jsonData.CCHasCartridgeRejectedByDeviceIfNO + '\'' + ','; 
				updateValueData += 'CI_CC_HasCartridgeRejectedByDeviceIfNo__c = \''+jsonData.CCHasCartridgeRejectedByDeviceIfNO+'\',';
				}
				else { updateValueData += 'CI_CC_HasCartridgeRejectedByDeviceIfNo__c = \'\','; } 
			if (jsonData.CCIsAWarningMessageBeenDisplayed !== undefined && jsonData.CCIsAWarningMessageBeenDisplayed !== null && jsonData.CCIsAWarningMessageBeenDisplayed !== "null" && jsonData.CCIsAWarningMessageBeenDisplayed.length > 0)
				{ insertQueryData += 'CI_CC_IsAWarningMessageBeenDisplayed__c,'; valuesData += '\'' + jsonData.CCIsAWarningMessageBeenDisplayed + '\'' + ','; 
				updateValueData += 'CI_CC_IsAWarningMessageBeenDisplayed__c = \''+jsonData.CCIsAWarningMessageBeenDisplayed+'\',';
				}
				
			if (jsonData.CCWarningMessage !== undefined && jsonData.CCWarningMessage !== null && jsonData.CCWarningMessage !== "null" && jsonData.CCWarningMessage.length > 0)
				{ insertQueryData += 'CI_CC_WarningMessage__c,'; valuesData += '\'' + jsonData.CCWarningMessage + '\'' + ','; 
				updateValueData += 'CI_CC_WarningMessage__c = \''+jsonData.CCWarningMessage+'\',';
				}
			else { updateValueData += 'CI_CC_WarningMessage__c = \'\','; } 
			if (jsonData.CCCartridgeBeenLetInPlaceInsideDevic !== undefined && jsonData.CCCartridgeBeenLetInPlaceInsideDevic !== null && jsonData.CCCartridgeBeenLetInPlaceInsideDevic !== "null" && jsonData.CCCartridgeBeenLetInPlaceInsideDevic.length > 0)
				{ insertQueryData += 'CI_CC_CartridgeBeenLetInPlaceInsideDevic__c,'; valuesData += '\'' + jsonData.CCCartridgeBeenLetInPlaceInsideDevic + '\'' + ','; 
				updateValueData += 'CI_CC_CartridgeBeenLetInPlaceInsideDevic__c = \''+jsonData.CCCartridgeBeenLetInPlaceInsideDevic+'\',';
				}
				
			if (jsonData.CCUserPerfrmMorNedleAttchmntDtachmnt !== undefined && jsonData.CCUserPerfrmMorNedleAttchmntDtachmnt !== null && jsonData.CCUserPerfrmMorNedleAttchmntDtachmnt !== "null" && jsonData.CCUserPerfrmMorNedleAttchmntDtachmnt.length > 0)
			   { insertQueryData += 'CI_CC_UserPerfrmMorNedleAttchmntDtachmnt__c,'; valuesData += '\'' + jsonData.CCUserPerfrmMorNedleAttchmntDtachmnt + '\'' + ','; 
			   updateValueData += 'CI_CC_UserPerfrmMorNedleAttchmntDtachmnt__c = \''+jsonData.CCUserPerfrmMorNedleAttchmntDtachmnt+'\',';
			   }
				
			if (jsonData.CCDoesAnAmountOfMedicationRemain !== undefined && jsonData.CCDoesAnAmountOfMedicationRemain !== null && jsonData.CCDoesAnAmountOfMedicationRemain !== "null" && jsonData.CCDoesAnAmountOfMedicationRemain.length > 0)
				{ insertQueryData += 'CI_CC_DoesAnAmountOfMedicationRemain__c,'; valuesData += '\'' + jsonData.CCDoesAnAmountOfMedicationRemain + '\'' + ','; 
				updateValueData += 'CI_CC_DoesAnAmountOfMedicationRemain__c = \''+jsonData.CCDoesAnAmountOfMedicationRemain+'\',';
				}
				
			if (jsonData.CCIssueBeenObservdOnceOrSeveralTimes !== undefined && jsonData.CCIssueBeenObservdOnceOrSeveralTimes !== null && jsonData.CCIssueBeenObservdOnceOrSeveralTimes !== "null" && jsonData.CCIssueBeenObservdOnceOrSeveralTimes.length > 0)
				{ insertQueryData += 'CI_CC_IssueBeenObservdOnceOrSeveralTimes__c,'; valuesData += '\'' + jsonData.CCIssueBeenObservdOnceOrSeveralTimes + '\'' + ','; 
				updateValueData += 'CI_CC_IssueBeenObservdOnceOrSeveralTimes__c = \''+jsonData.CCIssueBeenObservdOnceOrSeveralTimes+'\',';
				}
				else { updateValueData += 'CI_CC_IssueBeenObservdOnceOrSeveralTimes__c = \'\','; } 
			//Cartridge Insertion / Removal
			
			if (jsonData.CartridgeInsertionRemoval !== undefined && jsonData.CartridgeInsertionRemoval !== null && jsonData.CartridgeInsertionRemoval !== "null" && jsonData.CartridgeInsertionRemoval.length > 0)
				{ insertQueryData += 'CI_CartridgeInsertionRemoval__c,'; valuesData += '\'' + jsonData.CartridgeInsertionRemoval + '\'' + ','; 
				updateValueData += 'CI_CartridgeInsertionRemoval__c = \''+jsonData.CartridgeInsertionRemoval+'\',';
				}
				else { updateValueData += 'CI_CartridgeInsertionRemoval__c = \'\','; } 
			if (jsonData.CICanTheCartridgeDoorBeOpened !== undefined && jsonData.CICanTheCartridgeDoorBeOpened !== null && jsonData.CICanTheCartridgeDoorBeOpened !== "null" && jsonData.CICanTheCartridgeDoorBeOpened.length > 0)
				{ insertQueryData += 'CI_CI_CanTheCartridgeDoorBeOpened__c,'; valuesData += '\'' + jsonData.CICanTheCartridgeDoorBeOpened + '\'' + ','; 
				updateValueData += 'CI_CI_CanTheCartridgeDoorBeOpened__c = \''+jsonData.CICanTheCartridgeDoorBeOpened+'\',';
				}
				
			if (jsonData.CICartridgeHoldrReleasedWhenSlidngUp !== undefined && jsonData.CICartridgeHoldrReleasedWhenSlidngUp !== null && jsonData.CICartridgeHoldrReleasedWhenSlidngUp !== "null" && jsonData.CICartridgeHoldrReleasedWhenSlidngUp.length > 0)
				{ insertQueryData += 'CI_CI_CartridgeHoldrReleasedWhenSlidngUp__c,'; valuesData += '\'' + jsonData.CICartridgeHoldrReleasedWhenSlidngUp + '\'' + ','; 
				updateValueData += 'CI_CI_CartridgeHoldrReleasedWhenSlidngUp__c = \''+jsonData.CICartridgeHoldrReleasedWhenSlidngUp+'\',';
				}
			
			if (jsonData.CIDoesDeviceStartCartridgeLoading !== undefined && jsonData.CIDoesDeviceStartCartridgeLoading !== null && jsonData.CIDoesDeviceStartCartridgeLoading !== "null" && jsonData.CIDoesDeviceStartCartridgeLoading.length > 0)
				{ insertQueryData += 'CI_CI_DoesDeviceStartCartridgeLoading__c,'; valuesData += '\'' + jsonData.CIDoesDeviceStartCartridgeLoading + '\'' + ','; 
				updateValueData += 'CI_CI_DoesDeviceStartCartridgeLoading__c = \''+jsonData.CIDoesDeviceStartCartridgeLoading+'\',';
				}
				
			if (jsonData.CIIsAWarningMessageDisplayed !== undefined && jsonData.CIIsAWarningMessageDisplayed !== null && jsonData.CIIsAWarningMessageDisplayed !== "null" && jsonData.CIIsAWarningMessageDisplayed.length > 0)
			   { insertQueryData += 'CI_CI_IsAWarningMessageDisplayed__c,'; valuesData += '\'' + jsonData.CIIsAWarningMessageDisplayed + '\'' + ','; 
			   updateValueData += 'CI_CI_IsAWarningMessageDisplayed__c = \''+jsonData.CIIsAWarningMessageDisplayed+'\',';
			   }
				
			if (jsonData.CIIsTheCartridgeDoorDamaged !== undefined && jsonData.CIIsTheCartridgeDoorDamaged !== null && jsonData.CIIsTheCartridgeDoorDamaged !== "null" && jsonData.CIIsTheCartridgeDoorDamaged.length > 0)
				{ insertQueryData += 'CI_CI_IsTheCartridgeDoorDamaged__c,'; valuesData += '\'' + jsonData.CIIsTheCartridgeDoorDamaged + '\'' + ','; 
				updateValueData += 'CI_CI_IsTheCartridgeDoorDamaged__c = \''+jsonData.CIIsTheCartridgeDoorDamaged+'\',';
				}
				
			if (jsonData.CIHasTheDeviceBeenDropped !== undefined && jsonData.CIHasTheDeviceBeenDropped !== null && jsonData.CIHasTheDeviceBeenDropped !== "null" && jsonData.CIHasTheDeviceBeenDropped.length > 0)
			   { insertQueryData += 'CI_CI_HasTheDeviceBeenDropped__c,'; valuesData += '\'' + jsonData.CIHasTheDeviceBeenDropped + '\'' + ','; 
			   updateValueData += 'CI_CI_HasTheDeviceBeenDropped__c = \''+jsonData.CIHasTheDeviceBeenDropped+'\',';
			   }
				
			if (jsonData.CIIsSomthngPreventCartridgeDoorOpeng !== undefined && jsonData.CIIsSomthngPreventCartridgeDoorOpeng !== null && jsonData.CIIsSomthngPreventCartridgeDoorOpeng !== "null" && jsonData.CIIsSomthngPreventCartridgeDoorOpeng.length > 0)
				{ insertQueryData += 'CI_CI_IsSomthngPreventCartridgeDoorOpeng__c,'; valuesData += '\'' + jsonData.CIIsSomthngPreventCartridgeDoorOpeng + '\'' + ','; 
				updateValueData += 'CI_CI_IsSomthngPreventCartridgeDoorOpeng__c = \''+jsonData.CIIsSomthngPreventCartridgeDoorOpeng+'\',';
				}
				
			if (jsonData.CIPleaseSpecify !== undefined && jsonData.CIPleaseSpecify !== null && jsonData.CIPleaseSpecify !== "null" && jsonData.CIPleaseSpecify.length > 0)
				{ insertQueryData += 'CI_CC_PleaseSpecify__c,'; valuesData += '\'' + jsonData.CIPleaseSpecify + '\'' + ','; 
				updateValueData += 'CI_CC_PleaseSpecify__c = \''+jsonData.CIPleaseSpecify+'\',';
				}
				else { updateValueData += 'CI_CC_PleaseSpecify__c = \'\','; } 
				
			if (jsonData.CRCartridgeCurrentlyStuckInsideDevic !== undefined && jsonData.CRCartridgeCurrentlyStuckInsideDevic !== null && jsonData.CRCartridgeCurrentlyStuckInsideDevic !== "null" && jsonData.CRCartridgeCurrentlyStuckInsideDevic.length > 0)
				{ insertQueryData += 'CI_CR_CartridgeCurrentlyStuckInsideDevic__c,'; valuesData += '\'' + jsonData.CRCartridgeCurrentlyStuckInsideDevic + '\'' + ','; 
				updateValueData += 'CI_CR_CartridgeCurrentlyStuckInsideDevic__c = \''+jsonData.CRCartridgeCurrentlyStuckInsideDevic+'\',';
				}
			
			if (jsonData.CRCartridgeStuckDeviceDoesNotTurnon !== undefined && jsonData.CRCartridgeStuckDeviceDoesNotTurnon !== null && jsonData.CRCartridgeStuckDeviceDoesNotTurnon !== "null" && jsonData.CRCartridgeStuckDeviceDoesNotTurnon.length > 0)
				{ insertQueryData += 'CI_CR_CartridgeStuckDeviceDoesNotTurnon__c,'; valuesData += '\'' + jsonData.CRCartridgeStuckDeviceDoesNotTurnon + '\'' + ','; 
				updateValueData += 'CI_CR_CartridgeStuckDeviceDoesNotTurnon__c = \''+jsonData.CRCartridgeStuckDeviceDoesNotTurnon+'\',';
				}
				
			if (jsonData.CRCartridgeStuckAndDevicBlockedByMsg !== undefined && jsonData.CRCartridgeStuckAndDevicBlockedByMsg !== null && jsonData.CRCartridgeStuckAndDevicBlockedByMsg !== "null" && jsonData.CRCartridgeStuckAndDevicBlockedByMsg.length > 0)
			   { insertQueryData += 'CI_CR_CartridgeStuckAndDevicBlockedByMsg__c,'; valuesData += '\'' + jsonData.CRCartridgeStuckAndDevicBlockedByMsg + '\'' + ','; 
			   updateValueData += 'CI_CR_CartridgeStuckAndDevicBlockedByMsg__c = \''+jsonData.CRCartridgeStuckAndDevicBlockedByMsg+'\',';
			   }
				
			if (jsonData.CRWarningMessage !== undefined && jsonData.CRWarningMessage !== null && jsonData.CRWarningMessage !== "null" && jsonData.CRWarningMessage.length > 0)
				{ insertQueryData += 'CI_CR_WarningMessage__c,'; valuesData += '\'' + jsonData.CRWarningMessage + '\'' + ','; 
				updateValueData += 'CI_CR_WarningMessage__c = \''+jsonData.CRWarningMessage+'\',';
				}
				else { updateValueData += 'CI_CR_WarningMessage__c = \'\','; } 
			if (jsonData.CRStartRemoveCartridgeMenuOption !== undefined && jsonData.CRStartRemoveCartridgeMenuOption !== null && jsonData.CRStartRemoveCartridgeMenuOption !== "null" && jsonData.CRStartRemoveCartridgeMenuOption.length > 0)
				{ insertQueryData += 'CI_CR_StartRemoveCartridgeMenuOption__c,'; valuesData += '\'' + jsonData.CRStartRemoveCartridgeMenuOption + '\'' + ','; 
				updateValueData += 'CI_CR_StartRemoveCartridgeMenuOption__c = \''+jsonData.CRStartRemoveCartridgeMenuOption+'\',';
				}
				
			if (jsonData.CRDevicePromptToOpenTheCartridgeDoor !== undefined && jsonData.CRDevicePromptToOpenTheCartridgeDoor !== null && jsonData.CRDevicePromptToOpenTheCartridgeDoor !== "null" && jsonData.CRDevicePromptToOpenTheCartridgeDoor.length > 0)
				{ insertQueryData += 'CI_CR_DevicePromptToOpenTheCartridgeDoor__c,'; valuesData += '\'' + jsonData.CRDevicePromptToOpenTheCartridgeDoor + '\'' + ','; 
				updateValueData += 'CI_CR_DevicePromptToOpenTheCartridgeDoor__c = \''+jsonData.CRDevicePromptToOpenTheCartridgeDoor+'\',';
				}
				
			if (jsonData.CRCanCartridgeDoorOfDeviceBeOpened !== undefined && jsonData.CRCanCartridgeDoorOfDeviceBeOpened !== null && jsonData.CRCanCartridgeDoorOfDeviceBeOpened !== "null" && jsonData.CRCanCartridgeDoorOfDeviceBeOpened.length > 0)
				{ insertQueryData += 'CI_CR_CanCartridgeDoorOfDeviceBeOpened__c,'; valuesData += '\'' + jsonData.CRCanCartridgeDoorOfDeviceBeOpened + '\'' + ','; 
				updateValueData += 'CI_CR_CanCartridgeDoorOfDeviceBeOpened__c = \''+jsonData.CRCanCartridgeDoorOfDeviceBeOpened+'\',';
				}  
				
			if (jsonData.CRCartridgeHolderReleasedOnSliding !== undefined && jsonData.CRCartridgeHolderReleasedOnSliding !== null && jsonData.CRCartridgeHolderReleasedOnSliding !== "null" && jsonData.CRCartridgeHolderReleasedOnSliding.length > 0)
			   { insertQueryData += 'CI_CR_CartridgeHolderReleasedOnSliding__c,'; valuesData += '\'' + jsonData.CRCartridgeHolderReleasedOnSliding + '\'' + ','; 
			   updateValueData += 'CI_CR_CartridgeHolderReleasedOnSliding__c = \''+jsonData.CRCartridgeHolderReleasedOnSliding+'\',';
			   }
				
			if (jsonData.CRWarningMessageOrPowerOff !== undefined && jsonData.CRWarningMessageOrPowerOff !== null && jsonData.CRWarningMessageOrPowerOff !== "null" && jsonData.CRWarningMessageOrPowerOff.length > 0)
				{ insertQueryData += 'CI_CR_WarningMessageOrPowerOff__c,'; valuesData += '\'' + jsonData.CRWarningMessageOrPowerOff + '\'' + ','; 
				updateValueData += 'CI_CR_WarningMessageOrPowerOff__c = \''+jsonData.CRWarningMessageOrPowerOff+'\',';
				}
				else { updateValueData += 'CI_CR_WarningMessageOrPowerOff__c = \'\','; } 
			if (jsonData.CRComplaintAboutCatridgeCanotRemoved !== undefined && jsonData.CRComplaintAboutCatridgeCanotRemoved !== null && jsonData.CRComplaintAboutCatridgeCanotRemoved !== "null" && jsonData.CRComplaintAboutCatridgeCanotRemoved.length > 0)
				{ insertQueryData += 'CI_CR_ComplaintAboutCatridgeCanotRemoved__c,'; valuesData += '\'' + jsonData.CRComplaintAboutCatridgeCanotRemoved + '\'' + ','; 
				updateValueData += 'CI_CR_ComplaintAboutCatridgeCanotRemoved__c = \''+jsonData.CRComplaintAboutCatridgeCanotRemoved+'\',';
				}
			if (jsonData.DoesPatientComplainThatSometimeRemovedIfYes !== undefined && jsonData.DoesPatientComplainThatSometimeRemovedIfYes !== null && jsonData.DoesPatientComplainThatSometimeRemovedIfYes !== "null" && jsonData.DoesPatientComplainThatSometimeRemovedIfYes.length > 0)
				{ insertQueryData += 'CI_CR_Complaintaboutcatridgeremoveifyes__c,'; valuesData += '\'' + jsonData.DoesPatientComplainThatSometimeRemovedIfYes + '\'' + ','; 
				updateValueData += 'CI_CR_Complaintaboutcatridgeremoveifyes__c = \''+jsonData.DoesPatientComplainThatSometimeRemovedIfYes+'\',';
				}	
		          else { updateValueData += 'CI_CR_Complaintaboutcatridgeremoveifyes__c = \'\','; }
			if (jsonData.CRProvideFrequencyDateOfLastOccuranc !== undefined && jsonData.CRProvideFrequencyDateOfLastOccuranc !== null && jsonData.CRProvideFrequencyDateOfLastOccuranc !== "null" && jsonData.CRProvideFrequencyDateOfLastOccuranc.length > 0)
				{ insertQueryData += 'CI_CR_ProvideFreqDateOfLastOccuranc1__c,'; valuesData += '\'' + jsonData.CRProvideFrequencyDateOfLastOccuranc + '\'' + ','; 
				updateValueData += 'CI_CR_ProvideFreqDateOfLastOccuranc1__c = \''+jsonData.CRProvideFrequencyDateOfLastOccuranc+'\',';
				}
				
			if (jsonData.CRCartridgeRemovalIssueLinkedToPF !== undefined && jsonData.CRCartridgeRemovalIssueLinkedToPF !== null && jsonData.CRCartridgeRemovalIssueLinkedToPF !== "null" && jsonData.CRCartridgeRemovalIssueLinkedToPF.length > 0)
				{ insertQueryData += 'CI_CR_CartridgeRemovalIssueLinkedToPF__c,'; valuesData += '\'' + jsonData.CRCartridgeRemovalIssueLinkedToPF + '\'' + ','; 
				updateValueData += 'CI_CR_CartridgeRemovalIssueLinkedToPF__c = \''+jsonData.CRCartridgeRemovalIssueLinkedToPF+'\',';
				}
				
			if (jsonData.CRIsThisLinkedToWarningMessage !== undefined && jsonData.CRIsThisLinkedToWarningMessage !== null && jsonData.CRIsThisLinkedToWarningMessage !== "null" && jsonData.CRIsThisLinkedToWarningMessage.length > 0)
				{ insertQueryData += 'CI_CR_IsThisLinkedToWarningMessage__c,'; valuesData += '\'' + jsonData.CRIsThisLinkedToWarningMessage + '\'' + ','; 
				updateValueData += 'CI_CR_IsThisLinkedToWarningMessage__c = \''+jsonData.CRIsThisLinkedToWarningMessage+'\',';
				}
						
            if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0){ 
			     insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\'';
			     updateValueData += 'HerokuCaseId__c = \''+jsonData.caseid+ '\'';
			    }

             
            var combinedQuery;
            
            if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0)           
               combinedQuery = 'UPDATE salesforce.IVOP_DecisionTree__c SET '+updateValueData+' WHERE id='+jsonData.DecisionTreeId+'';
            else
               combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
            
            console.log('............combinedQuery.............'+combinedQuery); 
            conn.query(combinedQuery,
                function(err, result) {
                            done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                   }
                                            else{
                                                   if(jsonData.DecisionTreeId !== undefined && jsonData.DecisionTreeId !== null && jsonData.DecisionTreeId !== "null" && jsonData.DecisionTreeId.length > 0){
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:jsonData.DecisionTreeId,
                                                        message: 'Success.'});
						    }
						    else{
						       return res.json({
                                                        msgid: 1,
							DecisionTreeId:result.rows[0].id,
                                                        message: 'Success.'});
						    }
                                   }
                });
            }
        });
    });
});






router.get('/getContacts', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT id, email, phone, firstname, lastname from salesforce.Contact',
            function(err,result){
                done();
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
                }
            });
    });
});

router.get('/getCaseAttachments', function(req, res) {
    var case_id = req.param('id');
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT id, name, body, herokucaseid  from caseattachment where herokucaseid= '+case_id+'',
            function(err,result){
                done();
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
                }
            });
    });
});

router.post('/CreateHelp', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    
    var formattedData='INSERT INTO Helpcontent (eng_question, eng_answer, ita_question, ita_answer) VALUES (\''+jsonData.eng_question+'\', \''+jsonData.eng_answer+'\', \''+jsonData.ita_question+'\', \''+jsonData.ita_answer+'\')  RETURNING id';
    console.log('formatted Helptable Query:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
                    conn.query('INSERT INTO Helpcontent (eng_question, eng_answer, ita_question, ita_answer) VALUES (\''+jsonData.eng_question+'\', \''+jsonData.eng_answer+'\', \''+jsonData.ita_question+'\', \''+jsonData.ita_answer+'\')  RETURNING id',
                         function(err, result) {
			    done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                }
                                            else{
                                                return res.json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                            }
                                    });
             });
     });

router.post('/updateHelpInfo', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    var help_id = jsonData.id;
    
    var formattedData='UPDATE Helpcontent SET eng_question = \''+jsonData.eng_question+'\', eng_answer = \''+jsonData.eng_answer+'\', ita_question = \''+jsonData.ita_question+'\', ita_answer = \''+jsonData.ita_answer+'\' where id='+help_id+'';
    console.log('formatted Helptable Query:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
                    conn.query('UPDATE Helpcontent SET eng_question = \''+jsonData.eng_question+'\', eng_answer = \''+jsonData.eng_answer+'\', ita_question = \''+jsonData.ita_question+'\', ita_answer = \''+jsonData.ita_answer+'\'  where id='+help_id+'',
                         function(err, result) {
			    done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                }
                                            else{
                                                return res.json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                            }
                                    });
             });
     });

router.post('/CreateDisclaimer', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    
    var formattedData='INSERT INTO disclaimercontent (country, language, content) VALUES (\''+jsonData.country+'\', \''+jsonData.language+'\', \''+jsonData.content+'\')  RETURNING id';
    console.log('formatted table Query:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
                    conn.query('INSERT INTO disclaimercontent (country, language, content) VALUES (\''+jsonData.country+'\', \''+jsonData.language+'\', \''+jsonData.content+'\')  RETURNING id',
                         function(err, result) {
			    done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                }
                                            else{
                                                return res.json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                            }
                                    });
             });
     });

router.post('/updateDisclaimerInfo', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    var disclaimer_id = jsonData.id;
    
    var formattedData='UPDATE disclaimercontent SET country = \''+jsonData.country+'\', language = \''+jsonData.language+'\', content = \''+jsonData.content+'\' where id='+disclaimer_id+'';
    console.log('formatted table Query:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
                    conn.query('UPDATE disclaimercontent SET country = \''+jsonData.country+'\', language = \''+jsonData.language+'\', content = \''+jsonData.content+'\'  where id='+disclaimer_id+'',
                         function(err, result) {
			    done();
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                }
                                            else{
                                                return res.json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                            }
                                    });
             });
     });

router.post('/uploadfile', function(req, res) {
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    
    
    var splitteddata=data.replace("{","").replace("}","").split(',');
    
    var caseid = splitteddata[0];
    var loopid = splitteddata[1];
    var filename = splitteddata[2];
    var contenttype = splitteddata[3];
    var imagedata = splitteddata[4];
    console.log('.....loopid.....'+loopid+'.....filename........'+filename+'........contenttype...........'+contenttype);
    
    var formattedData='INSERT INTO caseattachment (name, contenttype, herokucaseid) VALUES ('+filename +',  \''+contenttype+'\', '+caseid+') RETURNING id';
    console.log('formattedQuery:'+formattedData);
    
         pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
             if (err) console.log(err);
             conn.query('SELECT *from salesforce.Case WHERE id='+caseid+'',
                function(err,result){
                 if (err != null || result.rowCount == 0) {
                      return res.json({
                                msgid: 2,
                                message: 'case id not found.'});
                 }else{
                      conn.query('INSERT INTO caseattachment (name, contenttype, body, herokucaseid) VALUES ('+filename+', \''+contenttype+'\', '+imagedata+', '+caseid+') RETURNING id',
                         function(err, result) {
                         if(err){
                                return res.json({
                                        attachementid: -1,
                                        msgid: 2,
                                        message: err.message});
                            }
                            else{
                                var attachmentrowid = result.rows[0].id;
                                var columname = 'fma_attachment' + loopid + '__c';
			        var herokucaseid = 'fma_herokucaseid__c';
                                console.log('columname:' + columname);
                                var attachmentUrl = baseUrl + 'api/showImage?imageid=' +attachmentrowid;
                                console.log('attachmentUrl:'+attachmentUrl);
                                
                                conn.query('UPDATE salesforce.Case SET '+columname+' = \''+attachmentUrl+'\', '+herokucaseid+' = \''+caseid+'\' WHERE id='+caseid+'',
                                    function(err,result){
                                        done();
                                        if(err){
                                            return res.json({
                                                    attachementid: -1,
                                                    msgid: 2,
                                                    message: err.message});
                                        }
                                        else{
                                           return res.json({
                                                    attachementid: attachmentrowid,
                                                    msgid: 1,
                                                    message: 'Success.'});
                                        }
                                    });
                                }
                            });
                     }
             });
     });
});

router.get('/getContact', function(req, res) {
    var contact_id = req.param('id');
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT id, email, phone, firstname, lastname, mobilephone from salesforce.Contact where id='+contact_id+'',
             function(err,result){
                done();
                if(err){
                    res.status(400).json({error: err.message});
                }
                else{
                    res.json(result.rows);
                }
            });
     });
});

// Insert Case Service Start

router.post('/insertCase', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        console.log('............insertCase...............');
        console.log(req.body);
        var jsonData = req.body;
        var timestamp = '';
        var insertQueryData = 'INSERT INTO salesforce.Case (';
        var valuesData=' VALUES (';
        
        //-------------------------------------------Framing Query-------------------------------------------
        
        if (jsonData.DeviceName !== undefined && jsonData.DeviceName !== null && jsonData.DeviceName !== "null" && jsonData.DeviceName.length > 0)
        { insertQueryData += 'FMA_DeviceName__c,'; valuesData += '\'' + jsonData.DeviceName + '\'' + ','; }
        else { return res.json({caseid: -1,msgid: 2,message: 'Please select device name.'});}
		
	if (jsonData.userid !== undefined && jsonData.userid !== null && jsonData.userid !== "null" && jsonData.userid.toString().length > 0)
        { insertQueryData += 'ContactId,'; valuesData += '\'' + jsonData.userid + '\'' + ','; }
        else { return res.json({caseid: -1,msgid: 2,message: 'Userid should not be empty.'});}
        
        if (jsonData.ProductId !== undefined && jsonData.ProductId !== null && jsonData.ProductId !== "null" && jsonData.ProductId.toString().length > 0)
        { insertQueryData += 'FMA_Product__c,'; valuesData += '\'' + jsonData.ProductId + '\'' + ','; }
        else { return res.json({caseid: -1,msgid: 2,message: 'ProductId should not be empty.'});}
		
	if (jsonData.Gender !== undefined && jsonData.Gender !== null && jsonData.Gender !== "null" && jsonData.Gender.length > 0)
        { insertQueryData += 'FMA_Gender__c,'; valuesData += '\'' + jsonData.Gender + '\'' + ','; }
        //else { return res.json({caseid: -1,msgid: 2,message: 'Please select gender.'});}
	
	if (jsonData.FormulationDosage !== undefined && jsonData.FormulationDosage !== null && jsonData.FormulationDosage !== "null" && jsonData.FormulationDosage.length > 1)
        { insertQueryData += 'FMA_Dosage__c,'; valuesData += '\'' + jsonData.FormulationDosage + '\'' + ','; }
	
	if (jsonData.TrainingDate !== undefined && jsonData.TrainingDate !== null && jsonData.TrainingDate !== "null" && jsonData.TrainingDate.length > 1)
        { insertQueryData += 'FMA_Whenthepatientgottrained__c,'; valuesData += '\'' + jsonData.TrainingDate + '\'' + ','; }
	    
        if (jsonData.ComplainantCategory !== undefined && jsonData.ComplainantCategory !== null && jsonData.ComplainantCategory !== "null" && jsonData.ComplainantCategory.length > 1)
        { insertQueryData += 'FMA_ComplainantCategory__c,'; valuesData += '\'' + jsonData.ComplainantCategory + '\'' + ','; }
	    
	   if (jsonData.AffiliateIfStillNeeded !== undefined && jsonData.AffiliateIfStillNeeded !== null && jsonData.AffiliateIfStillNeeded !== "null" && jsonData.AffiliateIfStillNeeded.length > 1)
        { insertQueryData += 'FMA_AffiliateIfStillNeeded__c,'; valuesData += '\'' + jsonData.AffiliateIfStillNeeded + '\'' + ','; }

        if (jsonData.BatchSerialNbr !== undefined && jsonData.BatchSerialNbr !== null && jsonData.BatchSerialNbr !== "null" && jsonData.BatchSerialNbr.length > 1)
        { insertQueryData += 'FMA_BatchSerialnumber__c,'; valuesData += '\'' + jsonData.BatchSerialNbr + '\'' + ','; }

        if (jsonData.DateOfFirstUse !== undefined && jsonData.DateOfFirstUse !== null && jsonData.DateOfFirstUse !== "null" && jsonData.DateOfFirstUse.length > 7)
        { insertQueryData += 'FMA_Dateoffirstuse__c,'; valuesData += '\'' + jsonData.DateOfFirstUse + '\'' + ','; }

        if (jsonData.ExpiryDate !== undefined && jsonData.ExpiryDate !== null && jsonData.ExpiryDate !== "null" && jsonData.ExpiryDate.length > 7)
        { insertQueryData += 'FMA_Expirydate__c,'; valuesData += '\'' + jsonData.ExpiryDate + '\'' + ','; }

        if (jsonData.InitialPatientName !== undefined && jsonData.InitialPatientName !== null && jsonData.InitialPatientName !== "null" && jsonData.InitialPatientName.length > 1)
        { insertQueryData += 'FMA_Initialpatientname__c,'; valuesData += '\'' + jsonData.InitialPatientName + '\'' + ','; }

        if (jsonData.InitialPatientSurName !== undefined && jsonData.InitialPatientSurName !== null && jsonData.InitialPatientSurName !== "null" && jsonData.InitialPatientSurName.length > 0)
        { insertQueryData += 'FMA_Initialpatientsurname__c,'; valuesData += '\'' + jsonData.InitialPatientSurName + '\'' + ','; }

        if (jsonData.Age !== undefined && jsonData.Age !== null && jsonData.Age !== "null" && jsonData.Age.length > 0)
        { insertQueryData += 'FMA_Age__c,'; valuesData += jsonData.Age + ','; }
		
      	if (jsonData.Phoneno !== undefined && jsonData.Phoneno !== null && jsonData.Phoneno !== "null" && jsonData.Phoneno.length > 0)
        { insertQueryData += 'FMA_Phoneno__c,'; valuesData += '\'' + jsonData.Phoneno + '\'' + ','; }
      		
      	if (jsonData.Email !== undefined && jsonData.Email !== null && jsonData.Email !== "null" && jsonData.Email.length > 0)
        { insertQueryData += 'FMA_Email__c,'; valuesData += '\'' + jsonData.Email + '\'' + ','; }
      		
      	if (jsonData.Hasthepatientbeentrained !== undefined && jsonData.Hasthepatientbeentrained !== null && jsonData.Hasthepatientbeentrained !== "null" && jsonData.Hasthepatientbeentrained.length > 0)
        { insertQueryData += 'FMA_Hasthepatientbeentrained__c,'; valuesData += jsonData.Hasthepatientbeentrained + ','; }
      		
      	if (jsonData.Whomadethetraining !== undefined && jsonData.Whomadethetraining !== null && jsonData.Whomadethetraining !== "null" && jsonData.Whomadethetraining.length > 0)
        { insertQueryData += 'FMA_Whomadethetraining__c,'; valuesData += '\'' + jsonData.Whomadethetraining + '\'' + ','; }
	    
	if (jsonData.WhomadetheTrainingOther !== undefined && jsonData.WhomadetheTrainingOther !== null && jsonData.WhomadetheTrainingOther !== "null" && jsonData.WhomadetheTrainingOther.length > 0)
        { insertQueryData += 'Who_made_the_training_Other__c,'; valuesData += '\'' + jsonData.WhomadetheTrainingOther + '\'' + ','; }

        if (jsonData.NameOfCompliant !== undefined && jsonData.NameOfCompliant !== null && jsonData.NameOfCompliant !== "null" && jsonData.NameOfCompliant.length > 1)
        { insertQueryData += 'FMA_NameofComplainant__c,'; valuesData += '\'' + jsonData.NameOfCompliant + '\'' + ','; }

        if (jsonData.DefectDescription !== undefined && jsonData.DefectDescription !== null && jsonData.DefectDescription !== "null" && jsonData.DefectDescription.length > 1)
        { insertQueryData += 'FMA_Defectdescription__c,'; valuesData += '\'' + jsonData.DefectDescription + '\'' + ','; }

        if (jsonData.IsComplaintSampleAvailable !== undefined && jsonData.IsComplaintSampleAvailable !== null && jsonData.IsComplaintSampleAvailable !== "null" && jsonData.IsComplaintSampleAvailable.length > 0)
        { insertQueryData += 'FMA_Isthecomplaintsampleavailable__c,'; valuesData += jsonData.IsComplaintSampleAvailable + ','; }

        if (jsonData.HasResponseBeenRequested !== undefined && jsonData.HasResponseBeenRequested !== null && jsonData.HasResponseBeenRequested !== "null" && jsonData.HasResponseBeenRequested.length > 0)
        { insertQueryData += 'FMA_Hasresponsebeenrequested__c,'; valuesData += jsonData.HasResponseBeenRequested + ','; }

        if (jsonData.IsPatientFamiliarWithDeviceUsage !== undefined && jsonData.IsPatientFamiliarWithDeviceUsage !== null && jsonData.IsPatientFamiliarWithDeviceUsage !== "null" && jsonData.IsPatientFamiliarWithDeviceUsage.length > 0)
        { insertQueryData += 'FMA_Ispatientfamiliarwithdeviceusage__c,'; valuesData += jsonData.IsPatientFamiliarWithDeviceUsage + ','; }

        if (jsonData.SinceWhenPatientUseThisDevice !== undefined && jsonData.SinceWhenPatientUseThisDevice !== null && jsonData.SinceWhenPatientUseThisDevice !== "null" && jsonData.SinceWhenPatientUseThisDevice.length > 1)
        { insertQueryData += 'FMA_Sincewhendoespatientusethiskind__c,'; valuesData += '\'' + jsonData.SinceWhenPatientUseThisDevice + '\'' + ','; }

        if (jsonData.IsDevicePhysicallyDamaged !== undefined && jsonData.IsDevicePhysicallyDamaged !== null && jsonData.IsDevicePhysicallyDamaged !== "null" && jsonData.IsDevicePhysicallyDamaged.length > 0)
        { insertQueryData += 'FMA_Isthedevicephysicallydamaged__c,'; valuesData += jsonData.IsDevicePhysicallyDamaged + ','; }

        if (jsonData.DamageDuetoAccidentalFall !== undefined && jsonData.DamageDuetoAccidentalFall !== null && jsonData.DamageDuetoAccidentalFall !== "null" && jsonData.DamageDuetoAccidentalFall.length > 0)
        { insertQueryData += 'FMA_Thedamageisduetoanaccidentalfall__c,'; valuesData += jsonData.DamageDuetoAccidentalFall + ','; }

        if (jsonData.IsDefectedDuetomisusebypatient !== undefined && jsonData.IsDefectedDuetomisusebypatient !== null && jsonData.IsDefectedDuetomisusebypatient !== "null" && jsonData.IsDefectedDuetomisusebypatient.length > 0)
        { insertQueryData += 'FMA_Isthedefectduetoamisusebypatient__c,'; valuesData += jsonData.IsDefectedDuetomisusebypatient + ','; }

        if (jsonData.WhatStuckinside !== undefined && jsonData.WhatStuckinside !== null && jsonData.WhatStuckinside !== "null" && jsonData.WhatStuckinside.length > 0)
        { insertQueryData += 'FMA_whatstuckinside__c,'; valuesData += '\'' + jsonData.WhatStuckinside + '\'' + ','; }

        if (jsonData.Adverseeventassociatedtodefect !== undefined && jsonData.Adverseeventassociatedtodefect !== null && jsonData.Adverseeventassociatedtodefect !== "null" && jsonData.Adverseeventassociatedtodefect.length > 0)
        { insertQueryData += 'FMA_Adverseeventassociatedtodefect__c,'; valuesData += jsonData.Adverseeventassociatedtodefect + ','; }

        if (jsonData.AdverseEventAssociatedWitchOne !== undefined && jsonData.AdverseEventAssociatedWitchOne !== null && jsonData.AdverseEventAssociatedWitchOne !== "null" && jsonData.AdverseEventAssociatedWitchOne.length > 0)
        { insertQueryData += 'FMA_Adverseeventassociatedwhichone__c,'; valuesData += '\'' + jsonData.AdverseEventAssociatedWitchOne + '\'' + ','; }
	    
	if (jsonData.ProductName !== undefined && jsonData.ProductName !== null && jsonData.ProductName !== "null" && jsonData.ProductName.length > 0)
        { insertQueryData += 'FMA_ProductName__c,'; valuesData += '\'' + jsonData.ProductName + '\'' + ','; }    
		
      	if (jsonData.Subject !== undefined && jsonData.Subject !== null && jsonData.Subject !== "null" && jsonData.Subject.length > 0)
        { insertQueryData += 'Subject,'; valuesData += '\'' + jsonData.Subject + '\'' + ','; }
      		
      	if (jsonData.Description !== undefined && jsonData.Description !== null && jsonData.Description !== "null" && jsonData.Description.length > 1)
        { insertQueryData += 'Description,'; valuesData += '\'' + jsonData.Description + '\'' + ','; }
	
	if (jsonData.recordStatus !== undefined && jsonData.recordStatus !== null && jsonData.recordStatus !== "null" && jsonData.recordStatus.length > 1)
        { insertQueryData += 'FMA_Recordstatus__c,'; valuesData += '\'' + jsonData.recordStatus + '\'' + ','; }
	    
	if (jsonData.patientId !== undefined && jsonData.patientId !== null && jsonData.patientId !== "null" && jsonData.patientId.length > 0)
	{ insertQueryData += 'FMA_PatientId__c,'; valuesData += '\'' + jsonData.patientId + '\'' + ',';}
	    
	        insertQueryData += 'Priority,'; valuesData += '\'' + 'Medium' + '\'' + ',';
		
	        insertQueryData += 'Status'; valuesData += '\'' + 'New' + '\'';	
	 console.log('............insertCase...1............');		
	        
        //-------------------------------------------End Framing Query-------------------------------------------
        
        //timestamp
        if (jsonData.timestamp !== undefined && jsonData.timestamp !== null && jsonData.timestamp !== "null" && jsonData.timestamp.length > 0)
        { timestamp = jsonData.timestamp; }
        
        var combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
        console.log('............insertCase...2......combinedQuery......'+combinedQuery);
        conn.query(combinedQuery,
                function(err, result) {
                    done();
                    if(err){
                        console.log(err.message);
                            return res.json({
                                    caseid: -1,
				    sfid: 1,
                                    msgid: 2,
                                    timestamp: timestamp,
                                    message: err.message});
                        }
                        else{
                            console.log('......Insert..Case..Result.'+result);						
                            // Updating HrkCase id Start
                               conn.query('UPDATE salesforce.Case SET fma_herokucaseid__c = \''+result.rows[0].id+'\' WHERE id='+result.rows[0].id+'',
                                   function(err,UpdateResult){
				       console.log('......Updated..Hrk CaseId...Result...'+UpdateResult);
                                       done();
                                       if(err){
                                           return res.json({  
                                                   msgid: 2,
                                                   message: err.message});
                                       }
                                       else{
                                          return res.json({
						caseid:result.rows[0].id,
						sfid: result.rows[0].sfid,
						msgid: 1,
						timestamp: timestamp,
						message: 'Success.'});
                                       }
                                   });			
			   // Updating HrkCase id End
                        } 
            });
    });
});

router.get('/getProductsCount', function(req, res) {
	var type;
	if(req.param('producttype') === 'Medical') type = 'Medical Device';
	if(req.param('producttype') === 'Combination') type = 'Combination Product';
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT count(sfid) AS productsCount FROM salesforce.FMA_Product__c WHERE Type__c=\''+type+'\'',
            function(err,result){
                done();
                if(err){
                   return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
                }
            });
    });
});

router.get('/getMyFeedbacks', function(req, res) {
    var contact_id = req.param('id');
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT sfid, casenumber, fma_devicename__c, description, createddate, status from salesforce.case where contactid =\''+contact_id+'\' and FMA_Recordstatus__c =\'Submitted\' order by createddate desc Limit 10',
             function(err,result){
                done();
                if(err){
                    res.status(400).json({error: err.message});
                }
                else{
                    res.json(result.rows);
                }
            });
     });
});

router.post('/CreateUser', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    
    var formattedData='INSERT INTO Salesforce.Contact (firstname, lastname, email, phone, IVOPPassword__c, IVOPMobileappuser__c) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email+'\', \''+jsonData.phone+'\', \''+jsonData.password+'\', \''+'True'+'\')  RETURNING id';
    console.log('formatted Salesforce.Contact Query:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
        
        conn.query(
             'SELECT count(*) from UserManagement where trim(email)=\''+jsonData.email+'\'',
             function(err, result){
                done();
                if(result.rows[0].count > 0){
                    res.status(400).json({error: 'Email already exist.'});
                }
                 else{
                    conn.query('INSERT INTO Salesforce.Contact (firstname, lastname, email, phone, IVOPPassword__c, IVOPMobileappuser__c, MailingCountry) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email.toLowerCase().trim()+'\', \''+jsonData.phone+'\', \''+jsonData.password+'\', \''+'True'+'\', \''+jsonData.country+'\')  RETURNING id',
                         function(err, result) {
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                }
                                else{
                                    var contactid = result.rows[0].id;
                                    console.log('contactid: '+contactid);

                                    var formattedData='INSERT INTO UserManagement (firstname, lastname, email, phone, password, language, country, contactid) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email.toLowerCase().trim()+'\', \''+jsonData.phone+'\', \''+jsonData.password+'\', \''+jsonData.language+'\', \''+jsonData.country+'\', \''+contactid+'\')';
                                    console.log('formatted UserManagement Query:'+formattedData);

                                    conn.query('INSERT INTO UserManagement (firstname, lastname, email, phone, password, language, country, contactid, active) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email.toLowerCase().trim()+'\', \''+jsonData.phone+'\', \''+jsonData.password+'\', \''+jsonData.language+'\', \''+jsonData.country+'\', \''+contactid+'\',true)',
                                     function(err, result) {
                                        done();
                                         if(err){
                                                return res.json({
                                                        msgid: 2,
                                                        message: err.message});
                                            }
                                            else{
                                                var subject = 'Welcome To Feedback Application';
                                                var text = 'Greetings!!!\n\n Welcome '+jsonData.firstname+',\n\nPlease use below credentials to login portal.\n\E-Mail: '+jsonData.email+'\nPassword: '+jsonData.password+'\n\nThanks';
                                                var resultStr = sendEmail(jsonData.email, subject, text);
                                                return res.json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                            }
                                    });
                                }
                    });
                 }
             });
     });
});

router.get('/getUsers', function(req, res) {
 pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
     if (err) console.log(err);
        conn.query(
            'SELECT um.id, um.firstname, um.lastname, um.email, um.phone, um.contactid, um.active, sc.sfid from UserManagement um, Salesforce.Contact sc where um.contactid=sc.id',
            function(err,result){
                done();
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
                }
            });
 });
});

router.put('/updateStatus', function(req, res){
    var user_id = req.param('id');
    pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT *from UserManagement where id='+user_id+'',
             function(err,result){
                done();
                if(err){
                    res.status(400).json({error: err.message});
                }
                else{
                    var activeStatus = true;
                    if(result.rows[0].active == null || result.rows[0].active == false)
                        activeStatus = true;
                    else
                        activeStatus = false;
                    
                    var queryStr = 'Update UserManagement set active='+activeStatus+' where id='+user_id+'';
                    console.log(queryStr);
                    
                    conn.query(queryStr, 
                        function(err,result){
                        done();
                        if(err){
                            return res.status(400).json({error: err.message});
                        }
                        else{
                            return res.json(true);
                        }
                    });
                }
            });
     });
});

router.post('/updateUserInfo', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        console.log(req.body);
        var jsonData = req.body;
        var user_id = jsonData.id;
	if(jsonData.src == 'mobile'){
	   var userManagementQueryStr = 'Update UserManagement set language=\''+jsonData.language+'\', country=\''+jsonData.country+'\' where id='+user_id+'';
           console.log('.........Undefined User Info.............'+userManagementQueryStr);
	   conn.query(userManagementQueryStr, 
                      function(err,result){
                               done();
                               if(err){
                                  return res.status(400).json({error: err.message});
                               } else{
                                  return res.status(200).json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                               }
                    });
	}
        else if(jsonData.src == 'ios'){
	   var userManagementQueryStr = 'Update UserManagement set language=\''+jsonData.language+'\', country=\''+jsonData.country+'\' where id='+user_id+'';
           console.log('.........Undefined User Info.............'+userManagementQueryStr);
	   conn.query(userManagementQueryStr, 
                      function(err,result){
                               done();
                               if(err){
                                  return res.status(400).json({error: err.message});
                               } else{
                                  return res.status(200).json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                               }
                    });           
	}else{
           var userManagementQueryStr = 'Update UserManagement set firstname=\''+jsonData.firstname+'\', lastname=\''+jsonData.lastname+'\', email=\''+jsonData.email+'\', phone=\''+jsonData.phone+'\', language=\''+jsonData.language+'\', country=\''+jsonData.country+'\' where id='+user_id+'';
           console.log('.........Non.Undefined User Info.............'+userManagementQueryStr);
	
        conn.query('SELECT *from UserManagement where id='+user_id+'',
            function(err,result){
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    var contactId = result.rows[0].contactid;
                    console.log('contactId:'+contactId);
                    
                    var contactQueryStr = 'Update Salesforce.Contact set firstname=\''+jsonData.firstname+'\', lastname=\''+jsonData.lastname+'\', email=\''+jsonData.email.toLowerCase().trim()+'\', phone=\''+jsonData.phone+'\' where id='+contactId+'';
                    console.log(contactQueryStr);
                    
                    conn.query(userManagementQueryStr, 
                        function(err,result){
                            if(err){
                                return res.status(400).json({error: err.message});
                            }
                            else{
                                conn.query(contactQueryStr, 
                                    function(err,result){
                                        done();
                                        if(err){
                                            return res.status(400).json({error: err.message});
                                        }
                                        else{
                                            return res.status(200).json({
                                                        msgid: 1,
                                                        message: 'Success.'});
                                        }
                                });
                            }
                    });
                }
            });
        }
    });
});


/*router.put('/changePassword', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        var user_id = req.param('id');
        var oldPassword = req.param('oldPassword');
        var newPassword = req.param('newPassword');
        console.log(user_id);
        console.log(oldPassword);
        console.log(newPassword);
        
        var userManagementQueryStr = 'Update UserManagement set password=\''+newPassword+'\' where id='+user_id+' and password=\''+oldPassword+'\'';
        console.log(userManagementQueryStr);
        
        conn.query('SELECT *from UserManagement where id='+user_id+'',
            function(err,result){
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    var contactId = result.rows[0].contactid;
                    console.log('contactId:'+contactId);
                    
                    conn.query(userManagementQueryStr, 
                        function(err,result){
                            if(err){
                                return res.status(400).json({error: err.message});
                            }
                            else{
                                return res.status(200).json({
                                            msgid: 1,
                                            message: 'Success.'});
                            }
                    });
                }
            });
    });
    
});*/

router.put('/changePassword', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        var user_id = req.param('id');
	var conId = req.param('userid');
        var oldPassword = req.param('oldPassword');
        var newPassword = req.param('newPassword');
        console.log(user_id);
        console.log(oldPassword);
        console.log(newPassword);
        
        var userManagementQueryStr = 'Update UserManagement set password=\''+newPassword+'\' where id='+user_id+' and password=\''+oldPassword+'\'';
        console.log(userManagementQueryStr);
        
        conn.query('SELECT *from UserManagement where id='+user_id+'',
            function(err,result){
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
		     var contactId = result.rows[0].contactid;
		     console.log('contactId:'+contactId);
                    conn.query(userManagementQueryStr, 
                        function(err,result){
                            if(err){
                                return res.status(400).json({error: err.message});
                            }
                            else{
				var queryStr = 'Update salesforce.contact set IVOPPassword__c=\''+newPassword+'\' where sfid='+conId+'';
				conn.query(queryStr, 
				     function(err,result){
					if(err){
					    return res.status(400).json({error: err.message});
					}
					else{
					    return res.status(200).json({
							msgid: 1,
							message: 'Success.'});
					}
				});
                            }
                    });
                }
           });
    });
});

function sendEmail(toemail, subject, text){
    var smtpConfig = {
        host: emailhost,
        port: emailport,
        secure: emailsecure, // use SSL, 
                      // you can try with TLS, but port is then 587
        auth: {
          user: emailuser, // Your email id
          pass: emailpassword // Your password
        }
  };
    
    var transporter = nodemailer.createTransport(smtpConfig);
    
    var mailOptions = {
        to: toemail,
        subject: subject,
        text: text
        
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return error;
        }else{
            console.log('Message sent: ' + info.response);
            return "true";
        };
    });
};

app.use('/api', router);

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
