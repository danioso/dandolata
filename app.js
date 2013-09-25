var Twat = require('twat');
var express = require('express');
var app = express();
var socket = require('socket.io');
var path = require('path');
var mongoose = require('mongoose');

var twit = new Twat({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});


mongoose.connect('mongodb://<user>:<pass>@ds047448.mongolab.com:47448/<db>');

var Tweet = mongoose.model('Tweet', { 
  user: String,
  user_image: String,
  entities: Object,
  text: String,
  created_at: Date
  
});

app.configure(function(){
	//app.use(express.static(__dirname + '/'));

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use({ src:__dirname + '/public' });
    app.use(express.static(path.join(__dirname, 'public')));

});

app.get('/', function(req, res){

  Tweet.find({}, function (err, docs) {

    if (err) 
        console.log('error on data tweets get');

    res.render('index', { title: 'DandoLata', tweets: JSON.stringify(docs), port: process.env.PORT });

  });

  

});

var port = 8080;
//var port = process.env.PORT;


var server = app.listen(port);
var io = socket.listen(server);

// Socket.io
io.sockets.on('connection', function (socket) {
	console.log("connnect");
	socket.on('disconnect', function (socket) {
		console.log("disconnect");
	});
	socket.emit("pong",{txt:"Connected to server"});
	socket.on('ping', function (data) {
		console.log(data.txt);
		socket.emit("pong",{txt:"Pong (from server)"});
	});
});

// Socket connection twitter
twit.stream('statuses/filter', {'track':'DandoLata'}, function(stream) {
  stream.on('tweet', function(tweet) {
    
    // Save tweet
    var tweet = new Tweet({ 

      user: tweet.user.name,
      user_image: tweet.user.profile_image_url,
      entities: tweet.entities,
      text: tweet.text,
      created_at: tweet.created_at

    });
    tweet.save(function (err) {
      if (err) 
        console.log('error on data save');
    });

    io.sockets.emit('tweet', JSON.stringify(tweet));
  });
});



