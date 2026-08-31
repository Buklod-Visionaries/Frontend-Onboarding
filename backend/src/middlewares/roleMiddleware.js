import express from "express";

//middleware that allows certain roles to access data
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    //runs if the role is not included in the parameters of requested user
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({ message: "Access Denied" });
    }
    next();
  };
};
