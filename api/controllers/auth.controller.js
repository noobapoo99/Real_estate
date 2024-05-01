import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";
export const register = async (req, res) => {
  //db operations
  const { username, email, password } = req.body;
  // hash the password
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // create a new user and save to database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log(newUser);
    res.status(201).json({ message: "user created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: " Failed to create user!" });
  }
};
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    //check if the user exists
    const user = await prisma.user.findUnique({
      where: { username },
    });
    // check if the password is correct
    if (!user) return res.status(401).json({ message: "invalid credentials" });
    // generate cookie token and send the user
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "invalid credentials!" });
    // generate cookie token and send to the user
    //res.setHeader("set-cookie", "test=" + "myValue").json("success");
    const age = 1000 * 60 * 24 * 7;
    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: age }
    );

    res
      .cookie("token", token, {
        hettpOnly: true,
        //secure: true, // we cant use it here as we are using localhost .. if we used https in production we can use it
        maxAge: age,
      })
      .status(200)
      .json({ message: "Login Succcesful" });
  } catch (err) {
    console.log(first);
    res.status(500).json({ message: "failed to login!" });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
