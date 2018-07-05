'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var _ = require('lodash');
var dns = require('dns');
var validator = require('validator');
var app = express();
var urlOptions = {protocols: ['http','https'], require_protocol: false, allow_underscores: false};



/*mongodb databse*/
mongoose.connect(process.env.MONGOLAB_URI);

var Schema = mongoose.Schema;

var userSchema = new Schema({
  orginalUrl:String,
  shortUrl:Number
});


var User = mongoose.model('User',userSchema);

// Basic Configuration 
var port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'));


app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 

app.post("/api/shorturl/new", async function(req,res){
 var url = req.body.url;
 var newUrl = _.toLower (_.trim(url,"https://")).split('/')[0];

  
  var usr = await  User.find({orginalUrl: url}).count() ;

  if( usr>0 ){  
    
    var usr = await User.findOne({orginalUrl: url});
    res.json({ orginalUrl :usr.orginalUrl , shortUrl : usr.shortUrl });
    
  }
  else{
    
    //
    
     dns.lookup(newUrl, (err, address, family) => {
       //|| 
      
  
    if( address == undefined ){
      
      res.json({"error":"invalid Host"});
          
    }
  else if(!validator.isURL(url,urlOptions) || (_.startsWith(url,"https://")==false && _.startsWith(url,"http://")==false)){
  
  res.json({"error":"invalid URL"});
  
  }
    else{
       var saveData ={orginalUrl:url,shortUrl : _.random(0, 1000)};
     (new User(saveData).save());
    res.json(saveData);
      //console.log(address);
      
    }
   
  });
    
  
  }
  
  
});

app.get('/api/shorturl/:shortUrl', async function(req,res){
  
  var data = await User.findOne({shortUrl:req.params.shortUrl});
     res.redirect(data.orginalUrl);      
})

app.listen(port, function () {
  console.log('Node.js listening ...');       
});