(function() {
  "use strict";

  var _ = require('lodash');
  var validate = require('express-validation');
  var Joi = require('joi');
  var Enjoi = require('enjoi');

  function RouteHelper() {

  }

  RouteHelper.applyRoutes = function(server, routes) {
    validate.options({
      contextRequest: true // needed for validating arrays (workaround)
    });
    _.forEach(_.get(routes, 'endpoints'), function(route) {
      server[route.route.method.toLowerCase()](route.route.path, validate(_.get(route, 'validate', {})), _.get(route, 'config.handler') || function(req, res, next) {
        req.routeObject = route;
        req.routeParams = req.params;
        next();
      });
      console.log('registered route:', route.route.method, route.route.path, _.has(route, 'config.handler'));
    });
  };

  module.exports = RouteHelper;
})();
