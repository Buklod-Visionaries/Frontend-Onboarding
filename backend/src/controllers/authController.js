import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import crypto from "crypto";
import {
  hashRefreshToken,
  createRefreshToken,
  setRefreshCookie,
} from "../helpers/refreshTokenHelper.js";

export async function register(req, res) {
  //takes the destructured value from json
  const { username, email, tempPass, role, department, isFirstLogin } =
    req.body;
  // set the password as hashed also adds 10 as the random data added to password to add security
  // const hashedPassword = await bcrypt.hash(password, 10);

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
    password: tempPass, //unhashed
    role,
    department,
    isFirstLogin,
  });
  await newUser.save();
  res.status(200).send({
    message: `New ${role} registered with username: ${username}`,
    user: newUser,
  });
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
  //doesnt allow users with temporaryPassword
  if (user.isFirstLogin || user.tempPass || user.passwordResetRequested) {
    return res
      .status(404)
      .send({ message: "First-time login user needs to setup new password" });
  }
  //deactivated account forbidden access
  if (user.status === "deactivated") {
    return res
      .status(403)
      .send({ message: "Account deactivated. Contact HR for help." });
  }
  //compares the hashed password to the requested user password
  const userMatch = await bcrypt.compare(password, user.password);

  //when the password does not match
  if (!userMatch) {
    return res.status(400).send({ message: `Invalid email or password.` });
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
  // const refreshToken = jwt.sign(
  //   {
  //     id: user._id,
  //   },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: "7d",
  //   },
  // );

  const refreshToken = createRefreshToken(user._id);
  user.refreshTokenHash = hashRefreshToken(refreshToken);

  // put the refreshToken on cookies
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true, //cant be access by javascript
  //   //secure: process.env.NODE_ENV === "production",
  //   secure: false,
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000, //
  // });

  setRefreshCookie(res, refreshToken);

  // set up sign in time
  user.lastSignIn = new Date();
  await user.save();

  res.status(200).send({
    accessToken: accessToken,
    user: {
      //explicitly return specific fields
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
  //if account already active and not requesting password reset
  if (!user.isFirstLogin && !user.passwordResetRequested) {
    return res.status(400).send({ message: "First-time login not applicable" });
  }
  //if password do not match
  if (tempPass !== user.password) {
    console.log(`Invalid credentials`);
    return res.status(400).send({ message: `Invalid temporary password` });
  }

  //hashed the new password typed in form
  const newHashedPass = await bcrypt.hash(newPass, 10);
  //create notif message for pending firstLogin
  if (user.isFirstLogin) {
    const notif = new Notification({
      user: user._id,
      title:
        user.role === "employee" ? "Welcome Aboard!" : "Welcome to the system",
      message:
        user.role === "employee"
          ? `Welcome, ${user.username}, to Premiere Medical and Cardiovascular Laboratory Inc.! We look forward to having you on our team. You can use this system to track your onboarding progress and complete your required onboarding documents.`
          : user.role === "hr"
            ? `Welcome, ${user.username}! You can use this system to manage employee onboarding, monitor requirements, review submitted documents, and track onboarding progress.`
            : `Welcome, ${user.username}! You can use this system to review and verify the onboarding activities assigned to your department and help ensure that new employees complete their requirements.`,
    });
    //save to DB
    await notif.save();
  }
  //set new pass and the account to active
  user.password = newHashedPass;
  user.isFirstLogin = false;
  user.tempPass = null; //should only be used on password reset
  user.passwordResetRequested = false; //set to false so the tempPass wont show on frontend
  //saves to DB
  await user.save();

  // creates a quick expiry token for the user
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
      algorithm: "HS256",
    },
  );

  //creates another token but longer
  // const refreshToken = jwt.sign(
  //   {
  //     id: user._id,
  //   },
  //   process.env.JWT_SECRET,
  //   {
  //     expiresIn: "7d",
  //   },
  // );
  const refreshToken = createRefreshToken(user._id);
  user.refreshTokenHash = hashRefreshToken(refreshToken);

  // put the refreshToken on cookies
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true, //cant be access by javascript
  //   //secure: process.env.NODE_ENV === "production",
  //   secure: false,
  //   sameSite: "strict",
  //   maxAge: 7 * 24 * 60 * 60 * 1000, //
  // });
  setRefreshCookie(res, refreshToken);

  console.log(`Successfully activated account of: ${user.username}`);

  // set up sign in time
  user.lastSignIn = new Date();
  await user.save();

  //create notif to HR
  const hr = await User.find({ role: "hr" });

  const notif = hr.map((hrUser) => {
    return new Notification({
      user: hrUser._id,
      title: `${user.username} has successfully set up a new password`,
      message:
        "Their account is now active and they can login with their new password.",
    });
  });

  await Notification.insertMany(notif);

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
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    if (decoded.tokenUse !== "refresh") {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const incomingHash = hashRefreshToken(refreshToken);

    const user = await User.findById(decoded.id).select(
      //"_id email username role status",
      "+refreshTokenHash",
    );

    if (!user) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    //deactivated account forbidden access
    if (user.status === "deactivated") {
      return res
        .status(403)
        .send({ message: "Account deactivated. Contact HR for help." });
    }

    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        message: "Refresh token expired, invalid, or already used.",
      });
    }

    const newRefreshToken = createRefreshToken(user._id);
    const newHash = hashRefreshToken(newRefreshToken);

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        refreshTokenHash: incomingHash,
        status: { $ne: "deactivated" },
      },
      {
        $set: { refreshTokenHash: newHash },
      },
      { new: true },
    ).select("_id username email role status");

    if (!updatedUser) {
      res.clearCookie("refreshToken");
      return res.status(401).json({
        message: "Refresh token already used or invalid",
      });
    }

    const accessToken = jwt.sign(
      {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
        algorithm: "HS256",
      },
    );

    //replace old cookie with new refresh token
    setRefreshCookie(res, newRefreshToken);

    res.status(200).send({
      accessToken: accessToken,
      user: {
        //explicitly return specific fields
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return res.status(401).json({
        message: "Invalid or expired refresh token",
      });
    }

    console.error("Refresh token error:", error);

    return res.status(500).json({
      message: "Unable to refresh session",
    });
  }
}

//logout is not going to be made because JWT are stateless
export async function logout(req, res) {
  // res.clearCookie("refreshToken");
  // //temp
  // console.log("REFRESH COOKIE:", req.cookies.refreshToken);
  // res.send({ message: "Logout" });

  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        algorithms: ["HS256"],
      });

      await User.updateOne(
        {
          _id: decoded.id,
          refreshTokenHash: hashRefreshToken(refreshToken),
        },
        { $set: { refreshTokenHash: null } },
      );
    } catch {}
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json({ message: "Logged out successfully" });
}

//request password reset controller
export async function requestPasswordReset(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "No email" });
  }

  //find the user with email and set Password reset requested field to true
  const existingUser = await User.findOneAndUpdate(
    { email: email },
    { passwordResetRequested: true },
    { returnDocument: "after" },
  );

  if (!existingUser) {
    return res
      .status(400)
      .send({ message: `No existing user with email ${email}` });
  }

  //find all HR
  const hr = await User.find({ role: "hr" });

  //create notification for each HR
  const notif = hr.map((hrUser) => {
    return new Notification({
      user: hrUser._id,
      title: `${existingUser.username} requested a password reset`,
      message: `A password reset request requires your attention.`,
    });
  });

  // save notifications
  await Notification.insertMany(notif);

  res.status(200).send({
    message: `Password reset for ${email} requested to HR.`,
    notifCreated: notif.length,
  });
}
