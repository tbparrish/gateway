(function() {
  "use strict";

  var _ = require("lodash");
  var url = require("url");
  var MicroserviceProxy = require("rm-node-ms");

  var Middleware = function(proxy){
    var self = this;
    self.proxy = proxy || new MicroserviceProxy();

    return function(req, res, next) {
      var route = req.routeObject;

      var microservice = _.get(route, 'config.microservice');

      if (!microservice) {
        return next();
      }

      var data = req.body;
      if(Array.isArray(data)) {
        data = {items: data};
      }

      self.proxy.act({role: microservice.role, cmd: microservice.cmd}, _.assign({}, data, req.routeParams, url.parse(req.url, true).query))
      .then(function(response){
        res.status(response.httpCode || 200).json(response || {});
      })
      .catch(function(err){
        if(err.timeout) {
          err.message = 'Server error: message timed out';
        }
        res.status(err.httpCode || 400).json({error: err.message});
      });
    }.bind(self);
  };

  Middleware.init = function(proxy) {
    return new Middleware(proxy);
  };

  module.exports = Middleware;
})();
