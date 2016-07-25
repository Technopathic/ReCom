angular.module('remark.controllers', [])

.controller('MainCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', '$mdBottomSheet', '$mdToast', '$timeout', 'mainData', function($scope, $state, $http, $rootScope, $mdDialog, $mdBottomSheet, $mdToast, $timeout, mainData) {

  $scope.mainOptions = mainData.data.options;

  $scope.user = {};

  $scope.notifyToast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom left')
        .hideDelay(3000)
    );
  };

  $scope.authDialog = function(ev) {
    $mdDialog.show({
        templateUrl: 'views/templates/auth.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        bindToController: true,
        controller: 'AuthCtrl'
      });
    };

    $scope.editProfileDialog = function(ev) {
      $mdDialog.show({
        templateUrl: 'views/templates/profileEdit-Dialog.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        bindToController: true,
        controller: 'ProfileEditCtrl'
      })
    };

    $scope.dialogClose = function() {
      $mdDialog.hide();
    };

    $scope.closeSheet = function(){
      $mdBottomSheet.hide();
    };

    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.signOut = function() {
     localStorage.removeItem('user');
     $rootScope.authenticated = false;
     $rootScope.currentUser = null;
     $rootScope.currentToken = null;
     $scope.notifyToast('Bye for now! Hope to see you again soon!');
   };

   $scope.showProfile = function(ev, id) {
     $mdDialog.show({
       templateUrl: 'views/templates/profile-Dialog.html',
       parent: angular.element(document.body),
       targetEvent: ev,
       clickOutsideToClose:true,
       bindToController: true,
       controller: 'ProfileCtrl',
       locals: {id: id}
     });
   };

   $scope.toggleSearch = function() {
     if($scope.showSearch == false)
     {
       $scope.showSearch = true;
     }
     else {
       $scope.showSearch = false;
     }
   };


   $scope.footerMenu = function() {
     $mdBottomSheet.show({
       templateUrl: 'footerMenu.html',
       escapeToClose: true,
       clickOutsideToClose: true,
       scope:$scope.$new(),
       locals: {mainChannels: $scope.mainChannels, mainPages: $scope.mainPages, mainOptions: $scope.mainOptions},
       controller:
        function($scope, $mdBottomSheet, mainChannels, mainPages, mainOptions) {
          $scope.mainChannels = mainChannels;
          $scope.mainPages = mainPages;
          $scope.mainOptions = mainOptions;
          $scope.closeSheet = function(){
            $mdBottomSheet.hide();
          };
        }
     });
   };

   $scope.userMenu = function() {
     $mdBottomSheet.show({
       templateUrl: 'userMenu.html',
       escapeToClose: true,
       clickOutsideToClose: true,
       locals: {editProfile: $scope.editProfileDialog, signOut: $scope.signOut},
       controller:
         function($scope, $mdBottomSheet, editProfile, signOut) {
           $scope.editProfileDialog = editProfile;
           $scope.signOut = signOut;
           $scope.closeSheet = function(){
             $mdBottomSheet.hide();
           };
         }
     });
   };




}])

.controller('AuthCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', '$mdToast', '$stateParams', function($scope, $state, $http, $rootScope, $mdDialog, $mdToast, $stateParams) {

  $scope.auth = {};
  $scope.resetData = {};
  $scope.passwordForgot = false;

  $scope.state = $state.current.name;


  $scope.notifyToast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom left')
        .hideDelay(3000)
    );
  };

  $scope.toggleReset = function()
  {
    if($scope.passwordForgot == false)
    {
      $scope.passwordForgot = true;
    }
    else if($scope.passwordForgot == true)
    {
      $scope.passwordForgot = false;
    }
  };

  $scope.authDialog = function(ev) {
    $mdDialog.show({
        templateUrl: 'views/templates/auth.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        bindToController: true,
        controller: 'AuthCtrl'
      });
    };

  $scope.doSignUp = function() {
    $http({
        method: 'POST',
        url: 'api/signUp',
        data: {email: $scope.auth.email, username: $scope.auth.username, password: $scope.auth.password},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 2)
      {
        $scope.notifyToast('That Email is already Registered.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('That Username is already Registered.');
      }
      else if(data == 5)
      {
        $scope.notifyToast('Registration is not allowed.');
      }
      else if(data == 6)
      {
        $scope.notifyToast('Success! Please check your email.');
        $mdDialog.hide();
      }
      else if(data == 1)
      {
        $scope.notifyToast('Successful Sign Up! Life is Great!');

        $http({
            method: 'POST',
            url: 'api/authenticate',
            data: {email: $scope.auth.email, password: $scope.auth.password},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(data) {
          if(data == 3)
          {
            $scope.notifyToast('Please check your email and confirm your account.');
          }
          else {
            var token = JSON.stringify(data.token);
            localStorage.setItem('token', token);
            $rootScope.currentToken = data.token;
            $http.get('api/authenticate/user?token='+ data.token)
            .success(function(data) {
              var user = JSON.stringify(data.user);

              localStorage.setItem('user', user);
              $rootScope.authenticated = true;
              $rootScope.currentUser = data.user;
              if(data.user.activated == 0)
              {
                $scope.notifyToast('Please confirm your account.');
              }
              else if(data.user.activated == 1)
              {
                $scope.notifyToast('Welcome, '+data.user.name+'!');
              }
            });
          }
        });
        $mdDialog.hide();
      }
    });
  };

  $scope.doAuth = function() {
    $http({
        method: 'POST',
        url: 'api/authenticate',
        data: {email: $scope.auth.email, password: $scope.auth.password},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .success(function(data) {
      if(data == 2)
      {
        $scope.notifyToast('Wrong Email!');
      }
      else if(data == 0)
      {
        $scope.notifyToast('Sorry, looks like you were banned.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('Please check your email and confirm your account.');
      }
      else
      {
        var token = JSON.stringify(data.token);
        localStorage.setItem('token', token);
        $rootScope.currentToken = data.token;
        $http.get('api/authenticate/user?token='+ data.token)
        .success(function(data) {
          var user = JSON.stringify(data.user);

          localStorage.setItem('user', user);
          $rootScope.authenticated = true;
          $rootScope.currentUser = data.user;

          if(data.user.activated == 0)
          {
            $scope.notifyToast('Please confirm your account.');
          }
          else if(data.user.activated == 1)
          {
            $scope.notifyToast('Welcome Back, '+data.user.name+'!');
          }
        });
        $mdDialog.hide();
      }
    }).error(function(data) {
      $scope.notifyToast('Login Incorrect.');
    });
  };

  $scope.resetPassword = function() {
    $http({
        method: 'POST',
        url: 'api/authenticate',
        data: {resetId: $scope.resetData.resetId},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .success(function(data) {
      if(data == 1)
      {
        $scope.notifyToast('A password reset form has been sent to your email.');
      }
      else if(data == 2)
      {
        $scope.notifyToast('We could not find that email address.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('We could not find that username.');
      }
      else if(data == 0)
      {
        $scope.notifyToast('Please enter a valid Email or Username.');
      }
    }).error(function() {
      $scope.notifyToast('This should not happen.');
    });
  };

  $scope.confirmReset = function() {
    $http({
        method: 'POST',
        url: 'api/confirmReset/'+$stateParams.token,
        data: {newPassword: $scope.resetData.newPassword, confirmPassword: $scope.resetData.confirmPassword},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .success(function(data) {
      if(data == 0)
      {
        $scope.notifyToast('Token not found.');
      }
      else if(data == 1)
      {
        $scope.notifyToast('Your password has been reset! You can now Sign In.');
        $state.go('auth');
      }
      else if(data == 2)
      {
        $scope.notifyToast('This reset form has expired after 24 hours.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('Your passwords do not match.');
      }
    });
  }

}])

.controller('ProfileEditCtrl', ['$scope', '$state', '$http', '$rootScope', '$mdDialog', '$mdToast', 'Upload', function($scope, $state, $http, $rootScope, $mdDialog, $mdToast, Upload) {

  $scope.profile = {
    displayName: $rootScope.currentUser.displayName,
    email: $rootScope.currentUser.email,
    avatar:$rootScope.currentUser.avatar,
    emailDigest: $rootScope.currentUser.emailDigest,
    emailReply: $rootScope.currentUser.emailReply
  };

  $scope.notifyToast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom left')
        .hideDelay(3000)
    );
  };

  $scope.dialogClose = function() {
    $mdDialog.hide();
  };

  $scope.profileEdit = function() {
    Upload.upload({
      url: 'api/updateProfile?token='+$rootScope.currentToken,
      data: {
        displayName: $scope.profile.displayName,
        email: $scope.profile.email,
        avatar: $scope.profile.avatar,
        password: $scope.profile.newPassword,
        confirmPassword: $scope.profile.confirmPassword,
        emailDigest: $scope.profile.emailDigest,
        emailReply: $scope.profile.emailReply
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 0)
      {
        $scope.notifyToast('Your passwords do not match.');
      }
      else if(data == 2)
      {
        $scope.notifyToast('Your file is over 2MB.');
      }
      else if(data != 0 && data != 2)
      {
        $scope.notifyToast('Successfully Updated Profile.');
        $rootScope.currentUser.displayName = data.displayName;
        $rootScope.currentUser.email = data.email;
        $rootScope.currentUser.avatar = data.avatar;
        $rootScope.currentUser.emailDigest = data.emailDigest;
        $rootScope.currentUser.emailReply = data.emailReply;
        $mdDialog.hide();
      }
    }).error(function(data) {
      if(data.error == "token_expired"){
        $rootScope.authenticated = false;
        $scope.notifyToast('Session expired. Please relog.');
      }
    });
  };

  $scope.deactivate = function() {
    $scope.deactivateWarning = true;
  };

  $scope.doDeactivate = function() {
    $http({
        method: 'POST',
        url: 'api/deactivateUser?token='+$rootScope.currentToken,
        data: res,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data) {
      localStorage.removeItem('user');
      $rootScope.authenticated = false;
      $rootScope.currentUser = null;
      $rootScope.currentToken = null;
      $scope.notifyToast('You have been deactivated. Good-bye.');
    }).error(function(data) {
      if(data.error == "token_expired")
      {
        $rootScope.authenticated = false;
        $scope.notifyToast('Session expired. Please relog.');
      }
    });
  };

}])


.controller('HomeCtrl', ['$scope', '$rootScope', '$state', '$http', '$mdBottomSheet', 'homeData', function($scope, $rootScope, $state, $http, $mdBottomSheet, homeData) {

  $scope.topics = homeData.data;
  $scope.featured = {};

  $scope.makeContent = function() {
    $mdBottomSheet.show({
      templateUrl: 'makeTopic.html',
      scope: $scope.$new(),
      escapeToClose: true,
      clickOutsideToClose: true,
      locals: {topicData: {data:""}, channelData: {data:""}, replyData:{data: ""}},
      controller: 'ContentSheetCtrl'
    });
  };

  $scope.loadMore = function()
  {
    if($state.current.name == 'main.home')
    {
      $scope.getTopics();
    }
    else if ($state.current.name == 'main.new')
    {
      $scope.getNew();
    }
  };

  $scope.getFeatured = function() {
    $http.jsonp('api/getFeatured?callback=JSON_CALLBACK')
    .success(function (data){
      $scope.featured = data;
    });
  };

  $scope.getTopics = function(channel = 0, count = 10, page = 1) {
    var p = $scope.topics.current_page + 1;
    $http.jsonp('api/getTopics/channel='+channel+'&count='+count+'?page='+p+'&callback=JSON_CALLBACK')
    .success(function (data){
      angular.forEach(data.data, function(value, key){
        $scope.topics.data.push(value);
      });
      $scope.topics.current_page = data.current_page;
    });
  };

  $scope.getNew = function(channel = 0, count = 10, page = 1) {
    var p = $scope.topics.current_page + 1;
    $http.jsonp('api/getNew/channel='+channel+'&count='+count+'?page='+p+'&callback=JSON_CALLBACK')
    .success(function (data){
      angular.forEach(data.data, function(value, key){
        $scope.topics.data.push(value);
      });
      $scope.topics.current_page = data.current_page;
    });
  };

  if($state.current.name == 'main.home')
  {
    $scope.getFeatured();
  }

}])

.controller('SearchCtrl', ['$scope', '$rootScope', '$state', '$http', function($scope, $rootScope, $state, $http) {

  $scope.searchData = {};

  $scope.doSearch = function() {
    $http({
        method: 'POST',
        url: 'api/search',
        data: { searchContent:$scope.searchData.searchContent },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data){
      if(data != 0 && data != 2)
      {
        $scope.topics = data;
      }
      else if(data == 0)
      {
        $scope.notifyToast("Enter your search.");
      }
      else if(data == 2)
      {
        $scope.notifyToast("Nothing found.");
      }
    });
  };

}])

.controller('DetailCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$mdBottomSheet', '$mdToast', '$mdDialog', 'hotkeys', 'detailData', 'replyData', function($scope, $rootScope, $state, $stateParams, $http, $mdBottomSheet, $mdToast, $mdDialog, hotkeys, detailData, replyData) {

  $scope.topic = detailData.data.topic;
  $scope.author = detailData.data.user;
  $scope.previousTopic = detailData.data.previousTopic;
  $scope.nextTopic = detailData.data.nextTopic;

  $scope.replies = replyData.data.replies;

  $scope.topicDelete = null;

  hotkeys.add({
    combo: 'left',
    description: 'Previous Page',
    callback: function() {
      $state.go('main.details', { topicSlug: $scope.previousTopic.topicSlug });
    }
  });

  hotkeys.add({
    combo: 'right',
    description: 'Next Page',
    callback: function() {
      $state.go('main.details', { topicSlug: $scope.nextTopic.topicSlug });
    }
  });

  $scope.getReplies = function(page = 1) {
    var p = $scope.replies.current_page + 1;
    $http.jsonp('api/getReplies/'+$scope.topic.topicSlug+'?page='+p+'&callback=JSON_CALLBACK')
    .success(function (data){
      angular.forEach(data.data, function(value, key){
        $scope.replies.data.push(value);
      });
      $scope.replies.current_page = data.current_page;
    });
  };

  $scope.makeReply = function(id) {
    $mdBottomSheet.show({
      templateUrl: 'views/templates/reply-Sheet.html',
      disableDrag:true,
      locals: {topicData: {data:""}, channelData: {data:""}, replyData: {data: $scope.topic.id, replyParent: id}},
      scope: $scope.$new(),
      controller: 'ContentSheetCtrl'
    });
  };

  $scope.editTopic = function(id) {
    $mdBottomSheet.show({
      templateUrl: 'editTopic.html',
      scope: $scope.$new(),
      escapeToClose: true,
      clickOutsideToClose: true,
      locals: {topicData: {data:$scope.topic}, channelData: {data:""}, replyData:{data:""}},
      controller: 'ContentSheetCtrl'
    });
  };

  $scope.editReply = function(reply, index, type) {
    $mdBottomSheet.show({
      templateUrl: 'editReply.html',
      disableDrag:true,
      scope: $scope.$new(),
      locals: {topicData: {data:""}, channelData: {data:""}, replyData:{data:reply, index:index, type:type}},
      controller: 'ContentSheetCtrl'
    });
  };

  $scope.deleteTopicConfirm = function(id) {
    $scope.topicDelete = id;
  };

  $scope.deleteTopic = function(id) {
    $http({
        method: 'POST',
        url: 'api/deleteTopic/'+id+'?token='+$rootScope.currentToken,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data){
      if(data == 1)
      {
        $scope.notifyToast('Topic Deleted.');
        $scope.topics.data.splice(index, 1);
      }
    });
  };

  $scope.deleteReply = function(id, index, type) {
    $http({
        method:'POST',
        url: 'api/deleteReply?token='+$rootScope.currentToken,
        data: {replyID: id},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
    .success(function(data){
      if(data == 1)
      {
        $scope.notifyToast('Reply Deleted.');
        if(type == 'reply')
        {
          $scope.replies.data.splice(index, 1);
        }
        else if(type == 'childReply')
        {
          angular.forEach($scope.replies.data, function(value) {
            value.childReplies.splice(index, 1);
          });
        }
      }
    });
  };

  $scope.setFeature = function(id) {
    $http.jsonp('api/setFeature/'+id+'?token='+$rootScope.currentToken+'&callback=JSON_CALLBACK')
    .success(function (data){
      if(data == 1)
      {
        $scope.notifyToast('Topic is now Featured!');
      }
      else if(data == 0)
      {
        $scope.notifyToast('Topic removed from Featured.');
      }
    });
  };

}])


.controller('ChannelsCtrl', ['$scope', '$state', '$http', '$mdBottomSheet', 'channelsData', function($scope, $state, $http, $mdBottomSheet, channelsData) {

  $scope.channels = channelsData.data;

  $scope.makeChannel = function() {
    $mdBottomSheet.show({
      templateUrl: 'makeChannel.html',
      scope: $scope.$new(),
      escapeToClose: true,
      clickOutsideToClose: true,
      locals: {topicData: {data: ""}, channelData: {data:""}, replyData:{data:""}},
      controller: 'ContentSheetCtrl'
    });
  };

}])

.controller('ChannelCtrl', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$mdBottomSheet', 'channelData', 'topicsData', function($scope, $rootScope, $state, $stateParams, $http, $mdBottomSheet, channelData, topicsData) {

  $scope.channel = channelData.data;
  $scope.topics = topicsData.data;

  $scope.channelDelete = null;

  $scope.editChannel = function(id) {
    $mdBottomSheet.show({
      templateUrl: 'editChannel.html',
      scope: $scope.$new(),
      escapeToClose: true,
      clickOutsideToClose: true,
      locals: {topicData: {data:""}, channelData: {data:$scope.channel}, replyData:{data:""}},
      controller: 'ContentSheetCtrl'
    });
  };

  $scope.deleteChannelConfirm = function(id) {
    $scope.channelDelete = id;
  };

  $scope.deleteChannel = function(id, index) {
    $http({
        method: 'POST',
        url: 'api/deleteChannel/'+id+'?token='+$rootScope.currentToken,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data){
      if(data == 1)
      {
        $scope.notifyToast('Channel Deleted.');
        $state.go('main.channels');
      }
      else if(data == 0) {
        $scope.notifyToast('You cannot delete this channel.');
      }
    });
  };

}])

.controller('UsersCtrl', ['$scope', '$rootScope', '$state', '$http', '$mdDialog', 'userData', function($scope, $rootScope, $state, $http, $mdDialog, userData) {

  $scope.users = userData.data.users;
  $scope.roles = userData.data.roles;

  var originatorEv = null;

  $scope.openMenu = function($mdOpenMenu, ev) {
    originatorEv = ev;
    $mdOpenMenu(ev);
  };

  $scope.deleteRole = function(id, index) {
    $http({
        method: 'POST',
        url: 'api/deleteRole/'+id+'?token='+$rootScope.currentToken,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 1)
      {
        $scope.roles.splice(index, 1);
        $scope.notifyToast('Role was Deleted.');
      }
      else {
        $scope.notifyToast('Role Cannot be Deleted.');
      }
    });
  };

  $scope.addRole = function(ev) {
    $mdDialog.show({
      templateUrl: 'addRole.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {userData: "", roleData: ""},
      scope: $scope.$new(),
      controller: 'userDialogCtrl',
    })
  };

  $scope.editRole = function(ev, id, index) {
    $mdDialog.show({
      templateUrl: 'editRole.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {userData: "", roleData: {id: id, index:index}},
      scope: $scope.$new(),
      controller: 'userDialogCtrl',
    })
  };

}])

.controller('ProfileCtrl', ['$scope', '$state', '$stateParams', '$http', 'id', function($scope, $state, $stateParams, $http, id) {

  $scope.user = {};
  var id = id;

  $scope.getProfile = function() {
    $http.jsonp('api/getUser/' + id + '?callback=JSON_CALLBACK')
    .success(function(data) {
      $scope.user = data;
    })
  };

  $scope.editProfile = function(ev, id) {
    $mdDialog.show({
      templateUrl: 'views/templates/profileEdit-Dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {userData: {id:id, index:index}, roleData: ""},
      scope: $scope.$new(),
      controller: 'userDialogCtrl',
    })
  };

  $scope.setRole = function(ev, id) {
    $mdDialog.show({
      templateUrl: 'setRole.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      locals: {userData: {id:id, index:index}, roleData: ""},
      scope: $scope.$new(),
      controller: 'userDialogCtrl',
    })
  };

  $scope.banUser = function(id) {
    $http.jsonp('api/banUser/'+id+'?token='+$rootScope.currentToken+'&callback=JSON_CALLBACK')
    .success(function (data){
      if(data == 1)
      {
        $scope.notifyToast('User was banned.');
      }
      else if (data == 2)
      {
        $scope.notifyToast('User was unbanned.');
      }
      else if(data == 0)
      {
        $scope.notifyToast('User Cannot be banned.');
      }
    });
  };

  $scope.deleteUser = function(id, index) {
    $http({
        method: 'POST',
        url: 'api/deleteUser/'+id+'?token='+$rootScope.currentToken,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 1)
      {
        $scope.users.splice(index, 1);
        $scope.notifyToast('User was Deleted.');
      }
      else {
        $scope.notifyToast('User Cannot be Deleted.');
      }
    });
  };


  $scope.getProfile();
}])

.controller('userDialogCtrl', ['$scope', '$rootScope', '$state', '$http', '$mdDialog', '$mdToast', 'Upload', 'userData', 'roleData', function($scope, $rootScope, $state, $http, $mdDialog, $mdToast, Upload, userData, roleData) {

  $scope.user = {};
  $scope.role = {};
  $scope.profile = {};

  $scope.notifyToast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom left')
        .hideDelay(3000)
    );
  };

  $scope.dialogClose = function() {
    $mdDialog.hide();
  };



  $scope.doAddRole = function() {
    var res = {roleName: $scope.role.name, roleDesc: $scope.role.description};
    var res = JSON.stringify(res);

    $http({
        method: 'POST',
        url: 'api/addRole?token='+$rootScope.currentToken,
        data: res,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data != 0 && data != 403)
      {
        $scope.roles.push(data);
        $scope.notifyToast('Role Added!');
        $mdDialog.hide();
      }
      else if(data == 0)
      {
        $scope.notifyToast('Please name your role.');
      }
    });
  };

  $scope.getRole = function() {
    $http.jsonp('api/editRole/'+roleData.id+'?token='+$rootScope.currentToken+'&callback=JSON_CALLBACK')
    .success(function (data){
      $scope.role = data;
    });
  };

  $scope.doRoleEdit = function() {
    $http({
        method: 'PUT',
        url: 'api/updateRole/'+roleData.id+'?token='+$rootScope.currentToken,
        data: {roleName: $scope.role.roleName, roleDesc: $scope.role.roleDesc},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data != 0 && data != 403)
      {
        $scope.notifyToast('Role Updated');
        $scope.roles.splice(roleData.index, 1);
        $scope.roles.splice(roleData.index, 0, data);
        $scope.dialogClose();
      }
      else if(data == 0)
      {
        $scope.notifyToast('Please enter a role name.');
      }
    });
  };

  $scope.getProfile = function() {
    $http.jsonp('api/editUser/'+userData.id+'?token='+$rootScope.currentToken+'&callback=JSON_CALLBACK')
    .success(function (data){
      $scope.profile = data;
    });
  };

  $scope.profileEdit = function() {
    Upload.upload({
      url: 'api/updateProfile/'+userData.id+'?token='+$rootScope.currentToken,
      data: {
        displayName: $scope.profile.displayName,
        email: $scope.profile.email,
        avatar: $scope.profile.avatar,
        password: $scope.profile.newPassword,
        confirmPassword: $scope.profile.confirmPassword,
        emailReply: $scope.profile.emailReply,
        emailDigest: $scope.profile.emailDigest
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 0)
      {
        $scope.notifyToast('Your passwords do not match.');
      }
      else if(data != 0)
      {
        $scope.notifyToast('Successfully Updated Profile.');
        $scope.users.splice(userData.index, 1);
        $scope.users.splice(userData.index, 0, data);
        $mdDialog.hide();
      }
    });
  };

  $scope.doSetRole = function()
  {
    $http({
        method: 'PUT',
        url: 'api/setRole/'+userData.id+'?token='+$rootScope.currentToken,
        data: {roleID: $scope.profile.role},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data != 2 && data != 0 && data != 403)
      {
        $scope.notifyToast('Role was set.');
        $scope.users.splice(userData.index, 1);
        $scope.users.splice(userData.index, 0, data);
        $scope.dialogClose();
      }
      else if(data == 0)
      {
        $scope.notifyToast('Role not found.');
      }
      else if(data == 2)
      {
        $scope.notifyToast('Cannot change role.');
      }
    });
  };


  if(roleData != "")
  {
    $scope.getRole();
  }
  else if(userData != "")
  {
    $scope.getProfile();
  }

}])

.controller('NotifyCtrl', ['$scope', '$state', '$stateParams', '$http', '$timeout', function($scope, $state, $stateParams, $http, $timeout) {

  $scope.notifyType = $stateParams.notifyType;
  $scope.notifyToken = $stateParams.token;
  $scope.notifyMessage = null;

  $scope.confirmSubscription = function() {
    $http({
        method: 'POST',
        url: 'api/confirmSubscription',
        data: {token: $scope.notifyToken},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 0)
      {
        $scope.notifyMessage = "You're already a follower."
      }
      else if(data == 1)
      {
        $scope.notifyMessage = "Thank you for Following!";
      }
      else if(data == 2)
      {
        $scope.notifyMessage = "Token not found.";
      }
    });
  };

  $scope.confirmToken = function() {
    $http({
        method: 'POST',
        url: 'api/confirmToken',
        data: {token: $scope.notifyToken},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 0)
      {
        $scope.notifyMessage = "You're already activated."
      }
      else if(data == 1)
      {
        $scope.notifyMessage = "Thanks for signing up!";
      }
      else if(data == 2)
      {
        $scope.notifyMessage = "Token not found.";
      }
    });
  };

  if($scope.notifyType == "confirmSubscription")
  {
    $scope.confirmSubscription();
  }
  else if($scope.notifyType == "confirmation")
  {
    $scope.confirmSubscription();
  }


  $timeout(function() {
      $state.go('main.home');
  },10000);
}])

.controller('ContentSheetCtrl', ['$scope', '$rootScope', '$stateParams', '$http', '$mdBottomSheet', '$mdToast', '$mdSidenav', 'Upload', 'topicData', 'channelData', 'replyData', function($scope, $rootScope, $stateParams, $http, $mdBottomSheet, $mdToast, $mdSidenav, Upload, topicData, channelData, replyData) {

  $scope.topicData = {
    topicID: topicData.data.id,
    topicTitle: topicData.data.topicTitle,
    topicBody: topicData.data.topicBody,
    topicChannel: topicData.data.topicChannel
  };
  $scope.channelData = {
    channelID: channelData.data.id,
    channelTitle: channelData.data.channelTitle,
    channelDesc:channelData.data.channelDesc,
    channelImg: channelData.data.channelImg
  };
  $scope.replyData = {
    replyID: replyData.data.id,
    replyBody: replyData.data.replyBody,
    parentID: replyData.replyParent
  };

  $scope.channelList = {};

  $scope.displayFull = false;


  $scope.fullSheet = function() {
    if($scope.displayFull == false)
    {
      $scope.displayFull = true;
    }
    else
    {
      $scope.displayFull = false;
    }
  };

  $scope.openLeftMenu = function() {
    $mdSidenav('left').toggle();
  };


  $scope.createTopic = function() {
    $http.jsonp('api/createTopic?token='+$rootScope.currentToken+'&callback=JSON_CALLBACK')
    .success(function (data){
      $scope.channelList = data;
      if(channelData != "")
      {
        angular.forEach(data, function(value, key) {
          if(channelData.id == value.id)
          {
            $scope.channelData.channelID = value.id;
            $scope.channelData.channelTitle = value.channelTitle;
            $scope.channelData.channelDesc = value.channelDesc;
            $scope.channelData.channelImg = value.channelImg;
          }
        });
      }
    });
  };

  $scope.closeSheet = function(){
    $mdBottomSheet.hide();
  };

  $scope.notifyToast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom left')
        .hideDelay(3000)
    );
  };

  $scope.doChannel = function() {
    if($scope.channelData.channelImg === undefined)
    {
      $scope.channelData.channelImg = "";
    }
    Upload.upload({
      url: 'api/postChannel?token='+$rootScope.currentToken,
      data: {
        channelTitle: $scope.channelData.channelTitle,
        channelDesc: $scope.channelData.channelDesc,
        channelImg: $scope.channelData.channelImg
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data != 0)
      {
        $scope.notifyToast('Successfully Posted Channel.');
        $scope.channels.push(data);
        $scope.closeSheet();
      }
      else if(data == 0)
      {
        $scope.notifyToast('Please enter a Title for your Channel.');
      }
    });
  };

  $scope.doTopic = function(status) {
    $http({
      method:'POST',
      url: 'api/postTopic?token='+$rootScope.currentToken,
      data: {
        "topicTitle": $scope.topicData.topicTitle,
        "topicBody": $scope.topicData.topicBody,
        "topicChannel": $scope.topicData.topicChannel
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 0)
      {
        $scope.notifyToast('Please enter a Title, Body, and Channel.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('The character limit is 1500.');
      }
      else if(data == 4)
      {
        $scope.notifyToast('Over the limit on Media objects.');
      }
      else if(data == 5)
      {
        $scope.notifyToast('You are posting too many topics. Slow down.');
      }
      else {
        $scope.notifyToast('Successfully Posted Topic.');
        $scope.topics.data.unshift(data);
        $scope.closeSheet();
      }
    });
  };

  $scope.updateTopic = function(id, status) {
    $http({
      method:'POST',
      url: 'api/updateTopic/'+id+'?token='+$rootScope.currentToken,
      data: {
        topicTitle: $scope.topicData.topicTitle,
        topicBody: $scope.topicData.topicBody,
        topicChannel: $scope.topicData.topicChannel
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 0)
      {
        $scope.notifyToast('Please enter a Title, Body, and Channel.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('The character limit is 1500.');
      }
      else if(data == 4)
      {
        $scope.notifyToast('Over the limit on Media objects.');
      }
      else if(data == 5)
      {
        $scope.notifyToast('You are posting too many topics. Slow down.');
      }
      else {
        $scope.notifyToast('Successfully Updated Topic.');
        $scope.topics.data.splice(topicData.index, 1);
        $scope.topics.data.splice(topicData.index, 0, data);
        $scope.closeSheet();
      }
    });
  };

  $scope.updateChannel = function(id) {
    if($scope.channelData.channelImg === undefined)
    {
      $scope.channelData.channelImg = "";
    }
    Upload.upload({
      url: 'api/updateChannel/'+id+'?token='+$rootScope.currentToken,
      data: {
        channelTitle: $scope.channelData.channelTitle,
        channelDesc: $scope.channelData.channelDesc,
        channelImg: $scope.channelData.channelImg
      },
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data != 0 && data != 403)
      {
        $scope.notifyToast('Successfully Updated Channel.');
        $scope.$parent.channel = data;
        $scope.closeSheet();
      }
      else if(data == 0)
      {
        $scope.notifyToast('Please enter a Title for your Channel.');
      }
    });
  };

  $scope.doReply = function() {
    console.log($scope.replyData.parentID);
    $http({
        method: 'POST',
        url: 'api/postReply?token='+$rootScope.currentToken,
        data: {topicID: $scope.topic.id, replyBody: $scope.replyData.replyBody, parentID: $scope.replyData.parentID},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data == 2)
      {
        $scope.notifyToast('Your reply will be checked for approval.');
      }
      else if(data == 0){
        $scope.notifyToast('Your reply was empty.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('The reply limit is 500 characters.');
      }
      else if(data == 4)
      {
        $scope.notifyToast('You can only have 1 image, 1 video, and 1 link.');
      }
      else if(data == 5)
      {
        $scope.notifyToast("Slow down! You've made 5 replies in an hour.");
      }
      else if(data == 6)
      {
        $scope.notifyToast("You cannot reply to this child post.");
      }
      else if(data == 7)
      {
        $scope.notifyToast("Replies are not allowed on this topic.");
      }
      else {
        $scope.notifyToast('Successfully Posted Reply.');
        if(data.replyParent == 0)
        {
          $scope.replies.data.push(data);
        }
        else
        {
          angular.forEach($scope.replies.data, function(value) {
            if(value.id == data.replyParent)
            {
              value.childReplies.push(data);
              value.childCount = Number(value.childCount) + 1;
            }
          });
        }
        $scope.closeSheet();
      }
    }).error(function(data) {
      if(data.error == "token_expired"){
        $rootScope.authenticated = false;
        $scope.notifyToast('Session expired. Please relog.');
      }
    });
  };

  $scope.updateReply = function() {
    $http({
        method: 'PUT',
        url: 'api/updateReply/'+replyData.data.id+'?token='+$rootScope.currentToken,
        data: {replyBody: $scope.replyData.replyBody},
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data){
      if(data != 0 && data != 403)
      {
        $scope.notifyToast('Successfully Updated Reply.');
        if(replyData.type == 'reply')
        {
          $scope.replies.data.splice(replyData.index, 1);
          $scope.replies.data.splice(replyData.index, 0, data);
        }
        else if(replyData.type == 'childReply')
        {
          angular.forEach($scope.replies.data, function(value) {
            if(value.id == data.replyParent)
            {
              value.childReplies.splice(replyData.index, 1);
              value.childReplies.splice(replyData.index, 0, data);
            }
          });
        }
        $scope.closeSheet();
      }
      else if(data == 0)
      {
        $scope.notifyToast('Please enter a reply.');
      }
    });
  };

  $scope.createTopic();

}])

.controller('InstallCtrl', ['$scope', '$state', '$http', '$mdToast', 'installDep', function($scope, $state, $http, $mdToast, installDep) {

  if(installDep.data != 0)
  {
    $state.go('home');
  }

  $scope.installData = {};

  $scope.notifyToast = function(message) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(message)
        .position('bottom left')
        .hideDelay(3000)
    );
  };

  $scope.doInstall = function() {
    $http({
        method: 'POST',
        url: 'storeAPIInstall',
        data: {
          databaseUser:$scope.installData.databaseUser,
          databaseName:$scope.installData.databaseName,
          databasePassword:$scope.installData.databasePassword,
          siteName:$scope.installData.siteName,
          adminName:$scope.installData.adminName,
          adminEmail:$scope.installData.adminEmail,
          adminPassword:$scope.installData.adminPassword,
          passwordConfirm:$scope.installData.passwordConfirm
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data){
      if(data == 0)
      {
        $scope.notifyToast('Please fill out all of the fields.');
      }
      else if(data == 2)
      {
        $scope.notifyToast('Could not connect to the database.');
      }
      else if(data == 3)
      {
        $scope.notifyToast('Passwords do not match.');
      }
      else if(data == 4)
      {
        $scope.notifyToast('Email is not valid.');
      }
      else if(data == 5)
      {
        $scope.notifyToast('Passwords cannot contain spaces.');
      }
      else if(data == 6)
      {
        $scope.notifyToast('Username cannot contain spaces or special characters.');
      }
      else {
        $scope.notifyToast('Success!');
        $http({
            method: 'POST',
            url: 'installAPIDB',
            data: {adminName:data.adminName, adminPassword:data.adminPassword, adminEmail:data.adminEmail, siteName:data.siteName},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data) {
          if(data == 1)
          {
            $scope.notifyToast('ReCom has been Successfully Installed!');
            $state.go('main.home');
          } else {
            $scope.notifyToast('This should not happen. Get help.');
          }
        });
      }
    })
  };

}])
