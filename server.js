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
    var imagedata = splitteddata[3];
    
    var formattedData='INSERT INTO caseattachment (name, body, herokucaseid) VALUES ('+filename +', '+imagedata+', '+caseid+') RETURNING id';
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
                      conn.query('INSERT INTO caseattachment (name, body, herokucaseid) VALUES ('+ filename +', '+imagedata+', '+caseid+') RETURNING id',
                         function(err, result) {
                         var attachmentrowid = result.rows[0].id;
                         if(err){
                                return res.json({
                                        attachementid: -1,
                                        msgid: 2,
                                        message: err.message});
                            }
                            else{
                                var columname = '';
                                if(loopid === 6){
                                    columname = 'FMA_Barcode_Attachment__c';
                                }else{
                                    columname = 'fma_attachment' + loopid + '__c';
                                }
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
             'SELECT firstname, lastname, username,email, phone from UserManagement where email=\''+emailaddress+'\'',
             function(err,result){
              if (err != null || result.rowCount == 0) {
                   return  res.json({
                            userid: -1,
                            username:'',
                            msgid: 2,
                            message: 'Invalid email.'});
                }
                 else{
                       conn.query(
                            'SELECT id, firstname, lastname, username, email, phone from UserManagement where email=\''+emailaddress+'\' and password='+password+'',
                           function(err,result){
                               done();
                               if(err != null || result.rowCount == 0){
                                   return  res.json({
                                           userid: -1,
                                           username:'',
                                           msgid: 3,
                                           message: 'Invalid password.'});
                               }
                               else{
                                  return res.json({
                                           userid:result.rows[0].id,
                                           username:result.rows[0].username,
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
        var insertQueryData = 'INSERT INTO salesforce.Case (';
        var valuesData=' VALUES (';
        
        //-------------------------------------------Framing Query-------------------------------------------
        if (jsonData.DeviceName !== undefined && jsonData.DeviceName !== null && jsonData.DeviceName !== "null" && jsonData.DeviceName.length > 0)
        { insertQueryData += 'FMA_DeviceName__c,'; valuesData += '\'' + jsonData.DeviceName + '\'' + ','; }
        else { return res.json({caseid: -1,msgid: 2,message: 'Please select device name.'});}
        

        if (jsonData.Dosage !== undefined && jsonData.Dosage !== null && jsonData.Dosage !== "null" && jsonData.Dosage.length > 1)
        { insertQueryData += 'FMA_Dosage__c,'; valuesData += '\'' + jsonData.Dosage + '\'' + ','; }

        if (jsonData.DosageForm !== undefined && jsonData.DosageForm !== null && jsonData.DosageForm !== "null" && jsonData.DosageForm.length > 1)
        { insertQueryData += 'FMA_DosageForm__c,'; valuesData += '\'' + jsonData.DosageForm + '\'' + ','; }

        if (jsonData.BatchSerialNbr !== undefined && jsonData.BatchSerialNbr !== null && jsonData.BatchSerialNbr !== "null" && jsonData.BatchSerialNbr.length > 1)
        { insertQueryData += 'FMA_BatchSerialnumber__c,'; valuesData += '\'' + jsonData.BatchSerialNbr + '\'' + ','; }

        if (jsonData.Description !== undefined && jsonData.Description !== null && jsonData.Description !== "null" && jsonData.Description.length > 1)
        { insertQueryData += 'Description,'; valuesData += '\'' + jsonData.Description + '\'' + ','; }

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

        if (jsonData.Gender !== undefined && jsonData.Gender !== null && jsonData.Gender !== "null" && jsonData.Gender.length > 0)
        { insertQueryData += 'FMA_Gender__c,'; valuesData += '\'' + jsonData.Gender + '\'' + ','; }
        else { return res.json({caseid: -1,msgid: 2,message: 'Please select gender.'});}

        if (jsonData.QtyOfProductsConcerned !== undefined && jsonData.QtyOfProductsConcerned !== null && jsonData.QtyOfProductsConcerned !== "null" && jsonData.QtyOfProductsConcerned.length > 0)
        { insertQueryData += 'FMA_Quantityofproductsconcerned__c,'; valuesData += jsonData.QtyOfProductsConcerned + ','; }

        if (jsonData.NameOfCompliant !== undefined && jsonData.NameOfCompliant !== null && jsonData.NameOfCompliant !== "null" && jsonData.NameOfCompliant.length > 1)
        { insertQueryData += 'FMA_NameofComplainant__c,'; valuesData += '\'' + jsonData.NameOfCompliant + '\'' + ','; }

        if (jsonData.DefectDescription !== undefined && jsonData.DefectDescription !== null && jsonData.DefectDescription !== "null" && jsonData.DefectDescription.length > 1)
        { insertQueryData += 'FMA_Defectdescription__c,'; valuesData += '\'' + jsonData.DefectDescription + '\'' + ','; }

        if (jsonData.IsComplaintSampleAvailable !== undefined && jsonData.IsComplaintSampleAvailable !== null && jsonData.IsComplaintSampleAvailable !== "null" && jsonData.IsComplaintSampleAvailable.length > 0)
        { insertQueryData += 'FMA_Isthecomplaintsampleavailable__c,'; valuesData += jsonData.IsComplaintSampleAvailable + ','; }

        if (jsonData.ExpectedDateOfSampleReceived !== undefined && jsonData.ExpectedDateOfSampleReceived !== null && jsonData.ExpectedDateOfSampleReceived !== "null" && jsonData.ExpectedDateOfSampleReceived.length > 7)
        { insertQueryData += 'FMA_Expecteddateofsamplereceived__c,'; valuesData += '\'' + jsonData.ExpectedDateOfSampleReceived + '\'' + ','; }

        if (jsonData.HasResponseBeenRequested !== undefined && jsonData.HasResponseBeenRequested !== null && jsonData.HasResponseBeenRequested !== "null" && jsonData.HasResponseBeenRequested.length > 0)
        { insertQueryData += 'FMA_Hasresponsebeenrequested__c,'; valuesData += jsonData.HasResponseBeenRequested + ','; }

        if (jsonData.IsPatientFamiliarWithDeviceUsage !== undefined && jsonData.IsPatientFamiliarWithDeviceUsage !== null && jsonData.IsPatientFamiliarWithDeviceUsage !== "null" && jsonData.IsPatientFamiliarWithDeviceUsage.length > 0)
        { insertQueryData += 'FMA_Ispatientfamiliarwithdeviceusage__c,'; valuesData += jsonData.IsPatientFamiliarWithDeviceUsage + ','; }

        if (jsonData.SinceWhenPatientUseThisDevice !== undefined && jsonData.SinceWhenPatientUseThisDevice !== null && jsonData.SinceWhenPatientUseThisDevice !== "null" && jsonData.SinceWhenPatientUseThisDevice.length > 1)
        { insertQueryData += 'FMA_Sincewhendoespatientusethiskind__c,'; valuesData += '\'' + jsonData.SinceWhenPatientUseThisDevice + '\'' + ','; }

        if (jsonData.IsDevicePhysicallyDamaged !== undefined && jsonData.IsDevicePhysicallyDamaged !== null && jsonData.IsDevicePhysicallyDamaged !== "null" && jsonData.IsDevicePhysicallyDamaged.length > 0)
        { insertQueryData += 'FMA_Isthedevicephysicallydamaged__c,'; valuesData += jsonData.IsDevicePhysicallyDamaged + ','; }

        if (jsonData.Where !== undefined && jsonData.Where !== null && jsonData.Where !== "null" && jsonData.Where.length > 0)
        { insertQueryData += 'FMA_where__c,'; valuesData += '\'' + jsonData.Where + '\'' + ','; }

        if (jsonData.DamageDuetoAccidentalFall !== undefined && jsonData.DamageDuetoAccidentalFall !== null && jsonData.DamageDuetoAccidentalFall !== "null" && jsonData.DamageDuetoAccidentalFall.length > 0)
        { insertQueryData += 'FMA_Thedamageisduetoanaccidentalfall__c,'; valuesData += jsonData.DamageDuetoAccidentalFall + ','; }

        if (jsonData.FromWhichHeightOccuredtheFall !== undefined && jsonData.FromWhichHeightOccuredtheFall !== null && jsonData.FromWhichHeightOccuredtheFall !== "null" && jsonData.FromWhichHeightOccuredtheFall.length > 0)
        { insertQueryData += 'FMA_Fromwhichheightisoccurredhefall__c,'; valuesData += '\'' + jsonData.FromWhichHeightOccuredtheFall + '\'' + ','; }

        if (jsonData.IsDefectedDuetomisusebypatient !== undefined && jsonData.IsDefectedDuetomisusebypatient !== null && jsonData.IsDefectedDuetomisusebypatient !== "null" && jsonData.IsDefectedDuetomisusebypatient.length > 0)
        { insertQueryData += 'FMA_Isthedefectduetoamisusebypatient__c,'; valuesData += jsonData.IsDefectedDuetomisusebypatient + ','; }

        if (jsonData.Whichkindofmisuse !== undefined && jsonData.Whichkindofmisuse !== null && jsonData.Whichkindofmisuse !== "null" && jsonData.Whichkindofmisuse.length > 0)
        { insertQueryData += 'FMA_whichkindofmisuse__c,'; valuesData += '\'' + jsonData.Whichkindofmisuse + '\'' + ','; }

        if (jsonData.IsSomethingstuckinsidedevice !== undefined && jsonData.IsSomethingstuckinsidedevice !== null && jsonData.IsSomethingstuckinsidedevice !== "null" && jsonData.IsSomethingstuckinsidedevice.length > 0)
        { insertQueryData += 'FMA_Issomethingstuckinsidethedevice__c,'; valuesData += jsonData.IsSomethingstuckinsidedevice + ','; }

        if (jsonData.WhatStuckinside !== undefined && jsonData.WhatStuckinside !== null && jsonData.WhatStuckinside !== "null" && jsonData.WhatStuckinside.length > 0)
        { insertQueryData += 'FMA_whatstuckinside__c,'; valuesData += '\'' + jsonData.WhatStuckinside + '\'' + ','; }

        if (jsonData.Adverseeventassociatedtodefect !== undefined && jsonData.Adverseeventassociatedtodefect !== null && jsonData.Adverseeventassociatedtodefect !== "null" && jsonData.Adverseeventassociatedtodefect.length > 0)
        { insertQueryData += 'FMA_Adverseeventassociatedtodefect__c,'; valuesData += jsonData.Adverseeventassociatedtodefect + ','; }

        if (jsonData.Adverseeventassociatedwithdefect !== undefined && jsonData.Adverseeventassociatedwithdefect !== null && jsonData.Adverseeventassociatedwithdefect !== "null" && jsonData.Adverseeventassociatedwithdefect.length > 0)
        { insertQueryData += 'FMA_Adverseeventassociatedwithdefect__c,'; valuesData += '\'' + jsonData.Adverseeventassociatedwithdefect + '\'' + ','; }

        if (jsonData.OtherInformation !== undefined && jsonData.OtherInformation !== null && jsonData.OtherInformation !== "null" && jsonData.OtherInformation.length > 0)
        { insertQueryData += 'FMA_OtherInformation__c,'; valuesData += '\'' + jsonData.OtherInformation + '\'' + ','; }

        if (jsonData.Isproductcartridgestuckedindevice !== undefined && jsonData.Isproductcartridgestuckedindevice !== null && jsonData.Isproductcartridgestuckedindevice !== "null" && jsonData.Isproductcartridgestuckedindevice.length > 0)
        { insertQueryData += 'FMA_Isproductcartridgestuckedindevice__c,'; valuesData += jsonData.Isproductcartridgestuckedindevice + ','; }

        if (jsonData.Isreplacementofproductrequested !== undefined && jsonData.Isreplacementofproductrequested !== null && jsonData.Isreplacementofproductrequested !== "null" && jsonData.Isreplacementofproductrequested.length > 0)
        { insertQueryData += 'FMA_Isreplacementofproductrequested__c,'; valuesData += jsonData.Isreplacementofproductrequested + ','; }

        if (jsonData.Subject !== undefined && jsonData.Subject !== null && jsonData.Subject !== "null" && jsonData.Subject.length > 0)
        { insertQueryData += 'Subject,'; valuesData += '\'' + jsonData.Subject + '\'' + ','; }

        if (jsonData.Priority !== undefined && jsonData.Priority !== null && jsonData.Priority !== "null" && jsonData.Priority.length > 0)
        { insertQueryData += 'Priority,'; valuesData += '\'' + jsonData.Priority + '\'' + ','; }

        if (jsonData.Status !== undefined && jsonData.Status !== null && jsonData.Status !== "null" && jsonData.Status.length > 0)
        { insertQueryData += 'Status,'; valuesData += '\'' + jsonData.Status + '\'' + ','; }
        
        if (jsonData.userid !== undefined && jsonData.userid !== null && jsonData.userid !== "null" && jsonData.userid.toString().length > 0)
        { insertQueryData += 'fma_loginuserid__c,'; valuesData += '\'' + jsonData.userid + '\'' + ','; }
        else { return res.json({caseid: -1,msgid: 2,message: 'userid should not be empty.'});}

        if (jsonData.username !== undefined && jsonData.username !== null && jsonData.username !== "null" && jsonData.username.length > 0)
        { insertQueryData += 'fma_feedbackcreator__c'; valuesData += '\'' + jsonData.username + '\''; }
        else { return res.json({caseid: -1,msgid: 2,message: 'username should not be empty.'});}
        
        //-------------------------------------------End Framing Query-------------------------------------------
        
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
                                    message: err.message});
                        }
                        else{
                            console.log(result);
                            return res.json({
                                    caseid:result.rows[0].id,
                                    msgid: 1,
                                    message: 'Success.'});
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
                   return res.status(400).json({error: err.message});
                }
                else{
                    return res.json(result.rows);
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

router.get('/showImage', function(req, res) {
    var imageid = req.param('imageid');
    console.log('ImageId:'+imageid);
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT *FROM caseattachment WHERE id = '+imageid+'',
            function(err,result){
                done();
                if (err != null || result.rowCount == 0) {
                   return res.json({
                            userid: -1,
                            msgid: 2,
                            message: 'Invalid imageid.'});
                }
                else{
                    var img = new Buffer(result.rows[0].body, 'base64');
                    res.writeHead(200, {
                     'Content-Type': 'image/png',
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
            'SELECT *from UserManagement',
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
                        return res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        /*var testResult=JSON.stringify{
                            port: portnbr,
                            result: result
                        })*/
                        return res.json({port:
                                app.get('port'),
                                result: result});
                    }
                  });
                }
                else {
                    done();
                    //res.json(result);
                    return res.json({port:
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
