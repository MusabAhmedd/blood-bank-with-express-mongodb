const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerController = async (req, res) => {
  try {
    // Wait for findOne to complete and get the actual user document
    const existingUser = await userModel.findOne({ email: req.body.email });

    // Check if existingUser is truthy (i.e., document found)
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Create new user object
    const user = new userModel(req.body);

    // Save the user to the database
    await user.save();

    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

//login call back
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    console.log("User:", user); // Debugging statement

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User does not exist",
      });
    }

    // Compare password
    console.log("Request password:", req.body.password); // Debugging statement
    console.log("User password:", user.password); // Debugging statement
    const comparePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    console.log("Password comparison result:", comparePassword); // Debugging statement

    if (!comparePassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // If password matches, generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).send({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Login API",
      error,
    });
  }
};

//GET CURRENT USER
const currentUserController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    return res.status(200).send({
      success: true,
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "unable to get current user",
      error,
    });
  }
};

module.exports = { registerController, loginController, currentUserController };
