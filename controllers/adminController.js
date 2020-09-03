const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Admin = require("../models/adminModel");
const MASTER_KEY = process.env.MASTER_KEY;
//const { registerValidation, loginValidation } = require("../validation");


// signup
exports.signUp = async (req, res, next) => {
  //const { error } = registerValidation(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  const emailexist = await Admin.findOne({ email: req.body.email });
  if (emailexist) return res.status(400).send("email  already exist");

  try {
    const newAdmin = await createAdmin(req);
    const savedAdmin = await newAdmin.save(); // await createAdmin(req).save();
    res.status(200).send({ message: "User created successfully!", userId: savedAdmin._id });
  } catch (err) {
    res.status(400).send(err);
  }
};

// login
exports.logIn = async (req, res) => {
  //const { error } = loginValidation(req.body);
  //if (error) return res.status(400).send(error.details[0].message);

  const foundAdmin = await Admin.findOne({ email: req.body.email }); //returns the first document that matches the query criteria or null
  if (!foundAdmin) return res.status(400).send({ message: "Email is not found" });

  try {
    const isMatch = await bcrypt.compareSync(req.body.password, foundAdmin.password);
    if (!isMatch) return res.status(400).send({ message: "invalid password" });

    // create and assign jwt
    const token = await jwt.sign({ _id: foundAdmin._id }, MASTER_KEY);
    res.header("admin-token", token).send({ message: "logged in", token });
  } catch (error) {
    res.status(400).send(error);
  }
};
// Update admin
exports.updateAdmn = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findOneAndUpdate({ _id: req.params.userId }, { $set: req.body }); // the `await` is very important here!
    // findOneAndUpdate returns a document if found or null if not found

    if (!updatedAdmin) {
      return res.status(400).send({ message: "Could not update user" });
    }
    return res.status(200).send({ message: "User updated successfully" });

  } catch (error) {
    return res.status(400).send({ error: "An error has occured, unable to update user" });
  }
};

// Delete user
exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete({ _id: req.params.userId}); // the `await` is very important here!

    if (!deletedAdmin) {
      return res.status(400).send({ message: "Could not delete user" });
    }
    return res.status(200).send({ message: "User deleted successfully"});
  } catch (error) {
    return res.status(400).send({ error: "An error has occured, unable to delete user" });
  }
};

exports.data = async (req, res) => {
  res.json({
    posts: {
      title: "my first post admin",
      discription: "random data you not acess",
    },
  });
};

async function createAdmin(req) {
  const hashPassword = await bcrypt.hashSync(req.body.password, 10);
  return new Admin({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
    phonenumber: req.body.phonenumber,
  });
}