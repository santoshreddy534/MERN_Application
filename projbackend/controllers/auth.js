const { validationResult } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');

//Signout
exports.signout = (req, res)=>{
    res.clearCookie("token");
    res.json({
        message: "User Signout Successfully"
    });
};

//Signup
exports.signup = (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    const user = new User(req.body);
    user.save((err, user)=>{
        if(err){
            return res.status(400).json({
                err:"Not able to save user in DB"
            })
        }
        res.json({
            name: user.name,
            email: user.email,
            id: user._id
        })
    })
    
        }

//Signin
exports.signin = (req, res)=>{
    const {email, password} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    User.findOne({email}, (err, user)=>{

        //check for email
        if(err || !user){
           return res.status(400).json({
                error: "Email not found"
            })
        }

        //check if password matches
        if(!user.authenticate(password)){
            return res.status(401).json({
                error: "Email and password do not match"
            })
        }

        //create token
        const token = jwt.sign({_id: user._id}, process.env.SECRET );

        //Put token into cookie
        res.cookie("token", token, {expire: new Date() + 9999});
        
        //Send response to Front end
        const {_id, name, email, role} = user;
        return res.json({
            token,
            user: {_id, name, email, role}
        });
    })
}

//Protected routes
exports.isSignedIn = expressjwt({
    secret:process.env.SECRET,
    userProperty: "auth"
});

//custom middlewares
exports.isAuthenticated = (req, res, next)=>{
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!checker){
        return res.status(403).json({
            error:"Access Denied"
        })
    }
    next();
}

exports.isAdmin = (req, res, next)=>{
    if(req.profile.role === 0){
        return res.status(403).json({
            error: "You are not ADMIN, Access Denied"
        })
    }
    next();
}
