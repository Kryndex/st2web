'use strict';
angular.module('main')
  .config(function ($stateProvider) {

    // TODO: Fix order. Rules should go second in main menu.
    $stateProvider
      .state('rules', {
        abstract: true,
        url: '/rules',
        icon: 'st2-icon__rules',
        controller: 'st2RulesCtrl',
        templateUrl: 'apps/st2-rules/template.html',
        title: 'Rules',
        position: 3
      })
      .state('rules.list', {
        url: ''
      })
      .state('rules.general', {
        url: '/{id:\\w+}/general?edit'
      })
      .state('rules.code', {
        url: '/{id:\\w+}/code?edit'
      })

      ;

  });

angular.module('main')

  // List rules
  .controller('st2RulesCtrl', function ($scope, st2api, st2LoaderService) {

    $scope.filter = '';

    st2LoaderService.reset();
    st2LoaderService.start();

    var pRulesList = st2api.client.rules.list().then(function (result) {
      st2LoaderService.stop();
      return result;
    }).catch(function (err) {
      $scope.rules = [];
      $scope.error = true;

      console.error('Failed to fetch the data: ', err);
      st2LoaderService.stop();

      $scope.$apply();
    });

    var listUpdate = function () {
      pRulesList && pRulesList.then(function (list) {
        $scope.rules = list && _(list)
          .filter(function (e) {
            return e.name.indexOf($scope.filter) > -1;
          })
          .value();

        $scope.$apply();
      });
    };

    $scope.$watch('filter', listUpdate);

    $scope.loadTriggerSuggestions = function () {
      return st2api.client.triggerTypes.list().then(function (triggerTypes) {
        $scope.triggerSuggestionSpec = {
          enum:_.map(triggerTypes, function (trigger) {
            return {
              name: trigger.ref,
              description: trigger.description
            };
          }),
          name: 'name'
        };
        $scope.$apply();
      });
    };

    $scope.loadActionSuggestions = function () {
      return st2api.client.actionOverview.list().then(function (actions) {
        $scope.actionSuggestionSpec = {
          enum:_.map(actions, function (action) {
            return {
              name: action.ref,
              description: action.description
            };
          }),
          name: 'name'
        };
        $scope.$apply();
      });
    };

    $scope.loadTrigger = function (ref) {
      if (!ref) {
        return;
      }

      return st2api.client.triggerTypes.get(ref).then(function (triggerTypes) {
        $scope.triggerSchema = triggerTypes.parameters_schema.properties;
        $scope.$apply();
      });
    };

    $scope.loadAction = function (ref) {
      if (!ref) {
        return;
      }

      return st2api.client.actionOverview.get(ref).then(function (action) {
        $scope.actionSchema = action.parameters;
        $scope.$apply();
      });
    };

    $scope.loadRule = function (id) {
      var promise = id ? st2api.client.rules.get(id) : pRulesList.then(function (actions) {
        return _.first(actions);
      });

      return promise.then(function (rule) {
        if (rule) {
          $scope.rule = rule;
          $scope.$apply();
        }
      });
    };

    $scope.$watch('$root.state.params.id', $scope.loadRule);

    $scope.$watch('rule.trigger.type', $scope.loadTrigger);
    $scope.$watch('rule.action.ref', $scope.loadAction);

    $scope.edit = function () {
      $scope.loadTriggerSuggestions();
      $scope.loadActionSuggestions();
      $scope.$root.go({id: $scope.rule.id, edit: true});
    };

    $scope.submit = function () {
      st2api.client.rules.edit($scope.rule).then(function (rule) {
        $scope.rule = rule;
        $scope.$root.go({id: rule.id, edit: undefined});
      }).catch(function (error) {
        console.error(error);
      });
    };

    $scope.cancel = function () {
      $scope.loadRule($scope.rule.id);
      $scope.$root.go({id: $scope.rule.id, edit: undefined});
    };

  })

  ;
