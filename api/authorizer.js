exports.handler = require('node-lambda-authorizer')({ 
  jwtSecret: process.env.jwtsecret, 
  allowedGroups: process.env.allowedGroups.split(",") 
});
