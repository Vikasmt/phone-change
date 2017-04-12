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

router.post('/insertPowerFailure', function(req, res) {
    console.log('............insertPowerFailure...............');
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    console.log('Body:'+data);
    
    var splitteddata=data.replace("{","").replace("}","").split(',');
    
    var caseid = splitteddata[0];
	
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        
        console.log(req.body);
        var jsonData = req.body;
        var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
        var valuesData=' VALUES ('; 
	    
    if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0)
        { insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ','; }
	    
    if (jsonData.IsTheNoPowerIssueObserved !== undefined && jsonData.IsTheNoPowerIssueObserved !== null && jsonData.IsTheNoPowerIssueObserved !== "null" && jsonData.IsTheNoPowerIssueObserved.length > 0)
        { insertQueryData += 'PF_NP_Isthenopowerissueobserved__c,'; valuesData += '\'' + jsonData.IsTheNoPowerIssueObserved + '\'' + ','; }
	
    if (jsonData.IsSomethingDisplayedOnDevice !== undefined && jsonData.IsSomethingDisplayedOnDevice !== null && jsonData.IsSomethingDisplayedOnDevice !== "null" && jsonData.IsSomethingDisplayedOnDevice.length > 0)
        { insertQueryData += 'PF_NP_Issomethingdisplayedondevice__c,'; valuesData += '\'' + jsonData.IsSomethingDisplayedOnDevice + '\'' + ','; }
	    
    if (jsonData.IsSomethingDisplayedOnDeiviceIfyes !== undefined && jsonData.IsSomethingDisplayedOnDeiviceIfyes !== null && jsonData.IsSomethingDisplayedOnDeiviceIfyes !== "null" && jsonData.IsSomethingDisplayedOnDeiviceIfyes.length > 0)
       { insertQueryData += 'PF_NP_IssomethingdisplayedondeiviceIfyes__c,'; valuesData += '\'' + jsonData.IsSomethingDisplayedOnDeiviceIfyes + '\'' + ','; }
	    
    if (jsonData.DoesTheInjectionButtonShowRedLight !== undefined && jsonData.DoesTheInjectionButtonShowRedLight !== null && jsonData.DoesTheInjectionButtonShowRedLight !== "null" && jsonData.DoesTheInjectionButtonShowRedLight.length > 0)
        { insertQueryData += 'PF_NP_Doestheinjectionbuttonshowredlight__c,'; valuesData += '\'' + jsonData.DoesTheInjectionButtonShowRedLight + '\'' + ','; }
	    
    if (jsonData.HasTheDeviceImpactedByColdOrHumid !== undefined && jsonData.HasTheDeviceImpactedByColdOrHumid !== null && jsonData.HasTheDeviceImpactedByColdOrHumid !== "null" && jsonData.HasTheDeviceImpactedByColdOrHumid.length > 0)
        { insertQueryData += 'PF_NP_Hasthedeviceimpactedbycoldorhumid__c,'; valuesData += '\'' + jsonData.HasTheDeviceImpactedByColdOrHumid + '\'' + ','; }
		
    if (jsonData.NPSpecify !== undefined && jsonData.NPSpecify !== null && jsonData.NPSpecify !== "null" && jsonData.NPSpecify.length > 0)
        { insertQueryData += 'PF_NP_Specify__c,'; valuesData += '\'' + jsonData.NPSpecify + '\'' + ','; }
	    
    if (jsonData.IsInsertedBatterySpecification !== undefined && jsonData.IsInsertedBatterySpecification !== null && jsonData.IsInsertedBatterySpecification !== "null" && jsonData.IsInsertedBatterySpecification.length > 0)
        { insertQueryData += 'PF_NP_Isinsertedbatteryspecification__c,'; valuesData += '\'' + jsonData.IsInsertedBatterySpecification + '\'' + ','; }
	
    if (jsonData.IsTheBatteryCoverDamaged !== undefined && jsonData.IsTheBatteryCoverDamaged !== null && jsonData.IsTheBatteryCoverDamaged !== "null" && jsonData.IsTheBatteryCoverDamaged.length > 0)
        { insertQueryData += 'PF_NP_Isthebatterycoverdamaged__c,'; valuesData += '\'' + jsonData.IsTheBatteryCoverDamaged + '\'' + ','; }
	    
    if (jsonData.Sometimes !== undefined && jsonData.Sometimes !== null && jsonData.Sometimes !== "null" && jsonData.Sometimes.length > 0)
       { insertQueryData += 'PF_NP_Sometimes__c,'; valuesData += '\'' + jsonData.Sometimes + '\'' + ','; }
	    
    if (jsonData.NPFrequency !== undefined && jsonData.NPFrequency !== null && jsonData.NPFrequency !== "null" && jsonData.NPFrequency.length > 0)
        { insertQueryData += 'PF_NP_Frequency__c,'; valuesData += '\'' + jsonData.NPFrequency + '\'' + ','; }
	    
    if (jsonData.STWhenWasLasttimeIssueObserved !== undefined && jsonData.STWhenWasLasttimeIssueObserved !== null && jsonData.STWhenWasLasttimeIssueObserved !== "null" && jsonData.STWhenWasLasttimeIssueObserved.length > 0)
        { insertQueryData += 'PF_NP_ST_Whenwaslasttimeissueobserved__c,'; valuesData += '\'' + jsonData.STWhenWasLasttimeIssueObserved + '\'' + ','; }
		
    if (jsonData.STIsSomethingDisplayedOnDevice !== undefined && jsonData.STIsSomethingDisplayedOnDevice !== null && jsonData.STIsSomethingDisplayedOnDevice !== "null" && jsonData.STIsSomethingDisplayedOnDevice.length > 0)
        { insertQueryData += 'PF_NP_ST_Issomethingdisplayedondevice__c,'; valuesData += '\'' + jsonData.STIsSomethingDisplayedOnDevice + '\'' + ','; }
	    
    if (jsonData.STIsSomethingDisplayedOnDeiviceIfyes !== undefined && jsonData.STIsSomethingDisplayedOnDeiviceIfyes !== null && jsonData.STIsSomethingDisplayedOnDeiviceIfyes !== "null" && jsonData.STIsSomethingDisplayedOnDeiviceIfyes.length > 0)
        { insertQueryData += 'PF_NP_ST_IssomethingdisplayondeiviceIfY__c,'; valuesData += '\'' + jsonData.STIsSomethingDisplayedOnDeiviceIfyes + '\'' + ','; }
	
    if (jsonData.STHasTheDeviceImpactedByColdorHumid !== undefined && jsonData.STHasTheDeviceImpactedByColdorHumid !== null && jsonData.STHasTheDeviceImpactedByColdorHumid !== "null" && jsonData.STHasTheDeviceImpactedByColdorHumid.length > 0)
        { insertQueryData += 'PF_NP_ST_Hasdeviceimpactedbycoldorhumid__c,'; valuesData += '\'' + jsonData.STHasTheDeviceImpactedByColdorHumid + '\'' + ','; }
	    
    if (jsonData.STSpecify !== undefined && jsonData.STSpecify !== null && jsonData.STSpecify !== "null" && jsonData.STSpecify.length > 0)
       { insertQueryData += 'PF_NP_ST_Specify__c,'; valuesData += '\'' + jsonData.STSpecify + '\'' + ','; }
	    
    if (jsonData.STIsInsertedBatterySpecification !== undefined && jsonData.STIsInsertedBatterySpecification !== null && jsonData.STIsInsertedBatterySpecification !== "null" && jsonData.STIsInsertedBatterySpecification.length > 0)
        { insertQueryData += 'PF_NP_ST_Isinsertedbatteryspecification__c,'; valuesData += '\'' + jsonData.STIsInsertedBatterySpecification + '\'' + ','; }
	    
    if (jsonData.STIsTheBatteryCoverDamaged !== undefined && jsonData.STIsTheBatteryCoverDamaged !== null && jsonData.STIsTheBatteryCoverDamaged !== "null" && jsonData.STIsTheBatteryCoverDamaged.length > 0)
        { insertQueryData += 'PF_NP_ST_Isthebatterycoverdamaged__c,'; valuesData += '\'' + jsonData.STIsTheBatteryCoverDamaged + '\'' + ','; }
		
		//Power failure - power off
		
    if (jsonData.PleaseSpecifyInjectionProcess !== undefined && jsonData.PleaseSpecifyInjectionProcess !== null && jsonData.PleaseSpecifyInjectionProcess !== "null" && jsonData.PleaseSpecifyInjectionProcess.length > 0)
        { insertQueryData += 'PF_PO_Pleasespecifyinjectionprocess__c,'; valuesData += '\'' + jsonData.PleaseSpecifyInjectionProcess + '\'' + ','; }
	
    if (jsonData.DoesTheDeviceStillTurnOn !== undefined && jsonData.DoesTheDeviceStillTurnOn !== null && jsonData.DoesTheDeviceStillTurnOn !== "null" && jsonData.DoesTheDeviceStillTurnOn.length > 0)
        { insertQueryData += 'PF_PO_Doesthedevicestillturnon__c,'; valuesData += '\'' + jsonData.DoesTheDeviceStillTurnOn + '\'' + ','; }
	    
    if (jsonData.HasaWarningMessageBeenDisplayed !== undefined && jsonData.HasaWarningMessageBeenDisplayed !== null && jsonData.HasaWarningMessageBeenDisplayed !== "null" && jsonData.HasaWarningMessageBeenDisplayed.length > 0)
       { insertQueryData += 'PF_PO_Hasawarningmessagebeendisplayed__c,'; valuesData += '\'' + jsonData.HasaWarningMessageBeenDisplayed + '\'' + ','; }
	    
    if (jsonData.PleaseSpecify !== undefined && jsonData.PleaseSpecify !== null && jsonData.PleaseSpecify !== "null" && jsonData.PleaseSpecify.length > 0)
        { insertQueryData += 'PF_PO_Pleasespecify__c,'; valuesData += '\'' + jsonData.PleaseSpecify + '\'' + ','; }
	    
    if (jsonData.PowerOffisAreCurrentFailureObserved !== undefined && jsonData.PowerOffisAreCurrentFailureObserved !== null && jsonData.PowerOffisAreCurrentFailureObserved !== "null" && jsonData.HasTheDeviceImpactedByColdOrHumid.length > 0)
        { insertQueryData += 'PF_PO_Poweroffisarecurrentfailureobserve__c,'; valuesData += '\'' + jsonData.PowerOffisAreCurrentFailureObserved + '\'' + ','; }
		
    if (jsonData.ProvideFrequency !== undefined && jsonData.ProvideFrequency !== null && jsonData.ProvideFrequency !== "null" && jsonData.ProvideFrequency.length > 0)
        { insertQueryData += 'PF_PO_Providefrequency__c,'; valuesData += '\'' + jsonData.ProvideFrequency + '\'' + ','; }
	    
    if (jsonData.DoesDevicePowersoffWithSmallShocks !== undefined && jsonData.DoesDevicePowersoffWithSmallShocks !== null && jsonData.DoesDevicePowersoffWithSmallShocks !== "null" && jsonData.DoesDevicePowersoffWithSmallShocks.length > 0)
        { insertQueryData += 'PF_PO_Doesdevicepowersoffwithsmallshocks__c,'; valuesData += '\'' + jsonData.DoesDevicePowersoffWithSmallShocks + '\'' + ','; }
	
    if (jsonData.HasUserTrytoRemoveandReinsertBattery !== undefined && jsonData.HasUserTrytoRemoveandReinsertBattery !== null && jsonData.HasUserTrytoRemoveandReinsertBattery !== "null" && jsonData.HasUserTrytoRemoveandReinsertBattery.length > 0)
        { insertQueryData += 'PF_PO_Hasusertrytoremoveandreinsertbatte__c,'; valuesData += '\'' + jsonData.IsTheBatteryCoverDamaged + '\'' + ','; }
	    
    if (jsonData.NoPower !== undefined && jsonData.NoPower !== null && jsonData.NoPower !== "null" && jsonData.NoPower.length > 0)
       { insertQueryData += 'PF_PO_Nopower,'; valuesData += '\'' + jsonData.NoPower + '\'' + ','; }
	    
		
	// power failure - No power off
	
    if (jsonData.DeviceBlckedPreventingToBeTurnoff !== undefined && jsonData.DeviceBlckedPreventingToBeTurnoff !== null && jsonData.DeviceBlckedPreventingToBeTurnoff !== "null" && jsonData.DeviceBlckedPreventingToBeTurnoff.length > 0)
        { insertQueryData += 'PF_NPO_DeviceBlckedPreventingToBeTurnoff__c,'; valuesData += '\'' + jsonData.DeviceBlckedPreventingToBeTurnoff + '\'' + ','; }
	
    if (jsonData.WarningMessage !== undefined && jsonData.WarningMessage !== null && jsonData.WarningMessage !== "null" && jsonData.WarningMessage.length > 0)
        { insertQueryData += 'PF_NPO_WarningMessage__c,'; valuesData += '\'' + jsonData.WarningMessage + '\'' + ','; }
	    
    if (jsonData.NopoweroffIssueDisplydAtWhatStep !== undefined && jsonData.NopoweroffIssueDisplydAtWhatStep !== null && jsonData.NopoweroffIssueDisplydAtWhatStep !== "null" && jsonData.NopoweroffIssueDisplydAtWhatStep.length > 0)
       { insertQueryData += 'PF_NPO_NopoweroffIssueDisplydAtWhatStep__c,'; valuesData += '\'' + jsonData.NopoweroffIssueDisplydAtWhatStep + '\'' + ','; }
	    
    if (jsonData.PleaseSpecifyInjectionStep !== undefined && jsonData.PleaseSpecifyInjectionStep !== null && jsonData.PleaseSpecifyInjectionStep !== "null" && jsonData.PleaseSpecifyInjectionStep.length > 0)
        { insertQueryData += 'PF_NPO_PleaseSpecifyInjectionStep__c,'; valuesData += '\'' + jsonData.PleaseSpecifyInjectionStep + '\'' + ','; }
	    
    if (jsonData.NeedToRemoveBateryToTurnoffDevice !== undefined && jsonData.NeedToRemoveBateryToTurnoffDevice !== null && jsonData.NeedToRemoveBateryToTurnoffDevice !== "null" && jsonData.NeedToRemoveBateryToTurnoffDevice.length > 0)
        { insertQueryData += 'PF_NPO_NeedToRemoveBateryToTurnoffDevice__c,'; valuesData += '\'' + jsonData.NeedToRemoveBateryToTurnoffDevice + '\'' + ','; }
		
     if (jsonData.IsSomethingStuckInsideTheDevice !== undefined && jsonData.IsSomethingStuckInsideTheDevice !== null && jsonData.IsSomethingStuckInsideTheDevice !== "null" && jsonData.IsSomethingStuckInsideTheDevice.length > 0)
        { insertQueryData += 'PF_NPO_IsSomethingStuckInsideTheDevice__c,'; valuesData += '\'' + jsonData.IsSomethingStuckInsideTheDevice + '\'' + ','; }
	    
    if (jsonData.NPOSpecify !== undefined && jsonData.Specify !== null && jsonData.NPOSpecify !== "null" && jsonData.NPOSpecify.length > 0)
        { insertQueryData += 'PF_NPO_Specify__c,'; valuesData += '\'' + jsonData.NPOSpecify + '\'' + ','; }
	
    if (jsonData.IsItARecurrentFailure !== undefined && jsonData.IsItARecurrentFailure !== null && jsonData.IsItARecurrentFailure !== "null" && jsonData.IsItARecurrentFailure.length > 0)
        { insertQueryData += 'PF_NPO_IsItARecurrentFailure__c,'; valuesData += '\'' + jsonData.IsItARecurrentFailure + '\'' + ','; }
	    
    if (jsonData.NPOFrequency !== undefined && jsonData.NPOFrequency !== null && jsonData.NPOFrequency !== "null" && jsonData.Frequency.length > 0)
       { insertQueryData += 'PF_NPO_Frequency__c,'; valuesData += '\'' + jsonData.NPOFrequency + '\'' + ','; }
	   
	if (jsonData.TheLastNoPowerOffIssueObserved !== undefined && jsonData.TheLastNoPowerOffIssueObserved !== null && jsonData.TheLastNoPowerOffIssueObserved !== "null" && jsonData.TheLastNoPowerOffIssueObserved.length > 0)
       { insertQueryData += 'PF_NPO_TheLastNoPowerOffIssueObserved__c,'; valuesData += '\'' + jsonData.TheLastNoPowerOffIssueObserved + '\'' + ','; }
	   
     // power failure - Battery consumption   
	
    if (jsonData.BatteryConsumption !== undefined && jsonData.BatteryConsumption !== null && jsonData.BatteryConsumption !== "null" && jsonData.BatteryConsumption.length > 0)
        { insertQueryData += 'PF_BatteryConsumption__c,'; valuesData += '\'' + jsonData.BatteryConsumption + '\'' + ','; }
	
    if (jsonData.WhenWasTheBatteryInserted !== undefined && jsonData.WhenWasTheBatteryInserted !== null && jsonData.WhenWasTheBatteryInserted !== "null" && jsonData.WhenWasTheBatteryInserted.length > 0)
        { insertQueryData += 'PF_BC_WhenWasTheBatteryInserted__c,'; valuesData += '\'' + jsonData.WhenWasTheBatteryInserted + '\'' + ','; }
	    
    if (jsonData.WhenWasTheBatteryDischarged !== undefined && jsonData.WhenWasTheBatteryDischarged !== null && jsonData.WhenWasTheBatteryDischarged !== "null" && jsonData.WhenWasTheBatteryDischarged.length > 0)
       { insertQueryData += 'PF_BC_WhenWasTheBatteryDischarged__c,'; valuesData += '\'' + jsonData.WhenWasTheBatteryDischarged + '\'' + ','; }
	    
    if (jsonData.IsAWarningMessageDisplayed !== undefined && jsonData.IsAWarningMessageDisplayed !== null && jsonData.IsAWarningMessageDisplayed !== "null" && jsonData.IsAWarningMessageDisplayed.length > 0)
        { insertQueryData += 'PF_BC_IsAWarningMessageDisplayed__c,'; valuesData += '\'' + jsonData.IsAWarningMessageDisplayed + '\'' + ','; }
	    
    if (jsonData.BCWarningMessage !== undefined && jsonData.BCWarningMessage !== null && jsonData.BCWarningMessage !== "null" && jsonData.BCWarningMessage.length > 0)
        { insertQueryData += 'PF_BC_WarningMessage__c,'; valuesData += '\'' + jsonData.BCWarningMessage + '\'' + ','; }
		
     if (jsonData.HasTheFailureBeenFrequentlyObservd !== undefined && jsonData.HasTheFailureBeenFrequentlyObservd !== null && jsonData.HasTheFailureBeenFrequentlyObservd !== "null" && jsonData.HasTheFailureBeenFrequentlyObservd.length > 0)
        { insertQueryData += 'PF_BC_HasTheFailureBeenFrequentlyObservd__c,'; valuesData += '\'' + jsonData.HasTheFailureBeenFrequentlyObservd + '\'' + ','; }
	    
    if (jsonData.PleaseProvideFrequency !== undefined && jsonData.PleaseProvideFrequency !== null && jsonData.PleaseProvideFrequency !== "null" && jsonData.PleaseProvideFrequency.length > 0)
        { insertQueryData += 'PF_BC_PleaseProvideFrequency__c,'; valuesData += '\'' + jsonData.PleaseProvideFrequency + '\'' + ','; }
	
    // caseid insertion
    if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0)
        { insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\''}

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
var caseid = req.param('id');
	
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



router.post('/insertNeedleIssue', function(req, res) {
    console.log('............insertDecisiontree...............');
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    console.log('Body:'+data);
    
    var splitteddata=data.replace("{","").replace("}","").split(',');
    
    var caseid = splitteddata[0];
	
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        
        console.log(req.body);
        var jsonData = req.body;
        var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
        var valuesData=' VALUES ('; 
	    
    if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0)
        { insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ','; }
	    
    if (jsonData.NeedleIssue !== undefined && jsonData.NeedleIssue !== null && jsonData.NeedleIssue !== "null" && jsonData.NeedleIssue.length > 0)
        { insertQueryData += 'NI_NeedleIssue__c,'; valuesData += '\'' + jsonData.NeedleIssue + '\'' + ','; }
	
    if (jsonData.NeedleBatchNumber !== undefined && jsonData.NeedleBatchNumber !== null && jsonData.NeedleBatchNumber !== "null" && jsonData.NeedleBatchNumber.length > 0)
        { insertQueryData += 'NI_NeedleBatchNumber__c,'; valuesData += '\'' + jsonData.NeedleBatchNumber + '\'' + ','; }
	    
    if (jsonData.NeedleAttachmentDetachment !== undefined && jsonData.NeedleAttachmentDetachment !== null && jsonData.NeedleAttachmentDetachment !== "null" && jsonData.NeedleAttachmentDetachment.length > 0)
       { insertQueryData += 'NI_NeedleAttachmentDetachment__c,'; valuesData += '\'' + jsonData.NeedleAttachmentDetachment + '\'' + ','; }
	    
    if (jsonData.NeedleWarningMessage !== undefined && jsonData.NeedleWarningMessage !== null && jsonData.NeedleWarningMessage !== "null" && jsonData.NeedleWarningMessage.length > 0)
        { insertQueryData += 'NI_Needlewarningmessage__c,'; valuesData += '\'' + jsonData.NeedleWarningMessage + '\'' + ','; }
	    
    if (jsonData.OtherNeedleIssue !== undefined && jsonData.OtherNeedleIssue !== null && jsonData.OtherNeedleIssue !== "null" && jsonData.OtherNeedleIssue.length > 0)
        { insertQueryData += 'NI_OtherNeedleIssue__c,'; valuesData += '\'' + jsonData.OtherNeedleIssue + '\'' + ','; }
	
	// Needle warning message - Needle warning message selection
	
        if (jsonData.NeedleWarningMessageSelection !== undefined && jsonData.NeedleWarningMessageSelection !== null && jsonData.NeedleWarningMessageSelection !== "null" && jsonData.NeedleWarningMessageSelection.length > 0)
        { insertQueryData += 'NW_NeedleWarningMessageSelection__c,'; valuesData += '\'' + jsonData.NeedleWarningMessageSelection + '\'' + ','; }
	    
	if (jsonData.IsWarningmsgDisplayedWhenNedleAttd !== undefined && jsonData.IsWarningmsgDisplayedWhenNedleAttd !== null && jsonData.IsWarningmsgDisplayedWhenNedleAttd !== "null" && jsonData.IsWarningmsgDisplayedWhenNedleAttd.length > 0)
        { insertQueryData += 'NW_IsWarningmsgDisplayedWhenNedleAttd__c,'; valuesData += '\'' + jsonData.IsWarningmsgDisplayedWhenNedleAttd + '\'' + ','; }
	    
        if (jsonData.NeedleIsTheInjectionStillPossible !== undefined && jsonData.NeedleIsTheInjectionStillPossible !== null && jsonData.NeedleIsTheInjectionStillPossible !== "null" && jsonData.NeedleIsTheInjectionStillPossible.length > 0)
        { insertQueryData += 'NW_NeedleIstheinjectionstillpossible__c,'; valuesData += '\'' + jsonData.NeedleIsTheInjectionStillPossible + '\'' + ','; }
	   	
	if (jsonData.MessageDisplayByInterruptingTheInje !== undefined && jsonData.MessageDisplayByInterruptingTheInje !== null && jsonData.MessageDisplayByInterruptingTheInje !== "null" && jsonData.MessageDisplayByInterruptingTheInje.length > 0)
        { insertQueryData += 'NW_MessageDisplayByInterruptingTheInje__c,'; valuesData += '\'' + jsonData.MessageDisplayByInterruptingTheInje + '\'' + ','; }   
		
	if (jsonData.NeedleCapDeviceWarningMsgUponStart !== undefined && jsonData.NeedleCapDeviceWarningMsgUponStart !== null && jsonData.NeedleCapDeviceWarningMsgUponStart !== "null" && jsonData.NeedleCapDeviceWarningMsgUponStart.length > 0)
        { insertQueryData += 'NW_NeedleCapDeviceWarningMsgUponStart__c,'; valuesData += '\'' + jsonData.NeedleCapDeviceWarningMsgUponStart + '\'' + ','; }
	    
	if (jsonData.NeedleCapIsInjectionStillPossible !== undefined && jsonData.NeedleCapIsInjectionStillPossible !== null && jsonData.NeedleCapIsInjectionStillPossible !== "null" && jsonData.NeedleCapIsInjectionStillPossible.length > 0)
        { insertQueryData += 'NW_NeedleCapIsInjectionStillPossible__c,'; valuesData += '\'' + jsonData.NeedleCapIsInjectionStillPossible + '\'' + ','; }    
	    
        if (jsonData.DoesNeedleCavityShowResidue !== undefined && jsonData.DoesNeedleCavityShowResidue !== null && jsonData.DoesNeedleCavityShowResidue !== "null" && jsonData.DoesNeedleCavityShowResidue.length > 0)
        { insertQueryData += 'NW_DoesNeedleCavityShowResidue__c,'; valuesData += '\'' + jsonData.DoesNeedleCavityShowResidue + '\'' + ','; }
	    
	if (jsonData.NeedleDetatcDeviceWarningMsguponStart !== undefined && jsonData.NeedleDetatcDeviceWarningMsguponStart !== null && jsonData.NeedleDetatcDeviceWarningMsguponStart !== "null" && jsonData.NeedleDetatcDeviceWarningMsguponStart.length > 0)
        { insertQueryData += 'NW_NeedleDetatcDeviceWarningMsguponStart__c,'; valuesData += '\'' + jsonData.NeedleDetatcDeviceWarningMsguponStart + '\'' + ','; }
	    
	if (jsonData.NeedleDetatchIsInjectionStillPossible !== undefined && jsonData.NeedleDetatchIsInjectionStillPossible !== null && jsonData.NeedleDetatchIsInjectionStillPossible !== "null" && jsonData.NeedleDetatchIsInjectionStillPossible.length > 0)
        { insertQueryData += 'NW_NeedleDetatchIsInjectionStillPossible__c,'; valuesData += '\'' + jsonData.NeedleDetatchIsInjectionStillPossible + '\'' + ','; }
	
	if (jsonData.IsNeedleStillAttachedtoCartridge !== undefined && jsonData.IsNeedleStillAttachedtoCartridge !== null && jsonData.IsNeedleStillAttachedtoCartridge !== "null" && jsonData.IsNeedleStillAttachedtoCartridge.length > 0)
        { insertQueryData += 'NW_IsNeedleStillAttachedtoCartridge__c,'; valuesData += '\'' + jsonData.IsNeedleStillAttachedtoCartridge + '\'' + ','; }
	   
        if (jsonData.IsNeedleStillAttachedtoCartridge !== undefined && jsonData.IsNeedleStillAttachedtoCartridge !== null && jsonData.IsNeedleStillAttachedtoCartridge !== "null" && jsonData.WarningMsgAfterNeedleDetatchment.length > 0)
        { insertQueryData += 'NW_Warningmsgafterneedledetatchment__c,'; valuesData += '\'' + jsonData.WarningMsgAfterNeedleDetatchment + '\'' + ','; }
	    
	 if (jsonData.NeedleButtonAfterNeedleDetatchment !== undefined && jsonData.NeedleButtonAfterNeedleDetatchment !== null && jsonData.NeedleButtonAfterNeedleDetatchment !== "null" && jsonData.NeedleButtonAfterNeedleDetatchment.length > 0)
        { insertQueryData += 'NW_Needlebuttonafterneedledetatchment__c,'; valuesData += '\'' + jsonData.NeedleButtonAfterNeedleDetatchment + '\'' + ','; }
	    
        if (jsonData.NeedleDetatchedByPushing !== undefined && jsonData.NeedleDetatchedByPushing !== null && jsonData.NeedleDetatchedByPushing !== "null" && jsonData.NeedleDetatchedByPushing.length > 0)
        { insertQueryData += 'NW_NeedleDetatchedByPushing__c,'; valuesData += '\'' + jsonData.NeedleDetatchedByPushing + '\'' + ','; }
	    
	if (jsonData.DoestheNeedleButtonReact !== undefined && jsonData.DoestheNeedleButtonReact !== null && jsonData.DoestheNeedleButtonReact !== "null" && jsonData.DoestheNeedleButtonReact.length > 0)
        { insertQueryData += 'NW_DoestheNeedleButtonReact__c,'; valuesData += '\'' + jsonData.DoestheNeedleButtonReact + '\'' + ','; }

	if (jsonData.OtherWarningMessage !== undefined && jsonData.OtherWarningMessage !== null && jsonData.OtherWarningMessage !== "null" && jsonData.OtherWarningMessage.length > 0)
        { insertQueryData += 'NW_OtherWarningMessage__c,'; valuesData += '\'' + jsonData.OtherWarningMessage + '\'' + ','; }
	    
        if (jsonData.FrequencyoftheWMdiplay !== undefined && jsonData.FrequencyoftheWMdiplay !== null && jsonData.FrequencyoftheWMdiplay !== "null" && jsonData.FrequencyoftheWMdiplay.length > 0)
        { insertQueryData += 'NW_FrequencyoftheWMdiplay__c,'; valuesData += '\'' + jsonData.FrequencyoftheWMdiplay + '\'' + ','; }

	if (jsonData.WhenApproximatelyIssueObservedLastly !== undefined && jsonData.WhenApproximatelyIssueObservedLastly !== null && jsonData.WhenApproximatelyIssueObservedLastly !== "null" && jsonData.WhenApproximatelyIssueObservedLastly.length > 0)
        { insertQueryData += 'NW_WhenApproximatelyIssueObservedLastly__c,'; valuesData += '\'' + jsonData.WhenApproximatelyIssueObservedLastly + '\'' + ','; }

        if (jsonData.ApproximateDate !== undefined && jsonData.ApproximateDate !== null && jsonData.ApproximateDate !== "null" && jsonData.ApproximateDate.length > 0)
        { insertQueryData += 'NW_ApproximateDate__c,'; valuesData += '\'' + jsonData.ApproximateDate + '\'' + ','; }

	if (jsonData.WarngMsgDisplayedAtParticularStep !== undefined && jsonData.WarngMsgDisplayedAtParticularStep !== null && jsonData.WarngMsgDisplayedAtParticularStep !== "null" && jsonData.WarngMsgDisplayedAtParticularStep.length > 0)
        { insertQueryData += 'NW_WarngMsgDisplayedAtParticularStep__c,'; valuesData += '\'' + jsonData.WarngMsgDisplayedAtParticularStep + '\'' + ','; }
	    
	if (jsonData.PleaseSelectTheInjectionStep !== undefined && jsonData.PleaseSelectTheInjectionStep !== null && jsonData.PleaseSelectTheInjectionStep !== "null" && jsonData.PleaseSelectTheInjectionStep.length > 0)
        { insertQueryData += 'NW_PleaseSelectTheInjectionStep__c,'; valuesData += '\'' + jsonData.PleaseSelectTheInjectionStep + '\'' + ','; }

	if (jsonData.IsMsgDisplayedOnUseOfNewNdleBatc !== undefined && jsonData.IsMsgDisplayedOnUseOfNewNdleBatc !== null && jsonData.IsMsgDisplayedOnUseOfNewNdleBatc !== "null" && jsonData.IsMsgDisplayedOnUseOfNewNdleBatc.length > 0)
        { insertQueryData += 'NW_IsMsgDisplayedOnUseOfNewNdleBatc__c,'; valuesData += '\'' + jsonData.IsMsgDisplayedOnUseOfNewNdleBatc + '\'' + ','; }

	if (jsonData.PleaseProvideTheNeedleBatch !== undefined && jsonData.PleaseProvideTheNeedleBatch !== null && jsonData.PleaseProvideTheNeedleBatch !== "null" && jsonData.PleaseProvideTheNeedleBatch.length > 0)
        { insertQueryData += 'NW_PleaseProvideTheNeedleBatch__c,'; valuesData += '\'' + jsonData.PleaseProvideTheNeedleBatch + '\'' + ','; }

	if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0)
        { insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\''}

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

router.post('/insertDataandtransfer', function(req, res) {
    console.log('............insertDataandtransfer...............');
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    console.log('Body:'+data);
    
    var splitteddata=data.replace("{","").replace("}","").split(',');
    
    var caseid = splitteddata[0];
	
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        
        console.log(req.body);
        var jsonData = req.body;
        var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
        var valuesData=' VALUES (';   
	    
	if (jsonData.DecisionTreeIssueType !== undefined && jsonData.DecisionTreeIssueType !== null && jsonData.DecisionTreeIssueType !== "null" && jsonData.DecisionTreeIssueType.length > 0)
        { insertQueryData += 'DT_DecisionTreeIssueType__c,'; valuesData += '\'' + jsonData.DecisionTreeIssueType + '\'' + ','; }
	
	if (jsonData.DataAndTransfer !== undefined && jsonData.DataAndTransfer !== null && jsonData.DataAndTransfer !== "null" && jsonData.DataAndTransfer.length > 0)
        { insertQueryData += 'DT_Dataandtransfer__c,'; valuesData += '\'' + jsonData.DataAndTransfer + '\'' + ','; }
	    
	if (jsonData.InfoDisplayedByDeviceNotAccurate !== undefined && jsonData.InfoDisplayedByDeviceNotAccurate !== null && jsonData.InfoDisplayedByDeviceNotAccurate !== "null" && jsonData.InfoDisplayedByDeviceNotAccurate.length > 0)
        { insertQueryData += 'DT_InfoDisplayedByDeviceNotAccurate__c,'; valuesData += '\'' + jsonData.InfoDisplayedByDeviceNotAccurate + '\'' + ','; }
	    
	if (jsonData.InfoDisplayedByEdeviceIfYES !== undefined && jsonData.InfoDisplayedByEdeviceIfYES !== null && jsonData.InfoDisplayedByEdeviceIfYES !== "null" && jsonData.InfoDisplayedByEdeviceIfYES.length > 0)
        { insertQueryData += 'DT_InfodisplayedbyedeviceifYES__c,'; valuesData += '\'' + jsonData.InfoDisplayedByEdeviceIfYES + '\'' + ','; }
	    
        if (jsonData.DataTransferFromEdeviceToEasypod !== undefined && jsonData.DataTransferFromEdeviceToEasypod !== null && jsonData.DataTransferFromEdeviceToEasypod !== "null" && jsonData.DataTransferFromEdeviceToEasypod.length > 0)
        { insertQueryData += 'DT_DatatransferfromedevicetoEasypod__c,'; valuesData += '\'' + jsonData.DataTransferFromEdeviceToEasypod + '\'' + ','; }
	    
	if (jsonData.ProvideSerialNumberOfTransmitter !== undefined && jsonData.ProvideSerialNumberOfTransmitter !== null && jsonData.ProvideSerialNumberOfTransmitter !== "null" && jsonData.ProvideSerialNumberOfTransmitter.length > 0)
        { insertQueryData += 'DT_Provideserialnumberoftransmitter__c,'; valuesData += '\'' + jsonData.ProvideSerialNumberOfTransmitter + '\'' + ','; }
	    
	if (jsonData.WasUserAbleToPerformDataTransfer !== undefined && jsonData.WasUserAbleToPerformDataTransfer !== null && jsonData.WasUserAbleToPerformDataTransfer !== "null" && jsonData.WasUserAbleToPerformDataTransfer.length > 0)
        { insertQueryData += 'DT_Wasuserabletoperformdatatransfer__c,'; valuesData += '\'' + jsonData.WasUserAbleToPerformDataTransfer + '\'' + ','; }
	    
	if (jsonData.WasUserAbleToSeeUploadedData !== undefined && jsonData.WasUserAbleToSeeUploadedData !== null && jsonData.WasUserAbleToSeeUploadedData !== "null" && jsonData.WasUserAbleToSeeUploadedData.length > 0)
        { insertQueryData += 'DT_Wasuserabletoseeuploadeddata__c,'; valuesData += '\'' + jsonData.WasUserAbleToSeeUploadedData + '\'' + ','; }
	    
	if (jsonData.AreTheUploadedDataAccurate !== undefined && jsonData.AreTheUploadedDataAccurate !== null && jsonData.AreTheUploadedDataAccurate !== "null" && jsonData.AreTheUploadedDataAccurate.length > 0)
        { insertQueryData += 'DT_AreTheUploadedDataAccurate__c,'; valuesData += '\'' + jsonData.AreTheUploadedDataAccurate + '\'' + ','; }
	    
	if (jsonData.PleaseProvideDiscrepancyAndDate !== undefined && jsonData.PleaseProvideDiscrepancyAndDate !== null && jsonData.PleaseProvideDiscrepancyAndDate !== "null" && jsonData.PleaseProvideDiscrepancyAndDate.length > 0)
        { insertQueryData += 'DT_Pleaseprovidediscrepancyanddate__c,'; valuesData += '\'' + jsonData.PleaseProvideDiscrepancyAndDate + '\'' + ','; }
	    
	if (jsonData.DateWhenIssueOccurred !== undefined && jsonData.DateWhenIssueOccurred !== null && jsonData.DateWhenIssueOccurred !== "null" && jsonData.DateWhenIssueOccurred.length > 0)
        { insertQueryData += 'DT_Datewhenissueoccurred__c,'; valuesData += '\'' + jsonData.DateWhenIssueOccurred + '\'' + ','; }
	    
	if (jsonData.UserAbleToPerformDataTransferIfNO !== undefined && jsonData.UserAbleToPerformDataTransferIfNO !== null && jsonData.UserAbleToPerformDataTransferIfNO !== "null" && jsonData.UserAbleToPerformDataTransferIfNO.length > 0)
        { insertQueryData += 'DT_userabletoperformdatatransferIfNO__c,'; valuesData += '\'' + jsonData.UserAbleToPerformDataTransferIfNO + '\'' + ','; }
	    
	if (jsonData.DateWhenTheIssueObservedIfNO !== undefined && jsonData.DateWhenTheIssueObservedIfNO !== null && jsonData.DateWhenTheIssueObservedIfNO !== "null" && jsonData.DateWhenTheIssueObservedIfNO.length > 0)
        { insertQueryData += 'DT_DateWhenTheIssueObservedIfNO__c,'; valuesData += '\'' + jsonData.DateWhenTheIssueObservedIfNO + '\'' + ','; }
	    
	if (jsonData.IsitaRecurrentFailure !== undefined && jsonData.IsitaRecurrentFailure !== null && jsonData.IsitaRecurrentFailure !== "null" && jsonData.IsitaRecurrentFailure.length > 0)
        { insertQueryData += 'DT_Isitarecurrentfailure__c,'; valuesData += '\'' + jsonData.IsitaRecurrentFailure + '\'' + ','; }
	    
	if (jsonData.PleaseProvideFrequencyIfYES !== undefined && jsonData.PleaseProvideFrequencyIfYES !== null && jsonData.PleaseProvideFrequencyIfYES !== "null" && jsonData.PleaseProvideFrequencyIfYES.length > 0)
        { insertQueryData += 'DT_ifyesPleaseprovidefrequency__c,'; valuesData += '\'' + jsonData.PleaseProvideFrequencyIfYES + '\'' + ','; }
	    
	if (jsonData.IssueLinkedToTheTransmitter !== undefined && jsonData.IssueLinkedToTheTransmitter !== null && jsonData.IssueLinkedToTheTransmitter !== "null" && jsonData.IssueLinkedToTheTransmitter.length > 0)
        { insertQueryData += 'DT_IssueLinkedToTheTransmitter__c,'; valuesData += '\'' + jsonData.IssueLinkedToTheTransmitter + '\'' + ','; }
	    
	if (jsonData.AbnormalBlinkingOfTheTransmitter !== undefined && jsonData.AbnormalBlinkingOfTheTransmitter !== null && jsonData.AbnormalBlinkingOfTheTransmitter !== "null" && jsonData.AbnormalBlinkingOfTheTransmitter.length > 0)
        { insertQueryData += 'DT_AbnormalBlinkingOfTheTransmitter__c,'; valuesData += '\'' + jsonData.AbnormalBlinkingOfTheTransmitter + '\'' + ','; }
	    
	if (jsonData.WarngMsgDisplaydUponDataTransfer !== undefined && jsonData.WarngMsgDisplaydUponDataTransfer !== null && jsonData.WarngMsgDisplaydUponDataTransfer !== "null" && jsonData.WarngMsgDisplaydUponDataTransfer.length > 0)
        { insertQueryData += 'DT_WarngMsgDisplaydUponDataTransfer__c,'; valuesData += '\'' + jsonData.WarngMsgDisplaydUponDataTransfer + '\'' + ','; }
       	   
	if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0)
        { insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\''}

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


router.post('/insertDiviceGeneralFunctioning', function(req, res) {
    console.log('............insertDiviceGeneralFunctioning...............');
    var contentType = req.headers['content-type'];
    var mime = contentType.split(';')[0];
    
    console.log('contenttype:'+mime);
    
    var data=req.body.toString();
    console.log('Body:'+data);
    
    var splitteddata=data.replace("{","").replace("}","").split(',');
    
    var caseid = splitteddata[0];
	
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        
        console.log(req.body);
        var jsonData = req.body;
        var insertQueryData = 'INSERT INTO salesforce.IVOP_DecisionTree__c (';
        var valuesData=' VALUES (';        
	
	if (jsonData.AccessToTheMainMenu !== undefined && jsonData.AccessToTheMainMenu !== null && jsonData.AccessToTheMainMenu !== "null" && jsonData.AccessToTheMainMenu.length > 0)
        { insertQueryData += 'DF_Accesstothemainmenu__c,'; valuesData += '\'' + jsonData.AccessToTheMainMenu + '\'' + ','; }
	    
	if (jsonData.SomeThingDisplayedPreventingAcess !== undefined && jsonData.SomeThingDisplayedPreventingAcess !== null && jsonData.SomeThingDisplayedPreventingAcess !== "null" && jsonData.SomeThingDisplayedPreventingAcess.length > 0)
        { insertQueryData += 'DF_somethingdisplayedpreventingacess__c,'; valuesData += '\'' + jsonData.SomeThingDisplayedPreventingAcess + '\'' + ','; }
	    
	if (jsonData.LinkedToaDeviceOption !== undefined && jsonData.LinkedToaDeviceOption !== null && jsonData.LinkedToaDeviceOption !== "null" && jsonData.LinkedToaDeviceOption.length > 0)
        { insertQueryData += 'DF_Linkedtoadeviceoption__c,'; valuesData += '\'' + jsonData.LinkedToaDeviceOption + '\'' + ','; }
	    
	if (jsonData.CommentIfNo !== undefined && jsonData.CommentIfNo !== null && jsonData.CommentIfNo !== "null" && jsonData.CommentIfNo.length > 0)
        { insertQueryData += 'DF_Commentifno__c,'; valuesData += '\'' + jsonData.CommentIfNo + '\'' + ','; }
	    
	if (jsonData.ChangeIndevicesBehaviour !== undefined && jsonData.ChangeIndevicesBehaviour !== null && jsonData.ChangeIndevicesBehaviour !== "null" && jsonData.ChangeIndevicesBehaviour.length > 0)
        { insertQueryData += 'DF_Changeindevicesbehaviour__c,'; valuesData += '\'' + jsonData.ChangeIndevicesBehaviour + '\'' + ','; }
	    
	if (jsonData.IsDeviceFunctioningSlowerThanUsual !== undefined && jsonData.IsDeviceFunctioningSlowerThanUsual !== null && jsonData.IsDeviceFunctioningSlowerThanUsual !== "null" && jsonData.IsDeviceFunctioningSlowerThanUsual.length > 0)
        { insertQueryData += 'DF_Isdevicefunctioningslowerthanusual__c,'; valuesData += '\'' + jsonData.IsDeviceFunctioningSlowerThanUsual + '\'' + ','; }
	    
	if (jsonData.WhenItHasObservedForTheFirstTime !== undefined && jsonData.WhenItHasObservedForTheFirstTime !== null && jsonData.WhenItHasObservedForTheFirstTime !== "null" && jsonData.WhenItHasObservedForTheFirstTime.length > 0)
        { insertQueryData += 'DF_Whenithasobservedforthefirsttime__c,'; valuesData += '\'' + jsonData.WhenItHasObservedForTheFirstTime + '\'' + ','; }
	    
	if (jsonData.IsTheDeviceLouderThanUsually !== undefined && jsonData.IsTheDeviceLouderThanUsually !== null && jsonData.IsTheDeviceLouderThanUsually !== "null" && jsonData.IsTheDeviceLouderThanUsually.length > 0)
        { insertQueryData += 'DF_Isthedevicelouderthanusually__c,'; valuesData += '\'' + jsonData.IsTheDeviceLouderThanUsually + '\'' + ','; }
	    
	if (jsonData.WhenItHasBeenObservedForTheFirstTime !== undefined && jsonData.WhenItHasBeenObservedForTheFirstTime !== null && jsonData.WhenItHasBeenObservedForTheFirstTime !== "null" && jsonData.WhenItHasBeenObservedForTheFirstTime.length > 0)
        { insertQueryData += 'DF_Whenithasbeenobservedforthefirsttime__c,'; valuesData += '\'' + jsonData.WhenItHasBeenObservedForTheFirstTime + '\'' + ','; }
       	   
	if (jsonData.caseid !== undefined && jsonData.caseid !== null && jsonData.caseid !== "null" && jsonData.caseid.length > 0)
        { insertQueryData += 'HerokuCaseId__c'; valuesData += '\'' + jsonData.caseid + '\''}

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

router.get('/ValidateAdmin', function(req, res) {
    var emailaddress = req.headers.email.toLowerCase().trim();
    var password = req.headers.password;
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
                                  return res.json({
                                           userid:result.rows[0].sfid,
                                           firstname:result.rows[0].firstname,
					   lastname:result.rows[0].lastname,
					   username:result.rows[0].email,
					   uhrkid:result.rows[0].id,
					   language:result.rows[0].language,
			                   country:result.rows[0].country,
                                           msgid: 1,
                                           message: 'Success.'});
                               }
                            });
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
		
	        insertQueryData += 'Priority,'; valuesData += '\'' + 'Medium' + '\'' + ',';
		
	        insertQueryData += 'Status'; valuesData += '\'' + 'New' + '\'';	
	 console.log('............insertCase...1............');
		
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
	
	if (jsonData.Whoobservedthedefect !== undefined && jsonData.Whoobservedthedefect !== null && jsonData.Whoobservedthedefect !== "null" && jsonData.Whoobservedthedefect.length > 0)
        { insertQueryData += 'FMA_Whoobservedthedefect__c,'; valuesData += '\'' + jsonData.Whoobservedthedefect + '\'' + ','; }
	
	if (jsonData.HastheNurseHCPconfirmedthedefect !== undefined && jsonData.HastheNurseHCPconfirmedthedefect !== null && jsonData.HastheNurseHCPconfirmedthedefect !== "null" && jsonData.HastheNurseHCPconfirmedthedefect.length > 0)
        { insertQueryData += 'FMA_HastheNurseHCPconfirmedthedefect__c,'; valuesData += jsonData.HastheNurseHCPconfirmedthedefect + ','; }
	
        if (jsonData.Isproductcartridgestuckedindevice !== undefined && jsonData.Isproductcartridgestuckedindevice !== null && jsonData.Isproductcartridgestuckedindevice !== "null" && jsonData.Isproductcartridgestuckedindevice.length > 0)
        { insertQueryData += 'FMA_Isproductcartridgestuckedindevice__c,'; valuesData += jsonData.Isproductcartridgestuckedindevice + ','; }
        if (jsonData.Isreplacementofproductrequested !== undefined && jsonData.Isreplacementofproductrequested !== null && jsonData.Isreplacementofproductrequested !== "null" && jsonData.Isreplacementofproductrequested.length > 0)
        { insertQueryData += 'FMA_Isreplacementofproductrequested__c,'; valuesData += jsonData.Isreplacementofproductrequested + ','; }
	
        *****************************		
	*/        
        //-------------------------------------------End Framing Query-------------------------------------------
        
        //timestamp
        if (jsonData.timestamp !== undefined && jsonData.timestamp !== null && jsonData.timestamp !== "null" && jsonData.timestamp.length > 0)
        { timestamp = jsonData.timestamp; }
        
        var combinedQuery = insertQueryData + ')' + valuesData + ') RETURNING id';
        console.log(combinedQuery); 
        console.log('............insertCase...2............');
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
                            console.log(result);						
                            // Updating HrkCase id Start
			       return res.json({
						caseid:result.rows[0].id,
						sfid: result.rows[0].sfid,
						msgid: 1,
						timestamp: timestamp,
						message: 'Success.'});							   
			   // Updating HrkCase id End
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
            'SELECT sfid, Name, Productcode__c, Product_Type__c, Type__c, Product_Description__c, Product_Italy_Description__c, Serial_Batch_code__c, Serial_Batch_code_format__c, Serial_Batch_code_contains__c, BrandingColor__c, Formulation_Dosage__c FROM salesforce.FMA_Product__c WHERE Type__c=\''+type+'\'',
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
             'SELECT sfid, casenumber, fma_devicename__c, description, createddate, status from salesforce.case where contactid =\''+contact_id+'\' order by createddate desc Limit 10',
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
                    conn.query('INSERT INTO Salesforce.Contact (firstname, lastname, email, phone) VALUES (\''+jsonData.firstname+'\', \''+jsonData.lastname+'\', \''+jsonData.email.toLowerCase().trim()+'\', \''+jsonData.phone+'\')  RETURNING id',
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
});

router.post('/updateUserInfo', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        console.log(req.body);
        var jsonData = req.body;
        var user_id = jsonData.id;
        if(jsonData.src == 'ios'){
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
