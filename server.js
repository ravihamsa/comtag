var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('key-cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here


app.get('/comtag/', function(req, res){
    var file = req.params.file;
    res.sendfile('index.html');
});

app.get('/comtag/static/:file', function(req, res){
    var file = req.params.file;
    res.sendfile('static/'+file);
});




app.post('/comtag', function(req, res){
    res.sendfile('index.html');
});


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(9898);
httpsServer.listen(4438);