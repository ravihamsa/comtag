var fs = require('fs');
var bodyParser = require('body-parser')
var path = require('path');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('key-cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here



var sendOptions = {
    root: __dirname
}

app.post('/comtag', function(req, res){
    console.log(req.params.photoId);
    console.log(req.params);
    res.sendFile('index.html', sendOptions);
});


app.post('/comtag/:photoId', function(req, res){
    console.log(req.params.photoId);
    console.log(req.params);
    res.redirect('/homepage?photoId='+req.params.photoId);
});


app.get('/homepage', function(req, res){
    res.sendFile('viewpage.html', sendOptions);
})

var jsonParser = bodyParser.json();

app.get('/comtag/', function(req, res){
    var file = req.params.file;
    res.sendFile('index.html', sendOptions);
});


app.get('/comtag/:photoId', function(req, res){
    console.log(req.params.photoId);
    console.log(req.params);
    res.redirect('/homepage?photoId='+req.params.photoId);
});

app.get('/comtag/static/:file', function(req, res){
    var file = req.params.file;
    res.sendFile('static/'+file, sendOptions);
});

app.get('/comtag/static/css/:file', function(req, res){
    var file = req.params.file;
    res.sendFile('static/css/'+file, sendOptions);
});

app.get('/comtag/static/fonts/:file', function(req, res){
    var file = req.params.file;
    res.sendFile('static/fonts/'+file, sendOptions);
});


app.get('/comtag/taglist/', function(req, res){
    var tagFilePath = __dirname+'/data/tags/';
    if(fs.existsSync(tagFilePath)){
        res.send('it exists');
    }else{
        res.send(tagFilePath+ ' it doesnt exists');
    }
})




app.get('/comtag/taglist/:tagId', function(req, res){
    var tagId = req.params.tagId;
    var tagFilePath = __dirname+'/data/tags/'+tagId+'.json';
    if(fs.existsSync(tagFilePath)){
        res.sendFile(tagFilePath);
    }else{
        fs.writeFile(tagFilePath, '[]', function (err) {
            if (err) throw err;
            console.log('It\'s saved! in same location.');
        });
        res.send('[]');
    }
})

app.post('/comtag/taglist/:tagId', jsonParser, function(request, respond){
    var body = '';
    var tagId = request.params.tagId;
    var filePath = __dirname+'/data/tags/'+tagId+'.json';
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){

        fs.writeFile(filePath, body, function() {
            respond.end();
        });
    });
});

app.post('/comtag/images/:imageId', jsonParser, function(request, respond){
    var body = '';

    var imageId = request.params.imageId;
    var filePath = __dirname+'/data/images/'+imageId+'.json';
    console.log(imageId, filePath, 'ravi');
    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function (){
        console.log('saving', filePath);
        fs.writeFile(filePath, body, function() {
            respond.end();
        });
    });
});








var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(9898);
httpsServer.listen(4438);