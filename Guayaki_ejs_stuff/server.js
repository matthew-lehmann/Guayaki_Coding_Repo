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
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var pgp = require('pg-promise')();
app.locals.token = false;

var userIn = 0;

const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'guayaki',
	user: 'postgres',
	password: '1234' //csci3308 for RDS
};

var db = pgp(dbConfig);
var uname = '';
var password = '';

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

app.get('/Guayaki_soc', function(req, res) {
	var query = 'select * from users;';
	var query2 = 'select count(*) as ct from users;';
	var query3 = "select * from users where user_name = '" + uname + "'" + "and user_password = '" + password + "';"
	db.task('get-everything', task => {
		return task.batch([
			task.any(query),
			task.any(query2),
			task.any(query3)
		]);
	})
		.then(function (rows){
			res.render('Guayaki_soc', {
				my_title: "Guayaki Home Page",
				data: rows[0],
				data2: rows[1],
				user_info: rows[2]
			})
		})
		.catch(function(err){
			console.log('error', err);
			res.render('Guayaki_soc', {
				title: 'Guayaki Home Page',
				data: ''
			})
		})

});

app.get('/login', function(req, res){
	var query = 'select * from users;';
	db.task('get-everything', task => {
		return task.batch([
			task.any(query)
		]);
	})
		.then(function(data){
			res.render('login', {
				title: 'Login Page',
				users: data[0]
			})
		})
		.catch(function(err){
			console.log('error', err);
			res.render('login', {
				title: 'Login Page',
				users: ''
			})
		})
});

app.get('/mypage/user', function(req,res){
	var query = "select * from users where user_name = '" + uname + "'" + "and user_password = '" + password + "';"
	db.task('get-everything', task=>{
		return task.batch([
			task.any(query)
		]);
	})
		.then(function(data) {
			res.render('mypage', {
				title: 'My Page',
				user_info: data[0]
			})
		})
})

// use the get to pull user information if token = true. If token is 
// false then no information can be pulled so just make if statement?
app.post('/mypage/userLogin', function(req, res){
	uname = req.body.user_name;
	password = req.body.user_password;
	var query = "select * from users where user_name = '" + uname + "'" + "and user_password = '" + password + "';"
	app.locals.token = true;

	db.task('get-everything', task=>{
		return task.batch([
			task.any(query)
		]);
	})
		.then(function(data){
			if (isEmptyObject(data[0])){
				res.render('duplicate', {
					title: 'Failed Login',
					users: ''
				})
			}
			else{
				res.render('mypage', {
					title: 'My Page',
					user_info: data[0]
				})
			}
		})
});

// a post request for the user page should only be sent on login or signup
app.post('/mypage/userSignup', function(req, res){
	uname = req.body.create_user_name;
	password = req.body.create_password;
	pic = req.body.profile_picture;
	app.locals.token = true;

	var insert_statement1 = "insert into users(user_name, user_password, profile_picture) values('" + uname + "','" + password + "','" + pic + "');";
	var query = "select * from users where user_name = '" + uname + "'" + "and user_password = '" + password + "';"

	db.task('get-everything', task =>{
		return task.batch([
			task.any(insert_statement1),
			task.any(query)
		]);
	})
	.then(function(data){
		res.render('mypage', {
			my_title: "My User Page",
			user_info: data[1]
		})
	})
	.catch(err =>{
		console.log('error', err);
		res.render('duplicate', {
		    title: 'Duplicate Account',
		})
	});
});

app.listen(3000);
console.log('Listening...');