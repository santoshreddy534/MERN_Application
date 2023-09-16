const express = require("express");
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");
const {check} = require("express-validator");
const router = express.Router();

router.post('/signup',[
    check("name", "name should be atleast 3 characters").isLength({min: 3}),
    check("email", "email required").isEmail(),
    check("password", "password should be atleast 3 characters").isLength({min: 3}),
], signup);

router.post('/signin', [
    check("email", "Email Required").isEmail(),
    check("password", "Password Required").isLength({min: 3}),
] , signin)



router.get('/signout', signout);

module.exports = router;