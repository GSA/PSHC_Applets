/***** TEST BED APP CODE  ***/
/*
document.addEventListener('DOMContentLoaded', function() {
   setTimeout(function(){initApp();},1000);
});
*/

/***** TEST BED APP CODE ENDS ******/



/***** HALLWAY APP CODE  ******/
initApp();
/***** HALLWAY APP CODE ENDS ******/

// Bootstrap the CALC App
function initApp(){
  var element = angular.element(document.getElementById('my-app'));
  angular.element(element).ready(function() {
    var hallway = angular.element(document.getElementById('hallway-app'));
    element.injector().invoke(function($compile) {
      $scope = element.scope();
      var httpService = element.injector().get('$http');
      var timeoutService = element.injector().get('$timeout');
      registerScopeAndServices($scope, httpService, timeoutService);
      $compile(hallway.contents())($scope);
    });
  });  
}


// Registring additional services to use in the APP
var timeout;
var http;

function registerScopeAndServices($scope, httpService, timeoutService){  

  var theUrl = 'https://api.data.gov/gsa/calc/rates/?format=json&histogram=12&sort=current_price&query_type=match_all&min_experience=0&max_experience=45&contract-year=current&experience_range=0%2C45';
  
  $scope.query_type="match_all";
  $scope.searchText = "";
  $scope.URL = "";
  $scope.selected = undefined;
  $scope.labor_category = "";

  $scope.sortType     = 'current_price'; // set the default sort type
  $scope.sortDescending  = false;  // set the default sort order
  
  //$scope.newRates = [];

  timeout = timeoutService;
  http = httpService;

  getRatesByDefaultSearch($scope);
  registerClickEvents($scope);

  $scope.hoverIn = function(){
        this.years = true;
    };

  $scope.hoverOut = function(){
        this.years = false;
    };
  
  $scope.fetchCategories = function(searchStr){
    console.log("Fetch categories, searchstr is " + searchStr);
    return getCategoriesByKeyword($scope, searchStr);
  };

  $scope.fetchCategorySelected = function($item, $model, $label, $event){
    console.log($scope.searchText);
    console.log($scope.labor_category);
    var category_search = document.getElementById("category_search").value;
    

    console.log(category_search);
     $scope.searchText = replaceSearchString($scope.labor_category, category_search);
     $scope.labor_category = $scope.searchText;
     getRatesByKeywordSearch($scope.searchText, $scope);
    /*if($scope.searchText == $scope.labor_category){
      $scope.searchText = $scope.searchText + ', ';
    }else if($scope.searchText == ''){
      $scope.searchText = $scope.labor_category + ', ';
    }else{
      $scope.searchText = $scope.searchText + $scope.labor_category + ', ';
      
    }
    $scope.labor_category = $scope.searchText;
    */
  };

  $scope.processCategorySelectionKeyEvents = function($event){
    var keyCode = $event.which || $event.keyCode;
    if (keyCode === 13) {
        $scope.searchText = document.getElementById("category_search").value;
        getRatesByKeywordSearch($scope.searchText, $scope);
    }

  };

  $scope.sortByCategoryKeyEvent = function($event, sortType){
    var keyCode = $event.which || $event.keyCode;

    if (keyCode === 13) {
        $scope.sortRates(sortType);
    }

  };


}

function replaceSearchString(labor_category, category_search){
  var catArr = category_search.split(",");
  catArr.splice(catArr.length - 1, 1, labor_category);
  cat = "";
  catArr.forEach(function(item, index){
    if(index == catArr.length -1 && index > 1)
      cat = cat + item;
    else
      cat = cat + item + ", ";
  });
  return cat;
}

function registerClickEvents($scope){
  $scope.doClick = function(val) {
            console.log('you clicked on "' + val + '"');
            switch (val) {

                case 'about':
                  alert('This is a magic article implemenation of the Professional Services CALC tool.');
                  break;

                case 'search':
                  getRatesByKeywordSearch($scope.labor_category, $scope);
                  break;

                case 'clear':                  
                  console.log($scope.query_type);
                  document.getElementById("query_type_match_all").checked = true;
                  $scope.query_type = "match_all";
                  $scope.sortType = "current_price";
                  $scope.sortDescending = false;
                  $scope.labor_category = "";
                  getRatesByDefaultSearch($scope);
                  break;

                case 'log':
                  d3_log($scope.rates);
                  break;

                case 'query_type_change':
                  if($scope.labor_category=="")
                     getRatesByDefaultSearch($scope);
                  
                  else 
                    getRatesByKeywordSearch($scope.labor_category, $scope);
                  break;

                /*case 'sort':
                    console.log($scope.sortDescending);
                    if($scope.labor_category=="")
                      getRatesByDefaultSearch($scope,httpService);

                    else
                      getRatesByKeywordSearch($scope.labor_category, $scope, httpService);
                    break;*/

                case 'debug':
                  if (window.confirm("Do you want to activate debugging?")) {
                    console.log("debugger engaged");
                    debugger;
                  } else {
                    console.log("debugger request cancelled");
                  }
                  break;

                default:
                  alert('you clicked on "' + val + '"');
                  break;
            }
        };

    $scope.sortRates =  function(sortType) {
      console.log('sort type is ' + $scope.sortType);
      console.log('passed in sort type is ' + sortType);

      if($scope.sortType != sortType){
        $scope.sortDescending = false;
        $scope.sortType = sortType;
      }else{
        $scope.sortDescending = !$scope.sortDescending;
      }
      console.log($scope.sortDescending);
      if($scope.labor_category=="")
        getRatesByDefaultSearch($scope);
      else
        getRatesByKeywordSearch($scope.labor_category, $scope);

      
    }
}

function processRatesFromJson($scope, response){
  $scope.rates = response.data;
  $scope.count = response.data.count;
  $scope.rates.results.forEach(addAdditionalPropertiesToRates);
  handleSortingDisplay($scope);
}

function addAdditionalPropertiesToRates(rate, index){
  rate.idv_piid_link = rate.idv_piid.replace(/-/gi,"");
  rate.isExcluded = false;
}

function handleSortingDisplay($scope){
  var elements =document.getElementsByClassName('rate-header');//check this 
  console.log('got ' + elements.length + ' elements');
  for(var i=0; i < elements.length; i++) { 
      console.log('marking ' + elements[i] + ' element');
      elements[i].classList.remove("be-still");
  }
  timeout(function(){
    console.log('marking ' + $scope.sortType + ' elements');
    var elements =document.getElementsByClassName($scope.sortType);//check this 
    console.log('got ' + elements.length + ' elements');
    for(var i=0; i < elements.length; i++) { 
        console.log('marking ' + elements[i] + ' element');
        elements[i].classList.add("be-still");
    }

  });
}

function getRates($scope){
    http({
      method: 'GET',
      url: $scope.URL,
      withCredentials: false,
      headers: { 'X-CSRF-Token': undefined }
    }).then(function successCallback(response) {
      processRatesFromJson($scope,response);
    }, function errorCallback(response) {
      alert('http request failed with: ' + response.status + ':' + response.statusText);
  });
}

function getCategories($scope){

}

var API_URL = 'https://api.data.gov/gsa/calc/';
var QUERY_TYPE='__QUERY_TYPE__';
var SORT_TYPE='__SORT_TYPE__'; //added ................altered the next line by replacing sort=current_price with __SORT_TYPE
var DATA_URL_STUB = 'rates/?format=json&histogram=12&sort=__SORT_TYPE__&min_experience=0&max_experience=45&query_type=__QUERY_TYPE__&experience_range=0,45'
var KEYWORD_URL_STUB = '&q=__KEYWORD__';
var CATEGORY_URL_STUB = 'search/?query_type=__QUERY_TYPE__';

function getRatesByKeywordSearch(keyword, $scope){
  console.log('inside getRatesByKeywordSearch');
  console.log('Query type is ' + $scope.query_type );
  var theUrl = API_URL + DATA_URL_STUB;
  if(keyword != "" && typeof keyword != 'undefined'){

    console.log("Keyword is " +  keyword);
    theUrl = theUrl + KEYWORD_URL_STUB;
    theUrl = theUrl.replace("__KEYWORD__",keyword)
  }

  theUrl = theUrl.replace("__QUERY_TYPE__",$scope.query_type);

  if ($scope.sortDescending == false)
     theUrl = theUrl.replace("__SORT_TYPE__",$scope.sortType);
  else {
          console.log("my sortType is " + $scope.sortType);
          theUrl = theUrl.replace("__SORT_TYPE__","-" + $scope.sortType); 
  }
  $scope.URL = theUrl;
  console.log('Calling get rates with  ' + $scope.query_type );
  getRates($scope);
}

function getRatesByDefaultSearch($scope){
  var theUrl = API_URL + DATA_URL_STUB;
  theUrl = theUrl.replace("__QUERY_TYPE__",$scope.query_type);
  if ($scope.sortDescending == false)
    theUrl = theUrl.replace("__SORT_TYPE__",$scope.sortType);//added .................
  else {
    console.log("my sortType is " + $scope.sortType);
    theUrl = theUrl.replace("__SORT_TYPE__","-" + $scope.sortType); //added the whole if else block
  }
  $scope.URL = theUrl;
  console.log("my URL api is " + $scope.URL);
  getRates($scope)
}

function getCategoriesByKeyword($scope, searchStr){
  searchStrArr = searchStr.split(",");
  searchStr = searchStrArr[searchStrArr.length - 1].trim();
  var theUrl = API_URL + CATEGORY_URL_STUB + KEYWORD_URL_STUB;  
  theUrl = theUrl.replace("__KEYWORD__",searchStr);
  $scope.URL = theUrl.replace("__QUERY_TYPE__",$scope.query_type);
  return http({
      method: 'GET',
      url: $scope.URL,
      withCredentials: false,
      headers: { 'X-CSRF-Token': undefined }
    }).then(function successCallback(response) {
       return response.data;
      }, function errorCallback(response) {
      alert('http request failed with: ' + response.status + ':' + response.statusText);
  });
}

