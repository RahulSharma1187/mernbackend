const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongooseSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required : true
    },
    lastname:{
        type: String,
        required : true
    },
    email:{
        type: String,
        required : true,
        unique: true
    },
    gender:{
        type: String,
        required : true
    },
    phone:{
        type: Number,
        required : true,
        unique: true
    },
    age:{
        type: Number,
        required : true
    },
    password:{
        type: String,
        required : true
    },
    confirmpassword:{
        type: String,
        required : true
    },
    tokens:[{
        token:{
            type: String,
            required : true
        }
    }]
})

// generating token
mongooseSchema.methods.generateAuthToken = async function(){
    try{
        console.log(this._id);
        //const token = await jwt.sign({_id:this._id.toString()}, "mynameisrahulsharmaiamawebdeveloperinwebchutney");
        const token = await jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token})
        await this.save();
        return token;
    } catch(error){
        res.send(`the error part ${error}`);
        console.log(`the error part ${error}`);
    }
};

// converting password into hash
mongooseSchema.pre("save", async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
});

// now we need to create collections

const Register = mongoose.model("Register", mongooseSchema);

module.exports = Register;
