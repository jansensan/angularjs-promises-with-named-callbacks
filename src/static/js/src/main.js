(function () {


  'use strict';


  angular
    .module('Main', [])
    .factory('firstModel', FirstModel)
    .factory('secondModel', SecondModel)
    .controller('mainController', MainController);


  function FirstModel($q) {
    // vars
    var _deferred,
        _promise,
        _timer = {};

    // public api
    var _model = {};
    _model.callPromise = callPromise;

    // private methods
    function resetPromise() {
      // memory management
      if (_deferred) _deferred = null;
      if (_promise) _promise = null;

      // reset
      _deferred = $q.defer();
      _promise = _deferred.promise;
    }

    function callPromise() {
      resetPromise();
      startDelay(returnPromise);
      return _promise;
    }

    function returnPromise() {
      clearDelay();
      randomizePromiseReturn();
    }

    function startDelay(callback) {
      clearDelay();
      _timer.delay = setTimeout(callback, 1250);
    }

    function clearDelay() {
      clearTimeout(_timer.delay);
      _timer.delay = null;
    }

    function randomizePromiseReturn() {
      var isResolved = (Math.random() < 0.5);
      if(isResolved) {
        _deferred.resolve();
      } else {
        _deferred.reject();
      }
    }

    return _model;
  }

  function SecondModel($log) {
    // public api
    var _model = {};
    _model.logPromiseResults = logPromiseResults;

    // private methods
    function logPromiseResults(message) {
      $log.info('Promise result: ' + message);
    }

    return _model;
  }

  function MainController(firstModel, secondModel) {
    // public api
    var _vm = this;
    _vm.testPromise = testPromise;
    _vm.isPromisePending = false;

    // private methods
    function testPromise() {
      setPromiseAsPending();

      var timestamp = new Date().toString();

      firstModel.callPromise()
      // option 1: use of anonymous functions. works, but not the aim.
        // .then(
        //   function () {
        //     onPromiseResolved(timestamp);
        //   },
        //   function () {
        //     onPromiseRejected(timestamp);
        //   }
        // );

      // option 2: naming functions in context. works, but less than ideal in our context.
        .then(
          function onPromiseResolved() {
            secondModel.logPromiseResults('this promise has been resolved on ' + timestamp);
          },
          function onPromiseRejected() {
            secondModel.logPromiseResults('this promise has been rejected on ' + timestamp);
          }
        )['finally'](setPromiseAsCompleted);
      
      // option 3: passing functions as variables. not good: doesn't work, missing the parameter.
        // .then(
        //   onPromiseResolved,
        //   onPromiseRejected
        // )['finally'](setPromiseAsCompleted);

      // option 4: calling functions with parameters. not good: both functions called.
        // .then(
        //   onPromiseResolved(timestamp),
        //   onPromiseRejected(timestamp)
        // )['finally'](setPromiseAsCompleted);

      // option 5: how do i pass the parameter to only be used when the function is called?
    }

    function setPromiseAsPending() {
      _vm.isPromisePending = true;
    }

    function setPromiseAsCompleted() {
      _vm.isPromisePending = false;
    }

    // event handlers
    function onPromiseResolved(timestamp) {
      secondModel.logPromiseResults('this promise has been resolved on ' + timestamp);
    }

    function onPromiseRejected(timestamp) {
      secondModel.logPromiseResults('this promise has been rejected on ' + timestamp);
    }
  }


})();