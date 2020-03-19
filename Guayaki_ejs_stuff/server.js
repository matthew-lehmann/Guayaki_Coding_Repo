/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var pgp = require('pg-promise')();

const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'guayaki',
	user: 'postgres',
	password: '1234'
};

var db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

app.get('/Guayaki_soc', function(req, res) {
	var query = 'select * from user_scores;';
	var query2 = 'select count(*) as ct from user_scores;';
	db.task('get-everything', task => {
		return task.batch([
			task.any(query),
			task.any(query2)
		]);
	})
		.then(function (rows){
			res.render('Guayaki_soc', {
				my_title: "Guayaki Home Page",
				data: rows[0],
				data2: rows[1]
			})
		})
		.catch(function(err){
			console.log('error', err);
			response.render('Guayaki_soc', {
				title: 'Guayaki Home Page',
				data: ''
			})
		})

});

app.get('/login', function(req, res){
	res.render('login', {
		title: 'Login Page'
	})
});

app.get('/mypage', function(req, res){
	res.render('mypage', {
		title: 'My Page'
	})
});

app.post('/mypage', function(req, res){
	var user_name = req.body.user_name;
	var user_password = req.body.user_password;

	var insert_statement1 = "insert into users(user_name, user_password) values('" + user_name + "','" + user_password + "');";
	db.task('get-everything', task =>{
		return task.batch([
			task.any(insert_statement1)
		]);
	})
	.then(info =>{
		res.render('mypage', {
			my_title: "My page",
		})
	})
	.catch(err =>{
		console.log('error', err);
		response.render('pages/home', {
		    title: 'My Page',
		})
	});
});

app.listen(3000);
console.log('Listening...');
