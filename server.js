var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();
//var restful = require('node-restful');

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
