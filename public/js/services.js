angular.module('remark.services', [])

.service('installStart', ['$http', function($http) {

  this.getInstall = function(query) {
    return $http.jsonp('getAPIInstall?callback=JSON_CALLBACK');
  };

}])

.service('mainStart', ['$http', function($http) {

  this.getMain = function(query) {
    return $http.jsonp('api/main?callback=JSON_CALLBACK', {ignoreLoadingBar: true});
  };

}])

.service('homeStart', ['$http', function($http) {

  this.getTopics = function(query) {
    return $http.jsonp('api/getTopics/channel=0&count=25?page=1&callback=JSON_CALLBACK')
  };

  this.getNew = function(query) {
    return $http.jsonp('api/getNew/channel=0&count=25?page=1&callback=JSON_CALLBACK')
  };

}])

.service('detailStart', ['$http', function($http) {

  this.getDetail = function(query) {
    return $http.jsonp('api/getDetail/' + query + '?callback=JSON_CALLBACK');
  };

  this.getReplies = function(query) {
    return $http.jsonp('api/getReplies/' + query + '?callback=JSON_CALLBACK');
  };

}])

.service('channelsStart', ['$http', function($http) {

  this.getChannels = function(query) {
    return $http.jsonp('api/getChannels?callback=JSON_CALLBACK');
  };

}])

.service('channelStart', ['$http', function($http) {

  this.getChannel = function(query) {
    return $http.jsonp('api/getChannel/' + query + '?callback=JSON_CALLBACK');
  };

  this.getTopics = function(query) {
    return $http.jsonp('api/getTopics/channel='+query+'&count=25?page=1&callback=JSON_CALLBACK')
  };

}])

.service('userStart', ['$http', '$rootScope', function($http, $rootScope) {

  this.getUsers = function(query) {
    return $http.jsonp('api/getUsers?callback=JSON_CALLBACK');
  };

}])
