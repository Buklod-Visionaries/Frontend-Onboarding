import express from "express";
import jwt from "jsonwebtoken";

//middleware that only allows verified users to access specific data
export const verifyToken = (req, res, next) => {
  let token;
  //takes from the Headers
  let authHeader = req.headers.Authorization || req.headers.authorization;

  // run if authorization exist in Headers
  if (authHeader && authHeader.startsWith("Bearer")) {
    //assigns authHeader authorization to token variable
    token = authHeader.split(" ")[1];

    if (!token) {
      // runs if theres no token
      return res.status(401).send({ message: "no token" });
    }

    try {
      // verify if the authorization exist from jwt
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
      console.log("The decoded user is:", req.user);
      // if success continue to the process
      next();
    } catch (error) {
      res.status(400).send({ message: "token is not valid" });
    }
  } else {
    // run if authorization is unchecked in Headers
    return res
      .status(401)
      .send({ message: "Denied access, no token authorization" });
  }
};
