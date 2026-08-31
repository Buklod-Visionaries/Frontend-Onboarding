import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export async function register(req, res) {
  //takes the destructured value from json
  const { username, email, password, role, department, isFirstLogin } =
    req.body;
  // set the password as hashed also adds 10 as the random data added to password to add security
  const hashedPassword = await bcrypt.hash(password, 10);

  //
  const existingUser = await User.findOne({
    $or: [{ username }, { email }], // check if either of the username or email exist
  });

  //return error if credentials username and email already exist
  if (existingUser) {
    if (existingUser.username === username && existingUser.email === email) {
      return res
        .status(404)
        .send({ message: "Username and email already exist" });
    }
    if (existingUser.username === username) {
      return res.status(404).send({ message: "Username already exist" });
    }
    if (existingUser.email === email) {
      return res.status(404).send({ message: "Email already exist" });
    }
  }

  //avoid employees from being created on register
  if (role === "employee") {
    return res.send({
      message: "Employee can only be created on /api/employees/",
    });
  }

  //sets the role to the db
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    department,
    isFirstLogin,
  });
  await newUser.save();
  res
    .status(200)
    .send({ message: `New ${role} registered with username: ${username}` });
}

export async function login(req, res) {
  const { email, password } = req.body;
  //takes the DB user with the same username as the request username
  const user = await User.findOne({ email });

  if (!user) {
    //when the user doesnt exist
    console.log(`No users found with credential email: ${email}`);
    return res
      .status(404)
      .send({ message: `User with email ${email} not found` });
  }
  //compares the hashed password to the requested user password
  const userMatch = await bcrypt.compare(password, user.password);

  //doesnt allow users with temporaryPassword
  if (user.isFirstLogin) {
    return res
      .status(404)
      .send({ message: "First-time login user needs to setup new password" });
  }

  //when the password does not match
  if (!userMatch) {
    return res.status(400).send({ message: `Invalid credentials` });
  }

  // creates an access token for the user
  const accessToken = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  //creates another token but longer
  const refreshToken = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  // put the refreshToken on cookies
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //cant be access by javascript
    //secure: process.env.NODE_ENV === "production",
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //
  });

  res.status(200).send({
    accessToken: accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

//change password and set account to active
export async function firstLogin(req, res) {
  //takes the values from the form
  const { email, tempPass, newPass } = req.body;

  const user = await User.findOne({
    email,
  });
  //if user doesnt exist
  if (!user) {
    console.log(`No users found with credential email: ${email}`);
    return res
      .status(404)
      .send({ message: `User with email ${email} not found` });
  }
  //if account already active
  if (!user.isFirstLogin) {
    return res.send({ message: "First-time login not applicable" });
  }
  //if password do not match
  const userMatch = await bcrypt.compare(tempPass, user.password);
  if (!userMatch) {
    console.log(`Invalid credentials`);
    return res.status(404).send({ message: `Password do not match` });
  }

  //hashed the new password typed in form
  const newHashedPass = await bcrypt.hash(newPass, 10);
  //set new pass and the account to active
  user.password = newHashedPass;
  user.isFirstLogin = false;
  //saves to DB
  await user.save();

  // creates a token for the user
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  console.log(`Successfully activated account of: ${user.username}`);
  res.send({ token });
}

export async function refresh(req, res) {
  //set the refresh token from the cookies
  const refreshToken = req.cookies.refreshToken;

  //if reftoken does not exist
  if (!refreshToken) {
    return res.status(401).json({
      message: "No refresh token",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id email username role",
    );
    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.send({ accessToken, user });
  } catch (error) {
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
}

//logout is not going to be made because JWT are stateless
export function logout(req, res) {
  res.clearCookie("refreshToken");
  //temp
  console.log("REFRESH COOKIE:", req.cookies.refreshToken);
  res.send({ message: "Logout" });
}
