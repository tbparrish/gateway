(function(){
  var _ = require('lodash');
  var joiToJson = require('joi-to-json-schema');

  function convertPath(path) {
    return _.map(_.split(path, '/'), function(token) {
      if (token.indexOf(':') > -1) {
        return '{' + token.slice(1) + '}';
      }
      return token;
    }).join('/');
  }

  function schemaName(path, method) {
    var tokens = _.split(path, '/');
    var name = tokens[tokens.length - 1];
    if (tokens[tokens.length - 1].indexOf('{') === 0) {
      name = tokens[tokens.length - 2];
    }
    return _.capitalize(method.toLowerCase()) + _.capitalize(name);
  }

  function swaggerGenerateConf(config) {
    var swaggerJson = _.get(config, 'swagger');
    var paths = {};
    _.forEach(_.get(config, 'endpoints'), function(endpoint) {

      var newEndpoint = _.omit(endpoint, ['route', 'config', 'validate', 'config']);
      var path = convertPath(_.get(endpoint, 'route.path'));

      function convertParameters(obj, type) {
        var params = [];
        if (_.isObject(obj)) {
          if (_.has(obj, 'isJoi') === false) {
            _.forEach(_.keys(obj), function(key) {
              var param = joiToJson(obj[key]);
              param.in = type;
              if (type === 'body') {
                param.schema = {
                  type: _.get(param, 'type')
                };
              }
              param.name = key;
              params.push(param);
            });
          } else {
            var jsonParams = joiToJson(obj);
            if (type === 'body') {
              var name = schemaName(path, _.get(endpoint, 'route.method'));
              var bodyObj = {
                name: 'body',
                in : 'body'
              };
              var definition = {};
              if(_.get(jsonParams, 'type') === 'array') {
                _.set(bodyObj, 'schema.type', 'array');
                jsonParams = _.get(jsonParams, 'items[0]');
                _.set(bodyObj, 'schema.items.$ref', '#/definitions/' + name);
              }
              else {
                _.set(bodyObj, 'schema.$ref', '#/definitions/' + name);
              }
              definition[name] = jsonParams;
              _.set(swaggerJson, 'definitions', _.merge({}, _.get(swaggerJson, 'definitions'), definition));
              params.push(bodyObj);
            }
          }
        }
        return params;
      }

      newEndpoint.parameters = [];
      newEndpoint.parameters = newEndpoint.parameters.concat(convertParameters(_.get(endpoint, 'validate.params'), 'path'));
      if(_.has(endpoint, 'validate.bodySwagger')) {
        newEndpoint.parameters = newEndpoint.parameters.concat(convertParameters(_.get(endpoint, 'validate.bodySwagger'), 'body'));
      }
      else {
        newEndpoint.parameters = newEndpoint.parameters.concat(convertParameters(_.get(endpoint, 'validate.body'), 'body'));
      }
      newEndpoint.parameters = newEndpoint.parameters.concat(convertParameters(_.get(endpoint, 'validate.query'), 'query'));
      var pathObject = paths[path] || {};
      pathObject[_.get(endpoint, 'route.method').toLowerCase()] = newEndpoint;
      _.set(paths, path, pathObject);
    });
    _.set(swaggerJson, 'paths', paths);
    return swaggerJson;
  }

  module.exports = swaggerGenerateConf;
})();
