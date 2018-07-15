const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const randomstring = require('randomstring')
const cors = require('cors')
const _ = require('lodash')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )


/*mongodb database model */

var excersiceTrackerUser = new Schema({
  username:String,
  _id:String
});

var excerciseTrack = new Schema({
  
  userId:String,
  description:String,
  duration:Number,
  date: Date

});

var   excercise = mongoose.model('excercise',excersiceTrackerUser);
var   track = mongoose.model('track',excerciseTrack);

/*body parser setup*/


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


/*rendering static files*/

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})


/*api end point */

//new user creation 
app.post("/api/exercise/new-user",async function(req,res){
  
  var finduser=  await excercise.find({ username :req.body.username}).count() ;
  
  if(finduser >0 ){
     res.send("Username is already taken");
  }
  else{
    let data={username :req.body.username,_id:randomstring.generate(7)};
  var user = new excercise(data);
   await user.save();
  res.json(data); 
  }
  
});




//save excerciseData acording to user
app.post("/api/exercise/add", async function(req,res){
  
  var user= await excercise.find({_id:req.body.userId}).count();
  
  if(user>0){
    
       if(req.body.duration){

          var data ={ 
          userId :req.body.userId,
          description:req.body.description,
          duration:req.body.duration,
          date:req.body.date
          }      
            var data =  new track(data);
            await data.save();
            res.json(data);  
        }
        else{
              res.json("Invalid date or duration");
        }
    //res.json("valid");
  }
  else{
    res.json("Invalid User");
  }
  
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
