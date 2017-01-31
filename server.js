var express = require('express');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var randomstring = require("randomstring");
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

var router = express.Router();  

var baseUrl='https://phone-change-con.herokuapp.com/';

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.get('/getContacts', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT id, email, phone, firstname, lastname, mobilephone from salesforce.Contact',
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

router.post('/uploadfile', function(req, res) {
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    console.log('Body:'+data);
    
    var splitteddata=data.replace("{","").replace("}","").split(',');
    
    var caseid = splitteddata[0];
    var loopid = splitteddata[1];
    var filename = splitteddata[2];
    var contenttype = splitteddata[3];
    var imagedata = splitteddata[4];
    
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
                                console.log('columname:' + columname);
                                var attachmentUrl = baseUrl + 'api/showImage?imageid=' +attachmentrowid;
                                console.log('attachmentUrl:'+attachmentUrl);
                                
                                conn.query('UPDATE salesforce.Case SET '+columname+' = \''+attachmentUrl+'\' WHERE id='+caseid+'',
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

router.get('/ValidateAdmin', function(req, res) {
    var emailaddress = req.headers.email;
    var password = req.headers.password;
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT um.id, um.firstname, um.lastname, um.username, um.email, um.phone, sc.sfid from UserManagement um, Salesforce.Contact sc where um.email=\''+emailaddress+'\'',
             function(err,result){
              if (err != null || result.rowCount == 0) {
                   return  res.json({
                            userid: -1,
                            firstname:'',
                            lastname:'',
                            username:'',
			    uhrkid:'',
                            msgid: 2,
                            message: 'Invalid email.'});
                }
                 else{
                       conn.query(
                            'SELECT um.id, um.firstname, um.lastname, um.username, um.email, um.phone, um.active, sc.sfid from UserManagement um, Salesforce.Contact sc where um.email=\''+emailaddress+'\' and um.password=\''+password+'\' and um.contactid=sc.id',
                           function(err,result){
                               done();
                               if(err != null || result.rowCount == 0){
                                   return  res.json({
                                           userid: -1,
                                           firstname:'',
                                           lastname:'',
                                           username:'',
					   uhrkid:'',
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
                                           msgid: 4,
                                           message: 'User is not synced. Please wait...'}); 
                               }
                               else{
                                  return res.json({
                                           userid:result.rows[0].sfid,
                                           firstname:result.rows[0].firstname,
					   lastname:result.rows[0].lastname,
					   username:result.rows[0].email,
					   uhrkid:result.rows[0].id,
                                           msgid: 1,
                                           message: 'Success.'});
                               }
                            });
                 }
             });
     });
});

router.post('/insertCase', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        
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
        else { return res.json({caseid: -1,msgid: 2,message: 'Please select gender.'});}

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
      		
      	if (jsonData.Whoobservedthedefect !== undefined && jsonData.Whoobservedthedefect !== null && jsonData.Whoobservedthedefect !== "null" && jsonData.Whoobservedthedefect.length > 0)
        { insertQueryData += 'FMA_Whoobservedthedefect__c,'; valuesData += '\'' + jsonData.Whoobservedthedefect + '\'' + ','; }
      		
      	if (jsonData.HastheNurseHCPconfirmedthedefect !== undefined && jsonData.HastheNurseHCPconfirmedthedefect !== null && jsonData.HastheNurseHCPconfirmedthedefect !== "null" && jsonData.HastheNurseHCPconfirmedthedefect.length > 0)
        { insertQueryData += 'FMA_HastheNurseHCPconfirmedthedefect__c,'; valuesData += jsonData.HastheNurseHCPconfirmedthedefect + ','; }
      		
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

        if (jsonData.Adverseeventassociatedwithdefect !== undefined && jsonData.Adverseeventassociatedwithdefect !== null && jsonData.Adverseeventassociatedwithdefect !== "null" && jsonData.Adverseeventassociatedwithdefect.length > 0)
        { insertQueryData += 'FMA_Adverseeventassociatedwithdefect__c,'; valuesData += '\'' + jsonData.Adverseeventassociatedwithdefect + '\'' + ','; }

        if (jsonData.Isproductcartridgestuckedindevice !== undefined && jsonData.Isproductcartridgestuckedindevice !== null && jsonData.Isproductcartridgestuckedindevice !== "null" && jsonData.Isproductcartridgestuckedindevice.length > 0)
        { insertQueryData += 'FMA_Isproductcartridgestuckedindevice__c,'; valuesData += jsonData.Isproductcartridgestuckedindevice + ','; }

        if (jsonData.Isreplacementofproductrequested !== undefined && jsonData.Isreplacementofproductrequested !== null && jsonData.Isreplacementofproductrequested !== "null" && jsonData.Isreplacementofproductrequested.length > 0)
        { insertQueryData += 'FMA_Isreplacementofproductrequested__c,'; valuesData += jsonData.Isreplacementofproductrequested + ','; }
		
      	if (jsonData.Subject !== undefined && jsonData.Subject !== null && jsonData.Subject !== "null" && jsonData.Subject.length > 0)
        { insertQueryData += 'Subject,'; valuesData += '\'' + jsonData.Subject + '\'' + ','; }
      		
      	if (jsonData.Description !== undefined && jsonData.Description !== null && jsonData.Description !== "null" && jsonData.Description.length > 1)
        { insertQueryData += 'Description,'; valuesData += '\'' + jsonData.Description + '\'' + ','; }
		
	        insertQueryData += 'Priority,'; valuesData += '\'' + 'Medium' + '\'' + ',';
		
	        insertQueryData += 'Status'; valuesData += '\'' + 'New' + '\'';		
		
	/*
	*****************************Additional Fields. Not using after final feedback from Ingrid
		
	if (jsonData.QtyOfProductsConcerned !== undefined && jsonData.QtyOfProductsConcerned !== null && jsonData.QtyOfProductsConcerned !== "null" && jsonData.QtyOfProductsConcerned.length > 0)
        { insertQueryData += 'FMA_Quantityofproductsconcerned__c,'; valuesData += jsonData.QtyOfProductsConcerned + ','; }
		
        if (jsonData.ExpectedDateOfSampleReceived !== undefined && jsonData.ExpectedDateOfSampleReceived !== null && jsonData.ExpectedDateOfSampleReceived !== "null" && jsonData.ExpectedDateOfSampleReceived.length > 7)
        { insertQueryData += 'FMA_Expecteddateofsamplereceived__c,'; valuesData += '\'' + jsonData.ExpectedDateOfSampleReceived + '\'' + ','; }

        if (jsonData.Where !== undefined && jsonData.Where !== null && jsonData.Where !== "null" && jsonData.Where.length > 0)
        { insertQueryData += 'FMA_where__c,'; valuesData += '\'' + jsonData.Where + '\'' + ','; }

        if (jsonData.FromWhichHeightOccuredtheFall !== undefined && jsonData.FromWhichHeightOccuredtheFall !== null && jsonData.FromWhichHeightOccuredtheFall !== "null" && jsonData.FromWhichHeightOccuredtheFall.length > 0)
        { insertQueryData += 'FMA_Fromwhichheightisoccurredhefall__c,'; valuesData += '\'' + jsonData.FromWhichHeightOccuredtheFall + '\'' + ','; }

        if (jsonData.Whichkindofmisuse !== undefined && jsonData.Whichkindofmisuse !== null && jsonData.Whichkindofmisuse !== "null" && jsonData.Whichkindofmisuse.length > 0)
        { insertQueryData += 'FMA_whichkindofmisuse__c,'; valuesData += '\'' + jsonData.Whichkindofmisuse + '\'' + ','; }

        if (jsonData.IsSomethingstuckinsidedevice !== undefined && jsonData.IsSomethingstuckinsidedevice !== null && jsonData.IsSomethingstuckinsidedevice !== "null" && jsonData.IsSomethingstuckinsidedevice.length > 0)
        { insertQueryData += 'FMA_Issomethingstuckinsidethedevice__c,'; valuesData += jsonData.IsSomethingstuckinsidedevice + ','; }

        if (jsonData.OtherInformation !== undefined && jsonData.OtherInformation !== null && jsonData.OtherInformation !== "null" && jsonData.OtherInformation.length > 0)
        { insertQueryData += 'FMA_OtherInformation__c,'; valuesData += '\'' + jsonData.OtherInformation + '\'' + ','; }
		
	if (jsonData.username !== undefined && jsonData.username !== null && jsonData.username !== "null" && jsonData.username.length > 0)
        { insertQueryData += 'fma_feedbackcreator__c'; valuesData += '\'' + jsonData.username + '\''; }
        else { return res.json({caseid: -1,msgid: 2,message: 'username should not be empty.'});}
	
        *****************************		
	*/        
        //-------------------------------------------End Framing Query-------------------------------------------
        
        //timestamp
        if (jsonData.timestamp !== undefined && jsonData.timestamp !== null && jsonData.timestamp !== "null" && jsonData.timestamp.length > 0)
        { timestamp = jsonData.timestamp; }
        
        var combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
        console.log(combinedQuery); 
        
        conn.query(combinedQuery,
                function(err, result) {
                    done();
                    if(err){
                        console.log(err.message);
                            return res.json({
                                    caseid: -1,
                                    msgid: 2,
                                    timestamp: timestamp,
                                    message: err.message});
                        }
                        else{
                            console.log(result);
                            return res.json({
                                    caseid:result.rows[0].id,
                                    msgid: 1,
                                    timestamp: timestamp,
                                    message: 'Success.'});
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
            'SELECT sfid, Name,Product_Description__c, Product_Type__c, Serial_Batch_code__c,Type__c, Product_Germany_Description__c, Product_Italy_Description__c, BrandingColor__c FROM salesforce.FMA_Product__c WHERE Type__c=\''+type+'\'',
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

router.post('/CreateUser', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    
    var formattedData='INSERT INTO Salesforce.Contact (firstname, lastname, email, phone) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email+'\', \''+jsonData.phone+'\')  RETURNING id';
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
                    conn.query('INSERT INTO Salesforce.Contact (firstname, lastname, email, phone) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email+'\', \''+jsonData.phone+'\')  RETURNING id',
                         function(err, result) {
                            if(err){
                                    return res.json({
                                            msgid: 2,
                                            message: err.message});
                                }
                                else{
                                    var contactid = result.rows[0].id;
                                    console.log('contactid: '+contactid);

                                    var formattedData='INSERT INTO UserManagement (firstname, lastname, email, phone, password, contactid) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email+'\', \''+jsonData.phone+'\', \''+jsonData.password+'\', \''+contactid+'\')';
                                    console.log('formatted UserManagement Query:'+formattedData);

                                    conn.query('INSERT INTO UserManagement (firstname, lastname, email, phone, password, contactid, active) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email+'\', \''+jsonData.phone+'\', \''+jsonData.password+'\', \''+contactid+'\',true)',
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

router.put('/forgotPassword', function(req,res){
    var emailAddress = req.param('email').trim();
    console.log(emailAddress);
     pg.connect(process.env.DATABASE_URL, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT id, firstname, lastname, username, email, phone from UserManagement where trim(email)=\''+emailAddress+'\'',
             function(err,result){
                done();
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
                            var text = 'Merck Feedback Managemant App recently received a request to reset the password.\n\nPlease use this current password to login:  '+resetPassword+' \n\n Thanks';
                            var resultStr = sendEmail(emailAddress, subject, text);
                            return res.json({
                                            msgid: 1,
                                            message: 'Success.'});
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
        
        var userManagementQueryStr = 'Update UserManagement set firstname=\''+jsonData.firstname+'\', lastname=\''+jsonData.lastname+'\', email=\''+jsonData.email+'\', phone=\''+jsonData.phone+'\' where id='+user_id+'';
        console.log(userManagementQueryStr);
        
        conn.query('SELECT *from UserManagement where id='+user_id+'',
            function(err,result){
                if(err){
                    return res.status(400).json({error: err.message});
                }
                else{
                    var contactId = result.rows[0].contactid;
                    console.log('contactId:'+contactId);
                    
                    var contactQueryStr = 'Update Salesforce.Contact set firstname=\''+jsonData.firstname+'\', lastname=\''+jsonData.lastname+'\', email=\''+jsonData.email+'\', phone=\''+jsonData.phone+'\' where id='+contactId+'';
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
    });
});

router.put('/changePassword', function(req, res) {
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
