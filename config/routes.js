(function() {
  "use strict";

  var Joi = require('joi');
  var _ = require('lodash');

  module.exports = {
    swagger: {
      'swagger': '2.0',
      'info': {
        'description': 'RouteMatch API description',
        'version': '1.0.0',
        'title': 'RouteMatch API',
        'termsOfService': '',
        'contact': {
          'email': 'info@routematch.com'
        },
        'license': {
          'name': 'NONE',
          'url': ''
        }
      },
      'consumes': [
        'application/json'
      ],
      'produces': [
        'application/json'
      ]
    },
    endpoints: [
      // vehicle-service
      {
        description: 'returns managed vehicles within the system',
        tags: [
          'vehicles'
        ],
        route: {
          'path': '/cnrest/V1/vehicles/:id',
          'method': 'GET'
        },
        config: {
          microservice: {
            role: 'vehicle-location',
            cmd: 'retrieve'
          }
        },
        validate: {
          params: {
            id: Joi.string().required().description('Identificator')
          }
        }
      }, {
        tags: [
          'vehicles'
        ],
        route: {
          'path': '/cnrest/V1/vehicles',
          'method': 'GET'
        },
        config: {
          microservice: {
            role: 'vehicle-location',
            cmd: 'list'
          }
        }
      }, {
        tags: [
          'vehicles'
        ],
        route: {
          'path': '/cnrest/V1/vehicles',
          'method': 'POST'
        },
        config: {
          microservice: {
            role: 'vehicle-location',
            cmd: 'create'
          }
        },
        validate: {
          body: Joi.array().items(Joi.object().keys({
            brand: Joi.string().required().default('LexCorp'),
            type: Joi.string().required().default('doomsday-device'),
            model: Joi.string().required('ZKX-557'),
            address: Joi.string().required().default('192.168.50.156'),
            friendlyName: Joi.string().optional().default('dd-device')
          }))
        }
      }
    ]
  };
})();
