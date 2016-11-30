var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.use(express.static('public'));

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.raw({limit: "50mb", type: '*/*' }));

app.set('port', process.env.PORT || 5000);

var router = express.Router();  

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
                    res.status(400).json({error: err.message});
                }
                else{
                    res.json(result.rows);
                }
            });
    });
});

router.post('/uploadfile', function(req, res) {
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var caseid='';
    var image='';
    var filename='';
    
    var data = req.body;
    var splittedData = data.split(",");
    console.log(splittedData.length);
    /*if(splittedData.length>=2){
        caseid=splittedData[0];
        image=splittedData[1];
        filename=splittedData[2];    
    }*/
    
    res.json(data);
    //res.json({caseid:caseid,filename:filename,image:image});
         //var formattedData='INSERT INTO caseattachment (name, body, herokucaseid) VALUES (\''+req.body.name +'\', \''+req.body.image+'\', '+req.body.caseid+')';
         //console.log('formattedQuery:'+formattedData);
         
         /*pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
             if (err) console.log(err);
             conn.query('INSERT INTO caseattachment (name, body, herokucaseid) VALUES (\''+req.body.name +'\', \''+req.body.image+'\', '+req.body.caseid+')',
                 function(err, result) {
                    done(); 
                 if(err){
                        res.json({
                                msgid: 2,
                                message: err.message});
                    }
                    else{
                        res.json({
                                msgid: 1,
                                message: 'Success.'});
                    }
             });
     });*/
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
             'SELECT firstname, lastname, username,email, phone from UserManagement where email=\''+emailaddress+'\'',
             function(err,result){
              if (err != null || result.rowCount == 0) {
                   res.json({
                        userid: -1,
                        msgid: 2,
                        message: 'Invalid email.'});
                    //res.status(401).json({error: 'Invalid email.'});
                }
                 else{
                       conn.query(
                            'SELECT id, firstname, lastname, username,email, phone from UserManagement where email=\''+emailaddress+'\' and password='+password+'',
                           function(err,result){
                               done();
                               if(err != null || result.rowCount == 0){
                                   res.json({
                                       userid: -1,
                                       msgid: 3,
                                       message: 'Invalid password.'});
                               }
                               else{
                                   res.json({
                                       userid:result.rows[0].id,
                                       msgid: 1,
                                       message: 'Success.'});
                                   //res.json(result.rows);
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
        
        var formattedData='INSERT INTO salesforce.Case (FMA_DeviceName__c, FMA_Dosage__c, FMA_DosageForm__c, FMA_BatchSerialnumber__c, Description, FMA_Dateoffirstuse__c, FMA_Expirydate__c, FMA_Initialpatientname__c, FMA_Initialpatientsurname__c, FMA_Age__c, FMA_Gender__c, FMA_Quantityofproductsconcerned__c, FMA_NameofComplainant__c, FMA_Defectdescription__c, FMA_Isthecomplaintsampleavailable__c, FMA_Expecteddateofsamplereceived__c, FMA_Hasresponsebeenrequested__c, FMA_Ispatientfamiliarwithdeviceusage__c, FMA_Sincewhendoespatientusethiskind__c, FMA_Isthedevicephysicallydamaged__c, FMA_where__c, FMA_Thedamageisduetoanaccidentalfall__c, FMA_Fromwhichheightisoccurredhefall__c, FMA_Isthedefectduetoamisusebypatient__c, FMA_whichkindofmisuse__c, FMA_Issomethingstuckinsidethedevice__c, FMA_whatstuckinside__c, FMA_Adverseeventassociatedtodefect__c, FMA_Adverseeventassociatedwithdefect__c, FMA_OtherInformation__c, FMA_Isproductcartridgestuckedindevice__c, FMA_Isreplacementofproductrequested__c, Subject, Priority, Status) VALUES (\''+jsonData.DeviceName+'\', \''+jsonData.Dosage+'\', \''+jsonData.DosageForm+'\', \''+jsonData.BatchSerialNbr+'\', \''+jsonData.Description+'\', \''+jsonData.DateOfFirstUse+'\', \''+jsonData.ExpiryDate+'\', \''+jsonData.InitialPatientName+'\', \''+jsonData.InitialPatientSurName+'\', '+jsonData.Age+', \''+jsonData.Gender+'\', '+jsonData.QtyOfProductsConcerned+', \''+jsonData.NameOfCompliant+'\', \''+jsonData.DefectDescription+'\', '+jsonData.IsComplaintSampleAvailable+', \''+jsonData.ExpectedDateOfSampleReceived+'\', '+jsonData.HasResponseBeenRequested+', '+jsonData.IsPatientFamiliarWithDeviceUsage+', \''+jsonData.SinceWhenPatientUseThisDevice+'\', '+jsonData.IsDevicePhysicallyDamaged+', \''+jsonData.Where+'\', '+jsonData.DamageDuetoAccidentalFall+', \''+jsonData.FromWhichHeightOccuredtheFall+'\', '+jsonData.IsDefectedDuetomisusebypatient+', \''+jsonData.Whichkindofmisuse+'\', '+jsonData.IsSomethingstuckinsidedevice+', \''+jsonData.WhatStuckinside+'\', '+jsonData.Adverseeventassociatedtodefect+', \''+jsonData.Adverseeventassociatedwithdefect+'\', \''+jsonData.OtherInformation+'\', '+jsonData.Isproductcartridgestuckedindevice+', '+jsonData.Isreplacementofproductrequested+', \''+jsonData.Subject+'\',\''+jsonData.Priority+'\',\''+jsonData.Status+'\')';

         console.log(formattedData);
        
        conn.query('INSERT INTO salesforce.Case (FMA_DeviceName__c, FMA_Dosage__c, FMA_DosageForm__c, FMA_BatchSerialnumber__c, Description,    FMA_Dateoffirstuse__c, FMA_Expirydate__c, FMA_Initialpatientname__c, FMA_Initialpatientsurname__c, FMA_Age__c, FMA_Gender__c, FMA_Quantityofproductsconcerned__c, FMA_NameofComplainant__c, FMA_Defectdescription__c, FMA_Isthecomplaintsampleavailable__c, FMA_Expecteddateofsamplereceived__c, FMA_Hasresponsebeenrequested__c, FMA_Ispatientfamiliarwithdeviceusage__c, FMA_Sincewhendoespatientusethiskind__c, FMA_Isthedevicephysicallydamaged__c, FMA_where__c, FMA_Thedamageisduetoanaccidentalfall__c, FMA_Fromwhichheightisoccurredhefall__c, FMA_Isthedefectduetoamisusebypatient__c, FMA_whichkindofmisuse__c, FMA_Issomethingstuckinsidethedevice__c, FMA_whatstuckinside__c, FMA_Adverseeventassociatedtodefect__c, FMA_Adverseeventassociatedwithdefect__c, FMA_OtherInformation__c, FMA_Isproductcartridgestuckedindevice__c, FMA_Isreplacementofproductrequested__c, Subject, Priority, Status) VALUES (\''+jsonData.DeviceName+'\', \''+jsonData.Dosage+'\', \''+jsonData.DosageForm+'\', \''+jsonData.BatchSerialNbr+'\', \''+jsonData.Description+'\', \''+jsonData.DateOfFirstUse+'\', \''+jsonData.ExpiryDate+'\', \''+jsonData.InitialPatientName+'\', \''+jsonData.InitialPatientSurName+'\', '+jsonData.Age+', \''+jsonData.Gender+'\', '+jsonData.QtyOfProductsConcerned+', \''+jsonData.NameOfCompliant+'\', \''+jsonData.DefectDescription+'\', '+jsonData.IsComplaintSampleAvailable+', \''+jsonData.ExpectedDateOfSampleReceived+'\', '+jsonData.HasResponseBeenRequested+', '+jsonData.IsPatientFamiliarWithDeviceUsage+', \''+jsonData.SinceWhenPatientUseThisDevice+'\', '+jsonData.IsDevicePhysicallyDamaged+', \''+jsonData.Where+'\', '+jsonData.DamageDuetoAccidentalFall+', \''+jsonData.FromWhichHeightOccuredtheFall+'\', '+jsonData.IsDefectedDuetomisusebypatient+', \''+jsonData.Whichkindofmisuse+'\', '+jsonData.IsSomethingstuckinsidedevice+', \''+jsonData.WhatStuckinside+'\', '+jsonData.Adverseeventassociatedtodefect+', \''+jsonData.Adverseeventassociatedwithdefect+'\', \''+jsonData.OtherInformation+'\', '+jsonData.Isproductcartridgestuckedindevice+', '+jsonData.Isreplacementofproductrequested+', \''+jsonData.Subject+'\',\''+jsonData.Priority+'\',\''+jsonData.Status+'\')',
                function(err, result) {
                    done();
                    if(err){
                        console.log(err.message);
                            res.json({
                                    caseid: -1,
                                    msgid: 2,
                                    message: err.message});
                        }
                        else{
                            console.log(result);
                            conn.query('SELECT Max(Id) as maxid from salesforce.Case',
                               function(err,result){
                                    done();
                                    if(result.rowCount > 0){
                                        res.json({
                                           caseid:result.rows[0].maxid,
                                           msgid: 1,
                                           message: 'Success.'});
                                    }else{
                                        res.json({
                                                caseid: -1,
                                                msgid: 1,
                                                message: 'Success.'});
                                    }
                                });
                        }
            });
    });
});

router.get('/getProducts', function(req, res) {
    var productType = req.param('producttype');
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT Administration__c,Data_Transfer__c,Dosage_Form__c,Drug_Substance__c,E_Device_used_with__c,Product_Description__c,Product_Type__c,Quality_Contact_Notified__c,Serial_Batch_code__c,Software_Version__c,Sub_Category__c FROM salesforce.FMA_Product__c WHERE Product_Type__c = '+productType+'',
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
    
    var formattedData='INSERT INTO UserManagement (firstname, email, phone, password) VALUES (\''+jsonData.name+'\', \''+jsonData.email+'\', 1234567899, \''+jsonData.password+'\')';
    console.log('formattedQuery:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
         conn.query('INSERT INTO UserManagement (firstname, email, phone, password) VALUES (\''+jsonData.name+'\', \''+jsonData.email+'\', 1234567899, \''+jsonData.password+'\')',
             function(err, result) {
                done(); 
             if(err){
                    res.json({
                            msgid: 2,
                            message: err.message});
                }
                else{
                    res.json({
                            msgid: 1,
                            message: 'Success.'});
                }
         });
     });
});

router.get('/showImage', function(req, res) {
    var imageid = req.param('imageid');
    console.log('ImageId:'+imageid);
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT *FROM Salesforce.Attachment WHERE sfid = \''+imageid+'\'',
            function(err,result){
                done();
                if (err != null || result.rowCount == 0) {
                   res.json({
                        userid: -1,
                        msgid: 2,
                        message: 'Invalid imageid.'});
                }
                else{
                    
                      res.writeHead(200, {'Content-Type': 'image/text'});
                      res.write('<html><body><img src="data:image/png;base64,')
                      res.write(new Buffer(result.rows[0].body).toString('base64'));
                      res.end('"/></body></html>');
                     //res.writeHead(200, {'Content-Type': 'image/png'});
                     //res.end(result.rows[0].body);
                     //res.json(result.rows[0].body);
                }
            });
    });
});

router.get('/getUsers', function(req, res) {
 pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
     if (err) console.log(err);
        conn.query(
            'SELECT *from UserManagement',
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

app.use('/api', router);

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Contact SET Phone = $1, MobilePhone = $1 WHERE LOWER(FirstName) = LOWER($2) AND LOWER(LastName) = LOWER($3) AND LOWER(Email) = LOWER($4)',
            [req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Contact (Phone, MobilePhone, FirstName, LastName, Email) VALUES ($1, $2, $3, $4, $5)',
                  [req.body.phone.trim(), req.body.phone.trim(), req.body.firstName.trim(), req.body.lastName.trim(), req.body.email.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        /*var testResult=JSON.stringify{
                            port: portnbr,
                            result: result
                        })*/
                        res.json({port:
                                app.get('port'),
                                result: result});
                    }
                  });
                }
                else {
                    done();
                    //res.json(result);
                    res.json({port:
                                app.get('port'),
                                result: result});
                }
            }
        );
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
