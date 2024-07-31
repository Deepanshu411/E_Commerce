const express = require("express");

const { handleErrors } = require("./middlewares.js");
const usersRepo = require("../../repositories/users.js");
const signupTemplate = require("../../views/admin/auth/signup.js");
const signinTemplate = require("../../views/admin/auth/signin.js");
const {
  requireEmail,
  requirePassword,
  requireConfirmPassword,
  requireEmailExists,
  requireValidPasswordForUser,
} = require("./validators.js");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requireConfirmPassword],
  handleErrors(signupTemplate),
  async (req, res) => {
    const { email, password } = req.body;

    // Create a user in our user repo to represent this person
    const user = await usersRepo.create({ email, password });

    //Store the id of that user inside the users cookie
    req.session.userId = user.id;

    res.redirect("/admin/products");
  }
);

router.get("/signout", (req, res) => {
  req.session = null;
  res.send("You have been signed out!");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  "/signin",
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  async (req, res) => {
    const { email } = req.body;
    const user = await usersRepo.getOneBy({ email });
    if (!user) {
      return res.send("Email not found!");
    }

    req.session.userId = user.id;

    res.redirect("/admin/products");
  }
);

module.exports = router;
