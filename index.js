var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var wolfram = require('wolfram').createClient("API_KEY");
var app = express();
var port = 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
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
	res.render('index.html');
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
    		for ( i = 0; i < result.length; i++) {
    			if (result[i].title === 'Scheduled flights for the next 24 hours') {
    				info.push(result[i].subpods[0].value.split('\n'));
    			}
    		}
    		console.log(info);
			res.status(200).json({ status: 200, msg: 'Success in POSTing departure and arrival locations!', wolfresp: info });
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
	res.status(200).json({ status: 200, msg: 'Success in receiving flight stats!', airlines: airlines});
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

	var final_data = [];
	setTimeout(function() {
		for (var i = 0; i < img_dly.length; i++) {
			if (img_dly[i]) { 
				for (var j = 0; j < img_dly[i].length; j++) {
					if (img_dly[i][j].title === 'Input interpretation') {
						final_data.push(img_dly[i][j].subpods[0].value);
						final_data.push(img_dly[i][j].subpods[0].image);
					}
					if (img_dly[i][j].title === 'On-time performance') {
						final_data.push(img_dly[i][j].subpods[0].value.split('\n')[1].split('|')[1].trim().split(" ")[1]);
						final_data.push(img_dly[i][j].subpods[0].value.split('\n')[1].split('|')[2].trim().split(" ")[1]);
					} 
				}
			}
		}
	}, 10000);
	setTimeout(function() {
		res.status(200).json({ status: 200, msg: 'Success in retrieving airline logo and delays!', img_delays: final_data });
		console.log('SUCCESS');
	}, 15000);
});



app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});
