var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var wolfram = require('wolfram').createClient("6T3AG7-GX2VT7GWWU");
var app = express();
var port = 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/View'));
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  } else {
    return next();
  }
});

/*
mongoose.connect('mongodb://localhost/flightdata');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Delay = mongoose.model('Delay', new Schema({
	id: ObjectId,
	scheduled_d: String,
	actual_d: String,
	scheduled_a: String,
	actual_a: String
	})); 
*/

var info = [];
var airlines = [];

app.get('/', function (req, res) {
	res.render('./index.html');
});

app.post('/getflightinfo', function (req, res, next) {
	console.log(info);
	console.log(req.body);
	wolfram.query(req.body.flight, function(err, resul) {
    	if(!err) {
    		res.status(200).json({ status: 200, msg: 'Success in retrieving flight data!', delay: resul });
    	} else {
			res.status(400).json({ status: 400, msg: "Failure"});
		}
	});
});


app.post('/departarrival', function (req, res) {
	console.log("Proposed Route:");
	console.log(req.body);
	wolfram.query("Flights from " + req.body.depart + " to " + req.body.arrival, function(err, result) {
    	if(!err) {
    		info.push(result[3].subpods[0].value.split('\n'));
			res.status(200).json({ status: 200, msg: 'Success in POSTing departure and arrival locations!', wolfresp: result[3].subpods[0].value.split('\n') });
    	} else {
    		res.status(400).json({ status: 400, msg: "Failure"});
		}
		console.log(info[0][0]);
	});
});

app.post('/getdelayStats', function (req, res) {

	for (var i=0; i < info[0].length; i++) {
		var result = "";
		for (var j=0; j < info[0][i].length; j++) {
			if (info[0][i][j] != ' f') {
	    		result += info[0][i][j];
			} else {
				break
			}
		}
		airlines.push(result);
	}
	console.log(airlines);

	res.status(200).json({ status: 200, msg: 'Success in receiving flight stats!', wolfresp: airlines});
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});