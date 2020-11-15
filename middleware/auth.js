const config = require("config");
const jwt = require("jsonwebtoken");
const Session = require("../models/Session");
ObjectId = require("mongodb").ObjectID;

const parseCookies = (headers) => {
  const rawCookies = headers.cookie.split("; ");
  // rawCookies = ['myapp=secretcookie, 'analytics_cookie=beacon;']

  const parsedCookies = {};
  rawCookies.forEach((rawCookie) => {
    const parsedCookie = rawCookie.split("=");
    // parsedCookie = ['myapp', 'secretcookie'], ['analytics_cookie', 'beacon']
    parsedCookies[parsedCookie[0]] = parsedCookie[1];
  });
  return parsedCookies;
};

module.exports = middleware = async (request, response, next) => {
  if (!parseCookies(request.headers).DC_ST) {
    console.log("DC_ST not exist");

    return response.status(401).json("No session, can not be authorized!");
  }
  try {
    console.log("cookie : ", parseCookies(request.headers).DC_ST);
    const decoded = jwt.verify(
      parseCookies(request.headers).DC_ST,
      config.get("jwtToken")
    );
    const session = await Session.findById(decoded.sessionID);

    if (!session) {
      console.log("session not exist");
      response.clearCookie("DC_ST");
      return response.status(401).json("Session not found");
    }
    console.log("session exists");

    const now = new Date();
    if (session.expires.getTime() <= now.getTime()) {
      console.log("Session Expired");
      Session.deleteOne({ _id: decoded.sessionID });
      console.log("session storage deleted");

      response.clearCookie("DC_ST");
      return response.status(401).json("Session Expired");
    }

    //TODO: update page in session storage

    await Session.findOneAndUpdate(
      { _id: decoded.sessionID },
      { $set: { lastActive: now } }
    );
    console.log("session updated");
    request.sessionID = decoded.sessionID;
    request.user = decoded.user;
    next();
  } catch (error) {
    console.log(error);
    response.status(401).json("Error Occoured");
  }
};
