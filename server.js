var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);
app.use(express.static('public'));
app.use(bodyParser.json());

var router = express.Router();

app.get('/getusers', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        if (err) console.log(err);
        conn.query(
            'SELECT * FROM usermanagement',
            function(err,result){
                res.render('getusers', {
                  items: rows
                });
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


app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
