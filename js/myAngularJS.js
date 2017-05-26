var app = angular.module("myApp", ['ngRoute']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/employeeList', {
            templateUrl: '../html/employeeList.html',
            controller: 'employeeListRouteController'
        }).when('/newEmployee', {
            templateUrl: '../html/createNewEmployee.html',
            controller: 'newEmployeeRouteController'
        }).when('/editEmployee/:id', {
            templateUrl: '../html/editEmployee.html',
            controller: 'editEmployeeRouteController'
        }).otherwise({
            redirectTo: '/'
        });
    }]);

app.factory('employees', function ($http) {
    return {
        getEmployees: function () {
            return $http.get("/api/employee");
        },
        getReportTo: function (id) {
            return $http.get("/api/reportTo/" + id);
        },
        getManager: function (m_id) {
            return $http.get("/api/manager/" + m_id);
        },
        createNewEmployee: function (formData) {
            return $http.post('/api/employee', formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        },
        deleteEmployee: function (id) {
            return $http.delete("/api/employee/" + id);
        },
        editEmployee: function (id, formData) {
            return $http.put('/api/employee/' + id, formData, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            });
        }
    };
});

app.factory('commonFunction', function () {
    return {
        validate: function ($scope) {
            if ($scope.passWord !== $scope.passWord2) {
                $scope.error = true;
            } else {
                $scope.error = false;
            }
            if (!$scope.name.length ||
                !$scope.passWord.length ||
                !$scope.passWord2.length ||
                !$scope.phone.length ||
                !$scope.email.length ||
                !$scope.title.length ||
                !$scope.sex.length ||
                isNaN($scope.age) ||
                $scope.age <= 0) {
                $scope.incomplete = true;
            } else {
                $scope.incomplete = false;
            }
        }
    };
});

app.controller('employeeListRouteController', function ($scope, $location, employees, $timeout) {

    $scope.flag = true;
    $scope.itemPerPage = 15;
    $scope.maxPageNo = 3;
    $scope.pageNo = 1;

    $scope.getAllEmployees = function () {
        employees.getEmployees().then(function (response) {
            $scope.employees = response.data;
            if ($scope.employees.length < $scope.itemPerPage) {
                $scope.data = $scope.employees.slice(0);
            } else {
                $scope.data = $scope.employees.slice(0, $scope.itemPerPage);
            }
        });
    };

    //infinite scrolling
    angular.element(window).scroll(function () {
        var pageNo = $scope.pageNo;
        if (angular.element(window).scrollTop() == (angular.element(document).height() - angular.element(window).height()))
            $scope.loadPage(++pageNo)
    });
    $scope.loadPage = function (num) {
        if (num <= $scope.maxPageNo) {
            $timeout(function () {
                $scope.data = $scope.employees.slice(0, (num * $scope.itemPerPage < $scope.employees.length) ? num * $scope.itemPerPage : $scope.employees.length);
                $scope.pageNo++;
            }, 200);
        }
        else {

        }
    };

    $scope.getSubordinate = function (emp) {
        $scope.flag = false;
        if (emp.reportTo.length > 0) {
            employees.getReportTo(emp._id).then(function (response) {

                $scope.employees = response.data;

                if ($scope.employees.length < $scope.itemPerPage) {
                    $scope.data = $scope.employees.slice(0);
                } else {
                    $scope.data = $scope.employees.slice(0, $scope.itemPerPage);
                }
            });
        }
    };

    $scope.refreshAllEmployees = function () {
        employees.getEmployees().then(function (response) {
            $scope.employees = response.data;
            $scope.data = $scope.employees.slice(0);
        });
    };

    $scope.getManager = function (emp) {
        $scope.flag = false;
        if (emp.managerID != "") {
            employees.getManager(emp.managerID).then(function (response) {
                $scope.employees = response.data;

                if ($scope.employees.length < $scope.itemPerPage) {
                    $scope.data = $scope.employees.slice(0);
                } else {
                    $scope.data = $scope.employees.slice(0, $scope.itemPerPage);
                }
            });
        }
    };

    $scope.deleteEmployee = function (id) {
        employees.deleteEmployee(id).then(function (response) {
            $timeout(function () {
                $scope.getAllEmployees();
            }, 500);
        });
    };

    $scope.editEmployee = function (id) {
        $location.url("/editEmployee/" + id);
    };

    $scope.getAllEmployees();
});

app.controller('newEmployeeRouteController', function ($scope, $location, employees, commonFunction) {

    $scope.error = true;
    $scope.incomplete = true;

    $scope.$watch('name', function () {
        $scope.test();
    });
    $scope.$watch('passWord', function () {
        $scope.test();
    });
    $scope.$watch('passWord2', function () {
        $scope.test();
    });
    $scope.$watch('title', function () {
        $scope.test();
    });
    $scope.$watch('phone', function () {
        $scope.test();
    });
    $scope.$watch('email', function () {
        $scope.test();
    });
    $scope.$watch('sex', function () {
        $scope.test();
    });
    $scope.$watch('age', function () {
        $scope.test();
    });
    $scope.$watch('selectedManager', function () {
        $scope.selectManager();
    });

    $scope.test = function () {
        commonFunction.validate($scope);
    };

    employees.getEmployees().then(function (response) {
        $scope.employees = response.data;

        var tempEmployee = {
            _id: "",
            image: "",
            name: "",
            title: "",
            managerID: "",
            reportTo: [],
            phone: "",
            email: "",
            sex: "",
            age: "",
            passWord: ""
        };
        $scope.managerArray = angular.copy($scope.employees);
        $scope.managerArray.unshift(tempEmployee);
    });

    $scope.selectManager = function () {
        var i = 0;
        $scope.reportToArray = [];
        var tempEmployee = {
            name: " "
        };
        $scope.reportToArray.push(tempEmployee);
        if ($scope.selectedManager._id == "") {
            for (i = 0; i < $scope.employees.length; i++) {
                if ($scope.employees[i].managerID == "") {
                    $scope.reportToArray.push($scope.employees[i]);
                }
            }
        } else {
            var manager = $scope.selectedManager;

            while (manager.managerID != "") {
                for (i = 0; i < $scope.employees.length; i++) {
                    if ($scope.employees[i]._id == manager.managerID) {
                        manager = $scope.employees[i];
                        break;
                    }
                }
            }

            for (i = 0; i < $scope.employees.length; i++) {
                if ($scope.employees[i].managerID == "" && $scope.employees[i]._id != manager._id) {
                    $scope.reportToArray.push($scope.employees[i]);
                }
            }

        }
    };

    $scope.resetModel = function () {
        $scope.error = true;
        $scope.incomplete = true;

        $scope.name = "";
        $scope.passWord = "";
        $scope.passWord2 = "";
        $scope.title = "";
        $scope.managerArray = [];
        $scope.reportToArray = [];
        $scope.phone = "";
        $scope.email = "";
        $scope.sex = "";
        $scope.age = 0;
    };

    $scope.saveNewEmployee = function () {
        var formData = new FormData;
        var file = $('#file')[0].files[0];

        if (file != undefined) {
            formData.append('image', file);
        }

        formData.append('name', $scope.name);
        formData.append('passWord', $scope.passWord);
        formData.append('title', $scope.title);
        formData.append('managerID', $scope.selectedManager._id);

        var rep = [];
        if ($scope.selectedReportTo != undefined) {
            for (var i = 0; i < $scope.selectedReportTo.length; i++) {
                if ($scope.selectedReportTo[i]._id) {
                    rep.push($scope.selectedReportTo[i]._id);
                }
            }
        }

        formData.append('reportTo', rep);
        formData.append('phone', $scope.phone);
        formData.append('email', $scope.email);
        formData.append('sex', $scope.sex);
        formData.append('age', $scope.age);

        employees.createNewEmployee(formData).then(function () {
            $location.url("/employeeList");
        });

    };

});

app.controller('editEmployeeRouteController', function ($scope, $location, employees, commonFunction, $routeParams) {

    var i = 0;
    var j = 0;
    var m = 0;
    var n = 0;
    var oldEmployee = {};
    $scope.error = true;
    $scope.incomplete = true;
    $scope.selectedReportTo = [];
    var idn = $routeParams.id;

    employees.getEmployees().then(function (response) {

        $scope.employees = response.data;

        var tempEmployee = {
            _id: "",
            image: "",
            name: "",
            title: "",
            managerID: "",
            reportTo: [],
            phone: "",
            email: "",
            sex: "",
            age: "",
            passWord: ""
        };

        for (i = 0; i < $scope.employees.length; i++) {
            if ($scope.employees[i]._id == idn) {

                oldEmployee = angular.copy($scope.employees[i]);

                var array1 = [];
                var array2 = [];
                array1.push($scope.employees[i]);
                array2.push($scope.employees[i]);
                while (array1.length > 0) {
                    var temp = array1.shift();
                    if (temp.reportTo.length > 0) {
                        for (m = 0; m < temp.reportTo.length; m++) {
                            for (n = 0; n < $scope.employees.length; n++) {
                                if (temp.reportTo[m] == $scope.employees[n]._id) {
                                    array1.push($scope.employees[n]);
                                    array2.push($scope.employees[n]);
                                    break;
                                }
                            }
                        }
                    }
                }

                var val = [];
                for (m = 0; m < $scope.employees.length; m++) {
                    val.push(0);
                }

                for (m = 0; m < array2.length; m++) {
                    for (n = 0; n < $scope.employees.length; n++) {
                        if (array2[m]._id == $scope.employees[n]._id) {
                            val[n] = 1;
                        }
                    }
                }

                $scope.managerArray = [];

                for (m = 0; m < $scope.employees.length; m++) {
                    if (val[m] == 0) {
                        $scope.managerArray.push($scope.employees[m]);
                    }
                }


                $scope.image = $scope.employees[i].image;
                $scope.name = $scope.employees[i].name;
                $scope.passWord = $scope.employees[i].passWord;
                $scope.passWord2 = "";
                $scope.title = $scope.employees[i].title;

                if ($scope.employees[i].managerID != "") {
                    for (j = 0; j < $scope.employees.length; j++) {
                        if ($scope.employees[j]._id == $scope.employees[i].managerID) {
                            $scope.selectedManager = $scope.employees[j];
                            break;
                        }
                    }
                } else {
                    $scope.selectedManager = tempEmployee;
                }


                if ($scope.employees[i].reportTo.length > 0) {
                    for (m = 0; m < $scope.employees[i].reportTo.length; m++) {
                        for (n = 0; n < $scope.employees.length; n++) {
                            if ($scope.employees[i].reportTo[m] == $scope.employees[n]._id) {
                                $scope.selectedReportTo.push($scope.employees[n]);
                                break;
                            }
                        }
                    }
                }

                $scope.phone = $scope.employees[i].phone;
                $scope.email = $scope.employees[i].email;
                $scope.sex = $scope.employees[i].sex;
                $scope.age = Number($scope.employees[i].age);
                break;
            }
        }
    });


    $scope.$watch('name', function () {
        $scope.test();
    });
    $scope.$watch('passWord', function () {
        $scope.test();
    });
    $scope.$watch('passWord2', function () {
        $scope.test();
    });
    $scope.$watch('title', function () {
        $scope.test();
    });
    $scope.$watch('phone', function () {
        $scope.test();
    });
    $scope.$watch('email', function () {
        $scope.test();
    });
    $scope.$watch('sex', function () {
        $scope.test();
    });
    $scope.$watch('age', function () {
        $scope.test();
    });

    $scope.$watch('selectedManager', function () {
        $scope.selectManager();
    });

    $scope.test = function () {
        commonFunction.validate($scope);
    };

    $scope.resetModel = function () {
        $scope.image = oldEmployee.image;
        $scope.name = oldEmployee.name;
        $scope.passWord = oldEmployee.passWord;
        $scope.passWord2 = "";
        $scope.title = oldEmployee.title;
        $scope.phone = oldEmployee.phone;
        $scope.email = oldEmployee.email;
        $scope.sex = oldEmployee.sex;
        $scope.age = Number(oldEmployee.age);
    };

    $scope.selectManager = function () {

        $scope.reportToArray = [];

        if ($scope.selectedManager._id == "") {
            for (i = 0; i < $scope.employees.length; i++) {
                if ($scope.employees[i].managerID == "" && $scope.employees[i]._id != idn) {
                    $scope.reportToArray.push($scope.employees[i]);
                }
            }
        } else {
            var manager = $scope.selectedManager;
            while (manager.managerID != "") {
                for (i = 0; i < $scope.employees.length; i++) {
                    if ($scope.employees[i]._id == manager.managerID) {
                        manager = $scope.employees[i];
                        break;
                    }
                }
            }
            console.log("manager.name: " + manager.name);
            for (i = 0; i < $scope.employees.length; i++) {
                if ($scope.employees[i].managerID == "" && $scope.employees[i]._id != idn && $scope.employees[i]._id != manager._id) {
                    $scope.reportToArray.push($scope.employees[i]);
                }
            }

        }
    };

    $scope.saveChange = function () {
        var formData = new FormData;
        var file = $('#file')[0].files[0];
        if (file != undefined) {
            formData.append('image', file);
        }
        formData.append('name', $scope.name);
        formData.append('passWord', $scope.passWord);
        formData.append('title', $scope.title);
        formData.append('managerID', $scope.selectedManager._id);
        formData.append('oldManagerID', oldEmployee.managerID);

        var rep = [];
        if ($scope.selectedReportTo != undefined) {
            for (var i = 0; i < $scope.selectedReportTo.length; i++) {
                if ($scope.selectedReportTo[i]._id) {
                    rep.push($scope.selectedReportTo[i]._id);
                }
            }
        }

        formData.append('reportTo', rep);
        formData.append('phone', $scope.phone);
        formData.append('email', $scope.email);
        formData.append('sex', $scope.sex);
        formData.append('age', $scope.age);

        employees.editEmployee(idn, formData).then(function () {
            $location.url("/employeeList");
        });
    };
});
