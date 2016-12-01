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
                      res.json({
                            msgid: 2,
                            message: 'case id not found.'});
                 }else{
                      conn.query('INSERT INTO caseattachment (name, body, herokucaseid) VALUES ('+ filename +', '+imagedata+', '+caseid+') RETURNING id',
                         function(err, result) {
                         var attachmentrowid = result.rows[0].id;
                         if(err){
                                res.json({
                                        attachementid: -1,
                                        msgid: 2,
                                        message: err.message});
                            }
                            else{
                                var columname = 'fma_attachment' + loopid + '__c';
                                console.log('columname:' + columname);
                                var attachmentUrl = baseUrl + 'api/showImage?imageid=' +attachmentrowid;
                                console.log('attachmentUrl:'+attachmentUrl);
                                
                                conn.query('UPDATE salesforce.Case SET '+columname+' = \''+attachmentUrl+'\' WHERE id='+caseid+'',
                                    function(err,result){
                                        done();
                                        if(err){
                                            res.json({
                                            attachementid: -1,
                                            msgid: 2,
                                            message: err.message});
                                        }
                                        else{
                                            res.json({
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
                   res.json({
                        userid: -1,
                        username:'',
                        msgid: 2,
                        message: 'Invalid email.'});
                    //res.status(401).json({error: 'Invalid email.'});
                }
                 else{
                       conn.query(
                            'SELECT id, firstname, lastname, username, email, phone from UserManagement where email=\''+emailaddress+'\' and password='+password+'',
                           function(err,result){
                               done();
                               if(err != null || result.rowCount == 0){
                                   res.json({
                                       userid: -1,
                                       username:'',
                                       msgid: 3,
                                       message: 'Invalid password.'});
                               }
                               else{
                                   res.json({
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
        
        //---------------Format Data---------------
        
        if(jsonData.DeviceName === null || jsonData.DeviceName === "null" || jsonData.DeviceName.length < 1) { jsonData.DeviceName = 'NULL' } else { jsonData.DeviceName = ''+jsonData.DeviceName+'' };
        
        if(jsonData.Dosage === null || jsonData.Dosage === "null" || jsonData.Dosage.length < 1) { jsonData.Dosage = 'NULL' } else { jsonData.Dosage = ''+jsonData.Dosage+'' };
        
        if(jsonData.DosageForm === null || jsonData.DosageForm === "null" || jsonData.DosageForm.length < 1) { jsonData.DosageForm = 'NULL' } else { jsonData.DosageForm = ''+jsonData.DosageForm+'' };
        
        if(jsonData.BatchSerialNbr === null || jsonData.BatchSerialNbr === "null" || jsonData.BatchSerialNbr.length < 1) { jsonData.BatchSerialNbr = 'NULL' } else { jsonData.BatchSerialNbr = ''+jsonData.BatchSerialNbr+'' };
        
        if(jsonData.Description === null || jsonData.Description === "null" || jsonData.Description.length < 1) { jsonData.Description = 'NULL' } else { jsonData.Description = ''+jsonData.Description+'' };
        
        if(jsonData.DateOfFirstUse === null || jsonData.DateOfFirstUse === "null" || jsonData.DateOfFirstUse.length < 1) { jsonData.DateOfFirstUse = 'NULL' } else { jsonData.DateOfFirstUse = ''+jsonData.DateOfFirstUse+'' };
        
        if(jsonData.ExpiryDate === null || jsonData.ExpiryDate === "null" || jsonData.ExpiryDate.length < 1) { jsonData.ExpiryDate = 'NULL' } else { jsonData.ExpiryDate = jsonData.ExpiryDate };
        
        if(jsonData.InitialPatientName === null || jsonData.InitialPatientName === "null" || jsonData.InitialPatientName.length < 1) { jsonData.InitialPatientName = 'NULL' } else { jsonData.InitialPatientName = ''+jsonData.InitialPatientName+'' };
        
        if(jsonData.InitialPatientSurName === null || jsonData.InitialPatientSurName === "null" || jsonData.InitialPatientSurName.length < 1) { jsonData.InitialPatientSurName = 'NULL' } else { jsonData.InitialPatientSurName = ''+jsonData.InitialPatientSurName+'' };
        
        if(jsonData.Age === null || jsonData.Age === "null" || jsonData.Age.length < 1) { jsonData.Age = 'NULL' } else { jsonData.Age = jsonData.Age };
        if(jsonData.Gender === null || jsonData.Gender === "null" || jsonData.Gender.length < 1) { jsonData.Gender = 'NULL' } else { jsonData.Gender = ''+jsonData.Gender+'' };
        
        if(jsonData.QtyOfProductsConcerned === null || jsonData.QtyOfProductsConcerned === "null" || jsonData.QtyOfProductsConcerned.length < 1) { jsonData.QtyOfProductsConcerned = 'NULL' } else { jsonData.QtyOfProductsConcerned = jsonData.QtyOfProductsConcerned };
        
        if(jsonData.NameOfCompliant === null || jsonData.NameOfCompliant === "null" || jsonData.NameOfCompliant.length < 1) { jsonData.NameOfCompliant = 'NULL' } else { jsonData.NameOfCompliant = ''+jsonData.NameOfCompliant+'' };
        
        if(jsonData.DefectDescription === null || jsonData.DefectDescription === "null" || jsonData.DefectDescription.length < 1) { jsonData.DefectDescription = 'NULL' } else { jsonData.DefectDescription = ''+jsonData.DefectDescription+'' };
        
        if(jsonData.IsComplaintSampleAvailable === null || jsonData.IsComplaintSampleAvailable === "null" || jsonData.IsComplaintSampleAvailable.length < 1) { jsonData.IsComplaintSampleAvailable = 'NULL' } else { jsonData.IsComplaintSampleAvailable = jsonData.IsComplaintSampleAvailable };
        
        if(jsonData.ExpectedDateOfSampleReceived === null || jsonData.ExpectedDateOfSampleReceived === "null" || jsonData.ExpectedDateOfSampleReceived.length < 1) { jsonData.ExpectedDateOfSampleReceived = 'NULL' } else { jsonData.ExpectedDateOfSampleReceived = ''+jsonData.ExpectedDateOfSampleReceived+'' };
        
        if(jsonData.HasResponseBeenRequested === null || jsonData.HasResponseBeenRequested === "null" || jsonData.HasResponseBeenRequested.length < 1) { jsonData.HasResponseBeenRequested = 'NULL' } else { jsonData.HasResponseBeenRequested = jsonData.HasResponseBeenRequested };
        
        if(jsonData.IsPatientFamiliarWithDeviceUsage === null || jsonData.IsPatientFamiliarWithDeviceUsage === "null" || jsonData.IsPatientFamiliarWithDeviceUsage.length < 1) { jsonData.IsPatientFamiliarWithDeviceUsage = 'NULL' } else { jsonData.IsPatientFamiliarWithDeviceUsage = jsonData.IsPatientFamiliarWithDeviceUsage };
        
        if(jsonData.SinceWhenPatientUseThisDevice === null || jsonData.SinceWhenPatientUseThisDevice === "null" || jsonData.SinceWhenPatientUseThisDevice.length < 1) { jsonData.SinceWhenPatientUseThisDevice = 'NULL' } else { jsonData.SinceWhenPatientUseThisDevice = ''+jsonData.SinceWhenPatientUseThisDevice+'' };
        
        if(jsonData.IsDevicePhysicallyDamaged === null || jsonData.IsDevicePhysicallyDamaged === "null" || jsonData.IsDevicePhysicallyDamaged.length < 1) { jsonData.IsDevicePhysicallyDamaged = 'NULL' } else { jsonData.IsDevicePhysicallyDamaged = jsonData.IsDevicePhysicallyDamaged };
        
        if(jsonData.Where === null || jsonData.Where === "null" || jsonData.Where.length < 1) { jsonData.Where = 'NULL' } else { jsonData.Where = ''+jsonData.Where+'' };
        
        if(jsonData.DamageDuetoAccidentalFall === null || jsonData.DamageDuetoAccidentalFall === "null" || jsonData.DamageDuetoAccidentalFall.length < 1) { jsonData.DamageDuetoAccidentalFall = 'NULL' } else { jsonData.DamageDuetoAccidentalFall = jsonData.DamageDuetoAccidentalFall };
        
        if(jsonData.FromWhichHeightOccuredtheFall === null || jsonData.FromWhichHeightOccuredtheFall === "null" || jsonData.FromWhichHeightOccuredtheFall.length < 1) { jsonData.FromWhichHeightOccuredtheFall = 'NULL' } else { jsonData.FromWhichHeightOccuredtheFall = ''+jsonData.FromWhichHeightOccuredtheFall+'' };
        
        if(jsonData.IsDefectedDuetomisusebypatient === null || jsonData.IsDefectedDuetomisusebypatient === "null" || jsonData.IsDefectedDuetomisusebypatient.length < 1) { jsonData.IsDefectedDuetomisusebypatient = 'NULL' } else { jsonData.IsDefectedDuetomisusebypatient = jsonData.IsDefectedDuetomisusebypatient };
        
        if(jsonData.Whichkindofmisuse === null || jsonData.Whichkindofmisuse === "null" || jsonData.Whichkindofmisuse.length < 1) { jsonData.Whichkindofmisuse = 'NULL' } else { jsonData.Whichkindofmisuse = ''+jsonData.Whichkindofmisuse+'' };
        
        if(jsonData.IsSomethingstuckinsidedevice === null || jsonData.IsSomethingstuckinsidedevice === "null" || jsonData.IsSomethingstuckinsidedevice.length < 1) { jsonData.IsSomethingstuckinsidedevice = 'NULL' } else { jsonData.IsSomethingstuckinsidedevice = jsonData.IsSomethingstuckinsidedevice };
        
        if(jsonData.WhatStuckinside === null || jsonData.WhatStuckinside === "null" || jsonData.WhatStuckinside.length < 1) { jsonData.WhatStuckinside = 'NULL' } else { jsonData.WhatStuckinside = ''+jsonData.WhatStuckinside+'' };
        
        if(jsonData.Adverseeventassociatedtodefect === null || jsonData.Adverseeventassociatedtodefect === "null" || jsonData.Adverseeventassociatedtodefect.length < 1) { jsonData.Adverseeventassociatedtodefect = 'NULL' } else { jsonData.Adverseeventassociatedtodefect = jsonData.Adverseeventassociatedtodefect };
        
        if(jsonData.Adverseeventassociatedwithdefect === null || jsonData.Adverseeventassociatedwithdefect === "null" || jsonData.Adverseeventassociatedwithdefect.length < 1) { jsonData.Adverseeventassociatedwithdefect = 'NULL' } else { jsonData.Adverseeventassociatedwithdefect = ''+jsonData.Adverseeventassociatedwithdefect+'' };
        
        if(jsonData.OtherInformation === null || jsonData.OtherInformation === "null" || jsonData.OtherInformation.length < 1) { jsonData.OtherInformation = 'NULL' } else { jsonData.OtherInformation = ''+jsonData.OtherInformation+'' };
        
        if(jsonData.Isproductcartridgestuckedindevice === null || jsonData.Isproductcartridgestuckedindevice === "null" || jsonData.Isproductcartridgestuckedindevice.length < 1) { jsonData.Isproductcartridgestuckedindevice = 'NULL' } else { jsonData.Isproductcartridgestuckedindevice = jsonData.Isproductcartridgestuckedindevice };
        
        if(jsonData.Isreplacementofproductrequested === null || jsonData.Isreplacementofproductrequested === "null" || jsonData.Isreplacementofproductrequested.length < 1) { jsonData.Isreplacementofproductrequested = 'NULL' } else { jsonData.Isreplacementofproductrequested = jsonData.Isreplacementofproductrequested };
        
        if(jsonData.Subject === null || jsonData.Subject === "null" || jsonData.Subject.length < 1) { jsonData.Subject = 'NULL' } else { jsonData.Subject = ''+jsonData.Subject+'' };
        if(jsonData.Priority === null || jsonData.Priority === "null" || jsonData.Priority.length < 1) { jsonData.Priority = 'NULL' } else { jsonData.Priority = ''+jsonData.Priority+'' };
        if(jsonData.Status === null || jsonData.Status === "null" || jsonData.Status.length < 1) { jsonData.Status = 'NULL' } else { jsonData.Status = ''+jsonData.Status+'' };
        if(jsonData.userid === null || jsonData.userid === "null" || jsonData.userid.length < 1) { jsonData.userid = 'NULL' } else { jsonData.userid = ''+jsonData.userid+'' };
        if(jsonData.username === null || jsonData.username === "null" || jsonData.username.length < 1) { jsonData.username = 'NULL' } else { jsonData.username = ''+jsonData.username+'' };
        
        //---------------End Format Data---------------
        
        /*var formattedData='INSERT INTO salesforce.Case (FMA_DeviceName__c, FMA_Dosage__c, FMA_DosageForm__c, FMA_BatchSerialnumber__c, Description, FMA_Dateoffirstuse__c, FMA_Expirydate__c, FMA_Initialpatientname__c, FMA_Initialpatientsurname__c, FMA_Age__c, FMA_Gender__c, FMA_Quantityofproductsconcerned__c, FMA_NameofComplainant__c, FMA_Defectdescription__c, FMA_Isthecomplaintsampleavailable__c, FMA_Expecteddateofsamplereceived__c, FMA_Hasresponsebeenrequested__c, FMA_Ispatientfamiliarwithdeviceusage__c, FMA_Sincewhendoespatientusethiskind__c, FMA_Isthedevicephysicallydamaged__c, FMA_where__c, FMA_Thedamageisduetoanaccidentalfall__c, FMA_Fromwhichheightisoccurredhefall__c, FMA_Isthedefectduetoamisusebypatient__c, FMA_whichkindofmisuse__c, FMA_Issomethingstuckinsidethedevice__c, FMA_whatstuckinside__c, FMA_Adverseeventassociatedtodefect__c, FMA_Adverseeventassociatedwithdefect__c, FMA_OtherInformation__c, FMA_Isproductcartridgestuckedindevice__c, FMA_Isreplacementofproductrequested__c, Subject, Priority, Status,fma_loginuserid__c,fma_feedbackcreator__c) VALUES (\''+jsonData.DeviceName+'\', \''+jsonData.Dosage+'\', \''+jsonData.DosageForm+'\', \''+jsonData.BatchSerialNbr+'\', \''+jsonData.Description+'\', \''+jsonData.DateOfFirstUse+'\', \''+jsonData.ExpiryDate+'\', \''+jsonData.InitialPatientName+'\', \''+jsonData.InitialPatientSurName+'\', '+jsonData.Age+', \''+jsonData.Gender+'\', '+jsonData.QtyOfProductsConcerned+', \''+jsonData.NameOfCompliant+'\', \''+jsonData.DefectDescription+'\', '+jsonData.IsComplaintSampleAvailable+', \''+jsonData.ExpectedDateOfSampleReceived+'\', '+jsonData.HasResponseBeenRequested+', '+jsonData.IsPatientFamiliarWithDeviceUsage+', \''+jsonData.SinceWhenPatientUseThisDevice+'\', '+jsonData.IsDevicePhysicallyDamaged+', \''+jsonData.Where+'\', '+jsonData.DamageDuetoAccidentalFall+', \''+jsonData.FromWhichHeightOccuredtheFall+'\', '+jsonData.IsDefectedDuetomisusebypatient+', \''+jsonData.Whichkindofmisuse+'\', '+jsonData.IsSomethingstuckinsidedevice+', \''+jsonData.WhatStuckinside+'\', '+jsonData.Adverseeventassociatedtodefect+', \''+jsonData.Adverseeventassociatedwithdefect+'\', \''+jsonData.OtherInformation+'\', '+jsonData.Isproductcartridgestuckedindevice+', '+jsonData.Isreplacementofproductrequested+', \''+jsonData.Subject+'\',\''+jsonData.Priority+'\',\''+jsonData.Status+'\','+jsonData.userid+',\''+jsonData.username+'\') RETURNING id';
        
        
        'INSERT INTO salesforce.Case (FMA_DeviceName__c, FMA_Dosage__c, FMA_DosageForm__c, FMA_BatchSerialnumber__c, Description,    FMA_Dateoffirstuse__c, FMA_Expirydate__c, FMA_Initialpatientname__c, FMA_Initialpatientsurname__c, FMA_Age__c, FMA_Gender__c, FMA_Quantityofproductsconcerned__c, FMA_NameofComplainant__c, FMA_Defectdescription__c, FMA_Isthecomplaintsampleavailable__c, FMA_Expecteddateofsamplereceived__c, FMA_Hasresponsebeenrequested__c, FMA_Ispatientfamiliarwithdeviceusage__c, FMA_Sincewhendoespatientusethiskind__c, FMA_Isthedevicephysicallydamaged__c, FMA_where__c, FMA_Thedamageisduetoanaccidentalfall__c, FMA_Fromwhichheightisoccurredhefall__c, FMA_Isthedefectduetoamisusebypatient__c, FMA_whichkindofmisuse__c, FMA_Issomethingstuckinsidethedevice__c, FMA_whatstuckinside__c, FMA_Adverseeventassociatedtodefect__c, FMA_Adverseeventassociatedwithdefect__c, FMA_OtherInformation__c, FMA_Isproductcartridgestuckedindevice__c, FMA_Isreplacementofproductrequested__c, Subject, Priority, Status,fma_loginuserid__c,fma_feedbackcreator__c) VALUES (\''+jsonData.DeviceName+'\', \''+jsonData.Dosage+'\', \''+jsonData.DosageForm+'\', \''+jsonData.BatchSerialNbr+'\', \''+jsonData.Description+'\', \''+jsonData.DateOfFirstUse+'\', \''+jsonData.ExpiryDate+'\', \''+jsonData.InitialPatientName+'\', \''+jsonData.InitialPatientSurName+'\', '+jsonData.Age+', \''+jsonData.Gender+'\', '+jsonData.QtyOfProductsConcerned+', \''+jsonData.NameOfCompliant+'\', \''+jsonData.DefectDescription+'\', '+jsonData.IsComplaintSampleAvailable+', \''+jsonData.ExpectedDateOfSampleReceived+'\', '+jsonData.HasResponseBeenRequested+', '+jsonData.IsPatientFamiliarWithDeviceUsage+', \''+jsonData.SinceWhenPatientUseThisDevice+'\', '+jsonData.IsDevicePhysicallyDamaged+', \''+jsonData.Where+'\', '+jsonData.DamageDuetoAccidentalFall+', \''+jsonData.FromWhichHeightOccuredtheFall+'\', '+jsonData.IsDefectedDuetomisusebypatient+', \''+jsonData.Whichkindofmisuse+'\', '+jsonData.IsSomethingstuckinsidedevice+', \''+jsonData.WhatStuckinside+'\', '+jsonData.Adverseeventassociatedtodefect+', \''+jsonData.Adverseeventassociatedwithdefect+'\', \''+jsonData.OtherInformation+'\', '+jsonData.Isproductcartridgestuckedindevice+', '+jsonData.Isreplacementofproductrequested+', \''+jsonData.Subject+'\',\''+jsonData.Priority+'\',\''+jsonData.Status+'\','+jsonData.userid+',\''+jsonData.username+'\') RETURNING id'
        */
        
        var formattedData='INSERT INTO salesforce.Case (FMA_DeviceName__c, FMA_Dosage__c, FMA_DosageForm__c, FMA_BatchSerialnumber__c, Description,    FMA_Dateoffirstuse__c, FMA_Expirydate__c, FMA_Initialpatientname__c, FMA_Initialpatientsurname__c, FMA_Age__c, FMA_Gender__c, FMA_Quantityofproductsconcerned__c, FMA_NameofComplainant__c, FMA_Defectdescription__c, FMA_Isthecomplaintsampleavailable__c, FMA_Expecteddateofsamplereceived__c, FMA_Hasresponsebeenrequested__c, FMA_Ispatientfamiliarwithdeviceusage__c, FMA_Sincewhendoespatientusethiskind__c, FMA_Isthedevicephysicallydamaged__c, FMA_where__c, FMA_Thedamageisduetoanaccidentalfall__c, FMA_Fromwhichheightisoccurredhefall__c, FMA_Isthedefectduetoamisusebypatient__c, FMA_whichkindofmisuse__c, FMA_Issomethingstuckinsidethedevice__c, FMA_whatstuckinside__c, FMA_Adverseeventassociatedtodefect__c, FMA_Adverseeventassociatedwithdefect__c, FMA_OtherInformation__c, FMA_Isproductcartridgestuckedindevice__c, FMA_Isreplacementofproductrequested__c, Subject, Priority, Status,fma_loginuserid__c,fma_feedbackcreator__c) VALUES (\''+jsonData.DeviceName+'\', \''+jsonData.Dosage+'\', \''+jsonData.DosageForm+'\', \''+jsonData.BatchSerialNbr+'\', \''+jsonData.Description+'\', '+jsonData.DateOfFirstUse+', \''+jsonData.ExpiryDate+'\', \''+jsonData.InitialPatientName+'\', \''+jsonData.InitialPatientSurName+'\', '+jsonData.Age+', \''+jsonData.Gender+'\', '+jsonData.QtyOfProductsConcerned+', \''+jsonData.NameOfCompliant+'\', \''+jsonData.DefectDescription+'\', '+jsonData.IsComplaintSampleAvailable+', \''+jsonData.ExpectedDateOfSampleReceived+'\', '+jsonData.HasResponseBeenRequested+', '+jsonData.IsPatientFamiliarWithDeviceUsage+', \''+jsonData.SinceWhenPatientUseThisDevice+'\', '+jsonData.IsDevicePhysicallyDamaged+', \''+jsonData.Where+'\', '+jsonData.DamageDuetoAccidentalFall+', \''+jsonData.FromWhichHeightOccuredtheFall+'\', '+jsonData.IsDefectedDuetomisusebypatient+', \''+jsonData.Whichkindofmisuse+'\', '+jsonData.IsSomethingstuckinsidedevice+', \''+jsonData.WhatStuckinside+'\', '+jsonData.Adverseeventassociatedtodefect+', \''+jsonData.Adverseeventassociatedwithdefect+'\', \''+jsonData.OtherInformation+'\', '+jsonData.Isproductcartridgestuckedindevice+', '+jsonData.Isreplacementofproductrequested+', \''+jsonData.Subject+'\',\''+jsonData.Priority+'\',\''+jsonData.Status+'\','+jsonData.userid+',\''+jsonData.username+'\') RETURNING id';


         console.log(formattedData);
        
        conn.query('INSERT INTO salesforce.Case (FMA_DeviceName__c, FMA_Dosage__c, FMA_DosageForm__c, FMA_BatchSerialnumber__c, Description,    FMA_Dateoffirstuse__c, FMA_Expirydate__c, FMA_Initialpatientname__c, FMA_Initialpatientsurname__c, FMA_Age__c, FMA_Gender__c, FMA_Quantityofproductsconcerned__c, FMA_NameofComplainant__c, FMA_Defectdescription__c, FMA_Isthecomplaintsampleavailable__c, FMA_Expecteddateofsamplereceived__c, FMA_Hasresponsebeenrequested__c, FMA_Ispatientfamiliarwithdeviceusage__c, FMA_Sincewhendoespatientusethiskind__c, FMA_Isthedevicephysicallydamaged__c, FMA_where__c, FMA_Thedamageisduetoanaccidentalfall__c, FMA_Fromwhichheightisoccurredhefall__c, FMA_Isthedefectduetoamisusebypatient__c, FMA_whichkindofmisuse__c, FMA_Issomethingstuckinsidethedevice__c, FMA_whatstuckinside__c, FMA_Adverseeventassociatedtodefect__c, FMA_Adverseeventassociatedwithdefect__c, FMA_OtherInformation__c, FMA_Isproductcartridgestuckedindevice__c, FMA_Isreplacementofproductrequested__c, Subject, Priority, Status,fma_loginuserid__c,fma_feedbackcreator__c) VALUES (\''+jsonData.DeviceName+'\', \''+jsonData.Dosage+'\', \''+jsonData.DosageForm+'\', \''+jsonData.BatchSerialNbr+'\', \''+jsonData.Description+'\', '+jsonData.DateOfFirstUse+', \''+jsonData.ExpiryDate+'\', \''+jsonData.InitialPatientName+'\', \''+jsonData.InitialPatientSurName+'\', '+jsonData.Age+', \''+jsonData.Gender+'\', '+jsonData.QtyOfProductsConcerned+', \''+jsonData.NameOfCompliant+'\', \''+jsonData.DefectDescription+'\', '+jsonData.IsComplaintSampleAvailable+', \''+jsonData.ExpectedDateOfSampleReceived+'\', '+jsonData.HasResponseBeenRequested+', '+jsonData.IsPatientFamiliarWithDeviceUsage+', \''+jsonData.SinceWhenPatientUseThisDevice+'\', '+jsonData.IsDevicePhysicallyDamaged+', \''+jsonData.Where+'\', '+jsonData.DamageDuetoAccidentalFall+', \''+jsonData.FromWhichHeightOccuredtheFall+'\', '+jsonData.IsDefectedDuetomisusebypatient+', \''+jsonData.Whichkindofmisuse+'\', '+jsonData.IsSomethingstuckinsidedevice+', \''+jsonData.WhatStuckinside+'\', '+jsonData.Adverseeventassociatedtodefect+', \''+jsonData.Adverseeventassociatedwithdefect+'\', \''+jsonData.OtherInformation+'\', '+jsonData.Isproductcartridgestuckedindevice+', '+jsonData.Isreplacementofproductrequested+', \''+jsonData.Subject+'\',\''+jsonData.Priority+'\',\''+jsonData.Status+'\','+jsonData.userid+',\''+jsonData.username+'\') RETURNING id',
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
                            res.json({
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
            'SELECT *FROM caseattachment WHERE id = '+imageid+'',
            function(err,result){
                done();
                if (err != null || result.rowCount == 0) {
                   res.json({
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