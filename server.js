var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();
var connectionstring = 'postgres://dooztnflwrrsyr:2o30X5UiuDUNnxLdLqoAxJlBh7@ec2-107-22-251-225.compute-1.amazonaws.com:5432/db5punfeclfvgo';

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('port', process.env.PORT || 5000);

var router = express.Router();  

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.get('/message', function(req, res) {
    res.json({ message: 'hooray! welcome to our message api!' });   
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
    var username = req.headers.username;
    var password = req.headers.password;
     pg.connect(connectionstring, function (err, conn, done){
          if (err) console.log(err);
         conn.query(
             'SELECT firstname, lastname, username,email, phone from UserManagement where username='+username+' and password='+password+'',
             function(err,result){
                if (err != null || result.rowCount == 0) {
                    res.status(401).json({error: 'Invalid credentials.'});
                }
                 else {
                    res.json(result.rows);
                }
            });
     });
});

router.get('/CreateUser', function(req, res) {
     pg.connect(connectionstring, function (err, conn, done) {
         if (err) console.log(err);
         conn.query('INSERT INTO UserManagement (firstname, lastname, username, email, phone, password) VALUES ($1, $2, $3, $4, $5, ,$6)',
                  [req.body.firstname.trim(), req.body.lastname.trim(), req.body.username.trim(), req.body.email.trim(), req.body.phone.trim(), req.body.password.trim()],
             function(err, result) {
                done(); 
             if(err){
                    res.status(400).json({error: err.message});
                }
             else{
                    res.json(result);
                }
         });
     });
});

router.get('/getUsers', function(req, res) {
 pg.connect(connectionstring, function (err, conn, done) {
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
