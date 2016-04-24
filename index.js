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
var img_dly = [];

app.get('/', function (req, res) {
	res.render('./index.html');
});

app.post('/getflightinfo', function (req, res, next) {
	console.log('GET FLIGHT INFO');
	console.log(info);
	console.log(req.body);
	wolfram.query(req.body.flight, function(err, result) {
    	if(!err) {
    		res.status(200).json({ status: 200, msg: 'Success in retrieving flight data!', delay: result });
    	} else {
			res.status(400).json({ status: 400, msg: "Failure"});
		}
	});
});


app.post('/departarrival', function (req, res) {
	console.log("POST DEPART AND ARRIVAL");
	console.log(req.body);
	wolfram.query("Flights from " + req.body.depart + " to " + req.body.arrival, function(err, result) {
    	if(!err) {
    		info.push(result[3].subpods[0].value.split('\n'));
			res.status(200).json({ status: 200, msg: 'Success in POSTing departure and arrival locations!', wolfresp: result[3].subpods[0].value.split('\n') });
			console.log('SUCCESS');
    	} else {
    		res.status(400).json({ status: 400, msg: "Failure"});
		}
	});
});


app.post('/getAirlines', function (req, res) {
	console.log('GET AIRLINES');
	airlines = [];
	console.log(info[0]);
	for (var i=0; i < info[0].length; i++) {
		var airline = "";
		for (var j=0; j < info[0][i].length; j++) {
			if (info[0][i][j] != 'f') {
	    		airline += info[0][i][j];
			} else {
				break
			}
		}
		airlines.push(airline.trim());
	}
	console.log(airlines);
	res.status(200).json({ status: 200, msg: 'Success in receiving flight stats!', wolfresp: airlines});
	console.log('SUCCESS');
});

app.post('/getDelays', function (req, res) {
	console.log('GET IMG AND DELAYS');
	img_dly = [];
	console.log(airlines);
	for (var i=0; i < airlines.length; i++) {
		console.log(airlines[i]);
		wolfram.query(airlines[i], function(err, result) {
    		if(!err) {
    			img_dly.push(result);
    		} else {
				res.status(400).json({ status: 400, msg: "Failure"});
			}
		});
	}
	console.log(img_dly);
	res.status(200).json({ status: 200, msg: 'Success in retrieving airline logo and delays!', img_delays: img_dly });
	console.log('SUCCESS');
});



app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});