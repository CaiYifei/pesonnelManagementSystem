var express = require('express');
var bodyParser = require('body-parser');

var Employee = require('./employee');

var mongoose = require('mongoose');
mongoose.connect('mongodb://root:1234@ds151289.mlab.com:51289/cai_test');

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var fs = require('fs');

var path = require('path');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../")));

var port = process.env.PORT || 8888;
var router = express.Router();
app.use('/api', router);

app.use(function (req, res, next) { //allow cross origin requests
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, sid");
    next();
});

router.use(function (req, res, next) {
    console.log('Something is happening.');
    next();
});

router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});


router.route('/employee')
    .get(function (req, res) {
        Employee.find(function (err, result) {
            if (err) {
                res.send(err);
            }
            res.json(result);
        });
    })
    .post(upload.any(), function (req, res, next) {
        var employee = new Employee();

        if (req.files.length > 0) {
            req.files.forEach(function (file) {
                var filename = (new Date).valueOf() + "-" + file.originalname;
                fs.rename(file.path, './uploads/' + filename, function (err) {
                    if (err) {
                        throw err;
                    }
                    employee.image = filename;
                });
            });
        } else {
            employee.image = 'noPhotoAvailable.jpg';
        }

        employee.name = req.body.name;
        employee.title = req.body.title;
        employee.passWord = req.body.passWord;
        employee.managerID = req.body.managerID;

        if (req.body.reportTo == "") {
            employee.reportTo = [];
        } else {
            employee.reportTo = req.body.reportTo.split(",");
        }

        employee.phone = req.body.phone;
        employee.email = req.body.email;
        employee.sex = req.body.sex;
        employee.age = req.body.age;

        employee.save(function (err, result) {
            if (err) {
                res.send(err);
            }
        });

        if (employee.reportTo.length > 0) {
            for (var i = 0; i < employee.reportTo.length; i++) {
                var id = employee.reportTo[i];
                Employee.findById(id, function (err, result) {
                    if (err) {
                        res.send(err);
                    }

                    result.managerID = employee._id;
                    result.save(function (err, result) {
                        if (err) {
                            res.send(err);
                        }
                    });
                });
            }
        }

        if (employee.managerID != "") {
            Employee.findById(employee.managerID, function (err, result) {
                if (err) {
                    res.send(err);
                }

                result.reportTo.push(employee._id);

                result.save(function (err, result) {
                    if (err) {
                        res.send(err);
                    }
                });
            });
        }

        res.json({message: 'create a new employee!'});
    });

router.route('/reportTo/:id')
    .get(function (req, res) {
        Employee.findById(req.params.id, function (err, result) {
            if (err) {
                res.send(err);
            }

            var subordinat = [];
            var emp = [];
            subordinat = result.reportTo;
            var len = subordinat.length;
            var i = 0;

            for (i = 0; i < len; i++) {
                Employee.findById(subordinat[i], function (err, result) {
                    if (err) {
                        res.send(err);
                    }
                    emp.push(result);
                    if (emp.length >= len) {
                        res.json(emp);
                    }
                });
            }
        });
    });

router.route('/manager/:id')
    .get(function (req, res) {
        Employee.findById(req.params.id, function (err, result) {
            if (err) {
                res.send(err);
            }
            var emp = [];
            emp.push(result);
            res.json(emp);
        });
    });

router.route('/employee/:id')
    .delete(function (req, res) {

        Employee.findById(req.params.id, function (err, result) {
            if (err) {
                res.send(err);
            }

            if (result.reportTo.length > 0) {

                var tempEmployee = new Employee();
                tempEmployee.image = "noPhotoAvailable.jpg";
                tempEmployee.name = result.name + "---left";
                tempEmployee.title = result.title;
                tempEmployee.managerID = result.managerID;
                tempEmployee.reportTo = (result.reportTo.length > 0) ? result.reportTo : [];
                tempEmployee.phone = "";
                tempEmployee.email = "";
                tempEmployee.sex = "";
                tempEmployee.age = "";
                tempEmployee.passWord = "";

                tempEmployee.save(function (err, emp) {
                    if (err) {
                        res.send(err);
                    }

                    console.log("tempEmployee.save() successfully");
                    console.log("tempEmployee.save() emp._id: " + emp._id);

                    for (var i = 0; i < emp.reportTo.length; i++) {
                        Employee.findById(emp.reportTo[i], function (err, empl2) {
                            if (err) {
                                res.send(err);
                            }
                            empl2.managerID = emp._id;
                            empl2.save(function (err) {
                                if (err) {
                                    res.send(err);
                                }
                            })
                        });
                    }

                    if (emp.managerID != "") {
                        Employee.findById(emp.managerID, function (err, empl) {
                            if (err) {
                                res.send(err);
                            }

                            for (var i = 0; i < empl.reportTo.length; i++) {
                                if (empl.reportTo[i] == emp._id) {
                                    empl.reportTo.splice(i, 1, emp._id);
                                }
                            }

                            empl.save(function (err) {
                                if (err)
                                    res.send(err);

                            });

                            result.remove(function (err) {
                                if (err)
                                    res.send(err);
                            });

                        });
                    }
                    else {
                        result.remove(function (err) {
                            if (err)
                                res.send(err);
                        });
                    }
                });
            } else {
                if (result.managerID != "") {

                    Employee.findById(result.managerID, function (err, empl3) {
                        if (err) {
                            res.send(err);
                        }
                        var temp = result._id;
                        for (var i = 0; i < empl3.reportTo.length; i++) {
                            if (empl3.reportTo[i] == String(temp)) {
                                empl3.reportTo.splice(i, 1);
                                empl3.save(function (err) {
                                    if (err)
                                        res.send(err);
                                });
                                result.remove(function (err) {
                                    if (err)
                                        res.send(err);
                                });
                                break;
                            }
                        }
                    });
                }
                else {
                    result.remove(function (err) {
                        if (err)
                            res.send(err);
                    });
                }
            }

        });
        res.json({message: 'delete successfully!'});
    })
    .put(upload.any(), function (req, res, next) {
        console.log("req.params.id: " + req.params.id);
        Employee.findById(req.params.id, function (err, result) {
            if (err) {
                res.send(err);
            }
            var filename = "";
            if (req.files.length > 0) {
                req.files.forEach(function (file) {
                    if (result.image != file.originalname) {
                        filename = (new Date).valueOf() + "-" + file.originalname;
                        fs.rename(file.path, './uploads/' + filename, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    } else {
                        filename = file.originalname;
                    }
                });
                employee.image = filename;
            }
            var employee = result;
            employee.name = req.body.name;
            employee.title = req.body.title;
            employee.passWord = req.body.passWord;
            employee.managerID = req.body.managerID;
            var oldManagerID = req.body.oldManagerID;

            if (req.body.reportTo == "") {
                employee.reportTo = [];
            } else {
                employee.reportTo = req.body.reportTo.split(",");
            }

            employee.phone = req.body.phone;
            employee.email = req.body.email;
            employee.sex = req.body.sex;
            employee.age = req.body.age;

            employee.save(function (err, result) {
                if (err) {
                    res.send(err);
                }
            });

            if (employee.reportTo.length > 0) {
                for (var i = 0; i < employee.reportTo.length; i++) {
                    var idn = employee.reportTo[i];
                    Employee.findById(idn, function (err, empl) {
                        if (err) {
                            res.send(err);
                        }
                        empl.managerID = employee._id;
                        empl.save(function (err, empl2) {
                            if (err) {
                                res.send(err);
                            }
                        });
                    });
                }
            }

            if (employee.managerID != "") {
                Employee.findById(employee.managerID, function (err, emple) {
                    if (err) {
                        res.send(err);
                    }
                    emple.reportTo.push(employee._id);
                    emple.save(function (err, emple2) {
                        if (err) {
                            res.send(err);
                        }
                    });
                });
            }
            if (oldManagerID != "") {
                Employee.findById(oldManagerID, function (err, emple2) {
                    if (err) {
                        res.send(err);
                    }

                    var index = emple2.reportTo.indexOf(employee._id);
                    emple2.reportTo.splice(index, 1);

                    emple2.save(function (err, emple2) {
                        if (err) {
                            res.send(err);
                        }
                    });
                });
            }
            res.json({message: 'create a new employee!'});
        });
    });

app.listen(port);
console.log('Magic happens on port ' + port);