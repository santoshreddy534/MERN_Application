const express = require("express");
const router =  express.Router();

const { getCategoryById, createCategory, getCategory, getAllCategory, updateCategory, removeCategory } = require("../controllers/category");
const { getUserById } = require("../controllers/user");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");

//params
router.param("categoryId", getCategoryById);
router.param("userId", getUserById);

//actual routes
router.post("/category/create/:userId", isSignedIn, isAuthenticated, isAdmin, createCategory);

//READ
router.get("/category/:categoryId", getCategory)
router.get("/categories", getAllCategory)

//UPDATE
router.put("/category/:categoryId/:userId", isSignedIn, isAuthenticated, isAdmin, updateCategory);

//DELETE
router.delete("/category/:categoryId/:userId", isSignedIn, isAuthenticated, isAdmin, removeCategory);

module.exports = router