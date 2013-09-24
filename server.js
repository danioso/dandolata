var Twat = require('twat');
var express = require('express');
var app = express();
var socket = require('socket.io');
var path = require('path')

var twit = new Twat({
  consumer_key: 'r6MVzZjx5xb8Gh7Zf0HHSA',
  consumer_secret: '00Jj1Su2nFzSF0rSN4pyC1MMDIOCF8CXG16OLxfWQ',
  access_token: '859176494-AW7dsoQGNGxgKRHeAMs9Z77KBFzqZOMDYOHONtEn',
  access_token_secret: 'HaC9F4H5hspb8I76bOgkyCGjUiYnWLz54zcA61LVQ'
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

  res.render('index', { title: 'DandoLata' });

});

var server = app.listen(8080);
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
    console.log(tweet);
    io.sockets.emit('tweet', tweet);
  });
});



