var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var wolfram = require('wolfram').createClient("6T3AG7-GX2VT7GWWU");
var app = express();
var port = 3000;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/View'));


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

app.get('/', function (req, res) {
	res.render('./index.html');
});

app.post('/getdelaytime', function (req, res) {
	wolfram.query(req.body.flight, function(err, result) {
    	if(err) {
    		res.status(400).json({ status: 400, msg: "Failure"});
    	} else {
			res.status(200).json({ status: 200, msg: 'Success in retrieving flight data!', delay: result[2].subpods[0].value.split('\n')[0] });
		}
	});
});

app.get('/getflightinfo', function (req, res) {
	wolfram.query(req.body.flight, function(err, result) {
    	if(err) {
    		res.status(400).json({ status: 400, msg: "Failure"});
    	} else {
			res.send(result);
		}
	});
});

app.listen(port, function () {
  console.log('Example app listening on port 3000!');
});