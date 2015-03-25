angular.module('loginApp', ['facebook'])
  .config([
    'FacebookProvider',
    function(FacebookProvider) {
     var myAppId = '<FACEBOOK APP ID>';
     FacebookProvider.init(myAppId);
     }
  ])
  
  .controller('loginController', ['$scope','Facebook','$http','$timeout','$window', function($scope, Facebook, $http, $timeout,$window) {
      $scope.user = {};
      $scope.logged = false;
      $scope.byebye = false;
      $scope.salutation = false;
      $scope.html = '';
      $scope.noteCollection = '';
      $scope.noteValue = '';
      var collectionName = '';

      $scope.maxId = 0;
      if(document.getElementsByTagName("a").length > 0) {
        maxId = document.getElementsByTagName("a")[(document.getElementsByTagName("a")).length - 1].id;
      }

      $scope.createNote = function(){
        ++$scope.maxId;
        var notesHtml = '<li id="li_' + $scope.maxId + '"><section><a href="#" ng-click="deleteNote($event)"><img id="' + $scope.maxId + '" src="images/deleteNote.png" alt="Delete Note"></a><a href="#" ng-click="saveNote($event)"><img id="' + $scope.maxId + '" src="images/saveNote.png" alt="Save Note"></a><textarea ng-init=text_' + $scope.maxId + '="' + $scope.noteValue + '" ng-model=text_' + $scope.maxId + ' id=text_' + $scope.maxId + '></textarea></section></li>';
        $scope.notesHtml= notesHtml;
        $scope.createNotes();
      };

      $scope.loadNotes = function(note_id, note_data){
        $scope.maxId = note_id; 
        var notesHtml = '<li id="li_' + note_id + '"><section><a href="#" ng-click="deleteNote($event)"><img id="' + note_id + '" src="images/deleteNote.png" alt="Delete Note"></a><a href="#" ng-click="saveNote($event)"><img id="' + note_id + '" src="images/saveNote.png" alt="Save Note"></a><textarea id=text_' + note_id + '>' + note_data + '</textarea></section></li>';
        $scope.notesHtml= notesHtml;
        $scope.createNotes();
      };

      $scope.saveNote = function(item){
        var elem = angular.element(item.srcElement);
        var id = elem.attr('id');
        var noteData = document.getElementById("text_" + id).value
        $http.post("<WEB SERVICE URL>/saveNote", {"collectionName" : $scope.noteCollection.toString(), "noteId" : id.toString(), "noteData" : noteData.toString()})
        .success(function(result) {
          alert("Note Saved Successfully!!!");
        })
      };

      $scope.deleteNote = function(item) {
        var elem = angular.element(item.srcElement);
        var id = elem.attr('id');
        var li = document.getElementById("li_" + id);
        ul.removeChild(li);
        ul = document.getElementById("ul");
        $scope.html = ul.innerHTML;
        $scope.deleteNotes();

        $http.post("<WEB SERVICE URL>/deleteNote", {"collectionName" : $scope.noteCollection.toString(), "noteId" : id.toString(), "noteData" : ""})
        .success(function(result) {
          alert("Note Deleted Successfully!!!");
        })
      };
      
      $scope.$watch(
        function() {
          return Facebook.isReady();
        },
        function(newVal) {
          if (newVal)
            $scope.facebookReady = true;
        }
      );
      
      var userIsConnected = false;
      
      $scope.IntentLogin = function() {
        if(!userIsConnected) {
          $scope.login();
        }
      };
      
      $scope.login = function() {
       Facebook.login(function(response) {
        if (response.status == 'connected') {
            $scope.logged = true;
            $scope.me();
          }
        });
      };
       
      $scope.me = function() {
        Facebook.api('/me', function(response) {
          $scope.$apply(function() {
            $scope.user = response;
            $scope.noteCollection = $scope.user.first_name + "_" + $scope.user.last_name + "_" + $scope.user.id;

            $http.post("<WEB SERVICE URL>/getNotes", {"collectionName" : $scope.noteCollection.toString(), "noteId" : "", "noteData" : ""})
            .success(function(result) {
              for(var res in result){
                $scope.loading = true;
                $scope.loadNotes(result[res].NoteID, result[res].NoteData);
              }
              $scope.loading = false;
            })
          });
        });
      };
      
      $scope.logout = function() {
        Facebook.logout(function() {
          $scope.$apply(function() {
            $window.location.reload();
            $scope.user   = {};
            $scope.logged = false;
          });
        });
      };
      
      $scope.$on('Facebook:statusChange', function(ev, data) {
        if (data.status == 'connected') {
          $scope.$apply(function() {
            $scope.salutation = true;
            $scope.byebye     = false;    
          });
        } else {
          $scope.$apply(function() {
            $scope.salutation = false;
            $scope.byebye     = true;
            
            // Dismiss byebye message after two seconds
            $timeout(function() {
              $scope.byebye = false;
            }, 2000)
          });
        }
      });     
    }
  ])
  
  .directive('dynamic', function($compile) {
    return {
      restrict: 'A',
      replace: true,
      transclude : true,
      link: function(scope, ele, attrs) {
        scope.$watch(attrs.dynamic, function(html) {
          ele.html(html);
          $compile(ele.contents())(scope);
        });

        scope.createNotes = function() {
          scope.html = scope.html + scope.notesHtml;
        };

        scope.deleteNotes = function() {
          scope.html = scope.html;
        }
      }
    };
  })
  
