(function(){
  'use strict';

  var seneca = require('seneca')();
  var express = require('express');
  var validate = require('express-validation');
  var bodyParser = require('body-parser');
  var routeHelper = require('./routeHelper');
  var Microservice = require("rm-node-ms");
  var swagger = require('swagger-express');
  var swaggerGenerateConf = require('./swaggerGenerateConf');
  var routes = require('../config/routes');
  var fs = require('fs');
  var _ = require('lodash');

  function Server() {
    this.expressServer = new express();
    this.ms = new Microservice({
      "rabbit": {
        "clientOnly": true
      },
      "apiPort": 8082
    });
  }

  Server.prototype.initialize = function(confOverrides) {
    var self = this;
    return self.ms.ready.then(function() {
      self.expressServer.use(bodyParser.json()); // for parsing application/json
      self.expressServer.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

      // Swagger
      fs.writeFileSync('./swagger/swagger.json', JSON.stringify(swaggerGenerateConf(routes), null, 2));
      self.expressServer.use(swagger.init(self.expressServer, {
        apiVersion: '1.0',
        swaggerVersion: '2.0',
        basePath: '/',
        swaggerURL: '/swagger',
        swaggerJSON: '/api-docs.json',
        swaggerUI: 'swagger',
        apis: []
      }));

      // apply routes
      routeHelper.applyRoutes(self.expressServer, routes);

      // setup microservice layer
      self.expressServer.use( require("./middleware/microservice").init(self.ms) );

      // error handler
      self.expressServer.use(function (err, req, res, next) {
        // specific for validation errors
        if (err instanceof validate.ValidationError) {
          return res.status(err.status).json({error: _.get(err, 'message')});
        }
        next();
      });

      // finally
      self.expressServer.use(function(req, res){
        res.status(404).send('404: API cannot be found');
      });

      var port = _.get(self.ms, 'config.apiPort');
      self.expressServer.listen(port);
      console.log('listening to', port + '...');
    });
  };

  module.exports = Server;
})();
