const config = require("config");
const jwt = require("jsonwebtoken");

module.exports = function (request, response, next) {
  //get token from header
  const token = request.header("x-auth-token");

  //check if no token
  if (!token) {
    return response.status(401).json("No token, can not be authorized!");
  }

  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtToken"));
    request.user = decoded.user;
    next();
  } catch (err) {
    response.status(401).json("Token is not valid!");
  }
};
