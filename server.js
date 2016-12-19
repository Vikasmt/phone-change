var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);
var conString = "postgres://nxxxbrtxucsbtf:2104b93ac8d0538c0b30441ebf1f7b454d0c56376369152598c1649c83e42746@ec2-54-235-153-124.compute-1.amazonaws.com:5432/d4f49ko012i477";
//var client = new pg.Client(conString);
//client.connect();
app.use(express.static('public'));
app.use(bodyParser.json());

var router = express.Router();

app.post('/CreateUser', function(req, res) {
    console.log(req.body);
    var jsonData = req.body;
    
    var formattedData='INSERT INTO UserManagement (firstname, email, phone, password) VALUES (\''+jsonData.firstname+'\', \''+jsonData.email+'\', 1234567899, \''+jsonData.password+'\')';
    console.log('formattedQuery:'+formattedData);
    
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
         if (err) console.log(err);
         conn.query('INSERT INTO UserManagement (firstname, email, phone, password) VALUES (\''+jsonData.firstname+'\', \''+jsonData.email+'\', 1234567899, \''+jsonData.password+'\')',
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
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
