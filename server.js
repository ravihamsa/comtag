var fs = require('fs');
var bodyParser = require('body-parser')
var path = require('path');
var http = require('http');
var https = require('https');
var _ = require('underscore');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('key-cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

var suggestions = [
    {
        "productId": 1,
        "brand": "RAYBAN",
        "name": "Ray-ban rb3025 001/58 size:62 golden grey aviator sunglasses",
        "bigimage": "people_branded_glass_1.jpg",
        "product_image": "product_branded_glass_1.jpg",
        "landingurl": "http://www.lenskart.com/ray-ban-0rb3025-001-58-62-aviator-mens-sunglasses.html"
    },
    {
        "productId": 2,
        "brand": "John Jacobs",
        "name": "John jacobs jj 1316 black 1010 men's eyeglasses",
        "bigimage": "people_branded_glass_2.jpg",
        "product_image": "product_branded_glass_2.jpg",
        "landingurl": "http://www.lenskart.com/john-jacobs-jj-1316-black-1010-men-s-eyeglasses.html"
    },
    {
        "productId": 3,
        "brand": "Vincent chase",
        "name": "Vincent chase vc0314 silver grey 5010 eyeglasses",
        "bigimage": "people_branded_glass_3.jpg",
        "product_image": "product_branded_glass_3.jpg",
        "landingurl": "http://www.lenskart.com/vincent-chase-vc0314-silver-grey-5010-eyeglasses.html"
    },
    {
        "productId": 4,
        "brand": "Vogue",
        "name": "Vogue vo2660s w65613 size:58 sunglasses",
        "bigimage": "people_branded_glass_4.jpg",
        "product_image": "product_branded_glass_4.jpg",
        "landingurl": "http://www.lenskart.com/vogue-vo2660s-w65613-size-58-sunglasses.html"
    },
    {
        "productId": 5,
        "brand": "Parim",
        "name": "Parim 3406 pink grey gradient s2 women's sunglasses",
        "bigimage": "people_branded_glass_5.jpg",
        "product_image": "product_branded_glass_5.jpg",
        "landingurl": "http://www.lenskart.com/parim-3406-pink-grey-gradient-s2-women-s-sunglasses.html"
    },
    {
        "productId": 6,
        "brand": "PUMA",
        "name": "Puma FtrTrnmc SlipstreamHi Regal Sneakers",
        "bigimage": "People_Puma_SlipstreamHi_shoe.JPG",
        "product_image": "Product_Puma_SlipstreamHi_shoe_product.JPG",
        "landingurl": "http://www.flipkart.com/puma-ftrtrnmc-slipstreamhi-regal-sneakers/p/itmeyfujgxnqrf2p?pid=SHODYZYFCWHH28PA&srno=b_45&ref=2f937d7a-8948-42ce-86b1-81c0b3ccd5af"
    },
    {
        "productId": 7,
        "brand": "PUMA",
        "name": "Puma FtrTrnmc SlipstreamHi Regal Sneakers",
        "bigimage": "People_Puma_SlipstreamHi_shoe.JPG",
        "product_image": "Product_Puma_SlipstreamHi_shoe_product_1.JPG",
        "landingurl": "http://www.flipkart.com/puma-ftrtrnmc-slipstreamhi-regal-sneakers/p/itmeyfujgxnqrf2p?pid=SHODYZYFCWHH28PA&srno=b_45&ref=2f937d7a-8948-42ce-86b1-81c0b3ccd5af"
    },
    {
        "productId": 8,
        "brand": "GLOBARITE",
        "name": "Globalite Roadster Boots",
        "bigimage": "PeopleGlobaliteRoadsterBoots.jpg",
        "product_image": "GlobaliteRoadsterBoots_1.jpeg",
        "landingurl": "http://www.flipkart.com/globalite-roadster-boots/p/itmdsfvvvnvkfjhz?pid=SHODSFG3Y7PRF7Z3&colorSelected=true"
    },
    {
        "productId": 9,
        "brand": "GLOBARITE",
        "name": "Globalite Roadster Boots",
        "bigimage": "PeopleGlobaliteRoadsterBoots.jpg",
        "product_image": "GlobaliteRoadsterBoots_2.jpeg",
        "landingurl": "http://www.flipkart.com/globalite-roadster-boots/p/itmdsfvvvnvkfjhz?pid=SHODSFG3Y7PRF7Z3&colorSelected=true"
    },
    {
        "productId": 10,
        "brand": "NIVEA",
        "name": "Nivia Hawks Jogging Shoes",
        "bigimage": "PeopleNiveaMenShoe.jpg",
        "product_image": "ProductNiveaShoe.jpeg",
        "landingurl": "http://www.flipkart.com/nivia-hawks-jogging-shoes/p/itmdfgy2vzktytgf?pid=SHODES9M3AHQ6ERJ"
    },
    {
        "productId": 11,
        "brand": "Gliders",
        "name": "Gliders Newclark Walking Shoes",
        "bigimage": "MenGliderShoe.png",
        "product_image": "glider_shoe.jpeg",
        "landingurl": "http://www.flipkart.com/gliders-newclark-walking-shoes/p/itmdzm4ypdczafex?pid=SHODRBH9HMGUUPSX"
    }
]


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

app.get('/comtag/listings/query/:searchString', function(req, res){
    var searchString =  req.params.searchString;
    var filteredSuggestions = _.filter(suggestions, function(item){
        return item.name.toLowerCase().indexOf(searchString) > -1 || item.brand.toLowerCase().indexOf(searchString) > -1;
    })
    res.json({
        query:searchString,
        suggestions:filteredSuggestions
    })
});




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