require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/connention");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;

//static page call
const static_path = path.join(__dirname, "../public")
app.use(express.static(static_path));

//dynamic page call
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.set('view engine', "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);



app.get('/', (req, res) => {
    //res.send("hello from the rahul")
    res.render('index');
});

app.get('/secret', auth , (req, res) => {
    //console.log(`this is the cookies awesome ${req.cookies.jwt}`)
    res.render('secret');
});

app.get('/logout', auth , async (req, res) => {
    try{
        // for single logout
        /*req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement.token !== req.token
        });*/

        // logout from all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        await req.user.save();
        res.render('login');
    } catch(error){
        res.send(error);
    }
});

app.get('/register', (req, res) => {
    res.render("register");
});

// create a new user in our database
app.post('/register', async (req, res) => {
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        if(password === cpassword){
            const registerEmployee = new Register({
                firstname : req.body.firstname,
                lastname : req.body.lastname,
                email : req.body.email,
                gender : req.body.gender,
                phone : req.body.phone,
                age : req.body.age,
                password : req.body.password,
                confirmpassword : req.body.confirmpassword
            });

            console.log(`the sucess part ${registerEmployee}`);

            const token = await registerEmployee.generateAuthToken();
            console.log(`the token part ${token}`);
           
            // set cookie
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 600000),
                httpOnly: true
            });

            // password hash
           const registered = await registerEmployee.save();
           res.status(201).render("index");

        } else{
            res.send("Password are not matching");
        }

    }catch(error){
        res.status(400).send(error);
        console.log("the error part page");
    }
});

app.get('/login', (req, res) => {
    res.render("login");
});

// login validation
app.post('/login', async(req, res) => {
    try{

        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({email:email});
        
        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log(`the token part ${token}`);
        
        // set cookie
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        });

        

        if(isMatch){
            res.status(200).render('index');
        }else{
            res.send("Invalid Password Details");
        }   

    }catch(error){
        res.status(400).send("Invalid Login Details");
    }
});



//const bcrypt = require("bcryptjs");
const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const passwordMatch = await bcrypt.compare(password, passwordHash);
    console.log(passwordMatch);
}
securePassword("rahul@123");


const jwt = require("jsonwebtoken");

const createToken = async () => {
    const token = await jwt.sign({_id:"6086809fba09ec3168a7ca5a"}, "mynameisrahulsharmaiamawebdeveloperinwebchutney", {
      expiresIn : "5 minutes"  
    } )
    console.log(token);

    const userVer = await jwt.verify(token, "mynameisrahulsharmaiamawebdeveloperinwebchutney"); 
    console.log(userVer);
}

createToken();

app.listen(port, () => {
    console.log(`running in ${port}`);
}); 

