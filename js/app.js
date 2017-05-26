/**
 * Created by caiyifei on 2017/2/25.
 */
var express = require('express');        // call express
var bodyParser = require('body-parser');

var Employee = require('./employee');

var mongoose = require('mongoose');
mongoose.connect('mongodb://root:1234@ds151289.mlab.com:51289/cai_test');

var multer = require('multer');
var upload = multer({dest: 'uploads/'});

var fs = require('fs');

var path = require('path');
var app = express();                 // define our app using express
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../")));

var port = process.env.PORT || 8888;        // set our port

var router = express.Router();              // get an instance of the express Router
app.use('/api', router);

app.use(function (req, res, next) { //allow cross origin requests
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, sid");
    next();
});

router.use(function (req, res, next) {
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
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
        if (req.files.length > 0) {
            req.files.forEach(function (file) {

                var filename = (new Date).valueOf() + "-" + file.originalname;
                fs.rename(file.path, './uploads/' + filename, function (err) {
                    if (err) {
                        throw err;
                    }

                    //save to mongose
                    var employee = new Employee();
                    employee.image = filename;
                    employee.name = req.body.name;
                    employee.title = req.body.title;
                    employee.passWord = req.body.passWord;
                    employee.managerID = req.body.managerID;

                    if (req.body.reportTo == "") {
                        employee.reportTo = [];
                        //console.log(employee.reportTo);
                    } else {
                        employee.reportTo = req.body.reportTo.split(",");
                        //console.log(employee.reportTo);
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

                    //console.log("step 1********************************************************************************");
                    if (employee.reportTo.length > 0) {
                        //set report_to
                        for (var i = 0; i < employee.reportTo.length; i++) {
                            var id = employee.reportTo[i];
                            Employee.findById(id, function (err, result) {
                                if (err) {
                                    res.send(err);
                                }
                                // console.log("id: "+id);
                                // console.log("result["+i+"]: "+result.name);
                                // console.log("employee._id: "+employee._id);
                                result.managerID = employee._id;
                                //console.log("result.managerID: "+result.managerID);
                                result.save(function (err, result) {
                                    if (err) {
                                        res.send(err);
                                    }
                                });

                                //console.log("step 2********************************************************************************");

                            });
                        }
                    }

                    //console.log("step 3********************************************************************************");

                    if (employee.managerID != "") {
                        //set manager
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
                            //console.log("step 4********************************************************************************");

                        });
                    }
                    //console.log("step 5********************************************************************************");


                });
            });
        } else {
            //save to mongose
            var employee = new Employee();
            employee.image = 'noPhotoAvailable.jpg';
            employee.name = req.body.name;
            employee.title = req.body.title;
            employee.passWord = req.body.passWord;
            employee.managerID = req.body.managerID;

            if (req.body.reportTo == "") {
                employee.reportTo = [];
                //console.log(employee.reportTo);
            } else {
                employee.reportTo = req.body.reportTo.split(",");
                //console.log(employee.reportTo);
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

            //console.log("step 1********************************************************************************");
            if (employee.reportTo.length > 0) {
                //set report_to
                for (var i = 0; i < employee.reportTo.length; i++) {
                    var id = employee.reportTo[i];
                    Employee.findById(id, function (err, result) {
                        if (err) {
                            res.send(err);
                        }

                        result.managerID = employee._id;
                        //console.log("result.managerID: "+result.managerID);
                        result.save(function (err, result) {
                            if (err) {
                                res.send(err);
                            }
                        });

                        //console.log("step 2********************************************************************************");

                    });
                }
            }

            //console.log("step 3********************************************************************************");

            if (employee.managerID != "") {
                //set manager
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
                    //console.log("step 4********************************************************************************");

                });
            }
            //console.log("step 5********************************************************************************");

        }
        //console.log("step 6********************************************************************************");
        res.json({message: 'create a new employee!'});
        //console.log("step 7********************************************************************************");
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
            //console.log("subordinat: "+subordinat);

            for (i = 0; i < len; i++) {
                //console.log("subordinat["+i+"]: "+subordinat[i]);
                Employee.findById(subordinat[i], function (err, result) {
                    if (err) {
                        res.send(err);
                    }
                    //console.log("result["+i+"]: "+result);
                    emp.push(result);
                    if (emp.length >= len) {
                        //console.log("emp: "+emp);
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
            //console.log(result);
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

            //console.log("result.reportTo.length: "+result.reportTo.length);

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

                // console.log("enter no reportTo");
                // console.log("result.managerID: "+result.managerID);
                if (result.managerID != "") {

                    Employee.findById(result.managerID, function (err, empl3) {
                        if (err) {
                            res.send(err);
                        }
                        // console.log("enter Employee.findById(result.managerID, function(err, empl3)");
                        // console.log("empl3.reportTo: "+empl3.reportTo);
                        // console.log("empl3.reportTo.length: "+empl3.reportTo.length);
                        // console.log("result._id: "+result._id);
                        var temp = result._id;

                        for (var i = 0; i < empl3.reportTo.length; i++) {
                            // console.log("enter loop");
                            // console.log("empl3.reportTo["+i+"]: "+empl3.reportTo[i]);
                            // console.log("temp: "+temp);
                            // console.log("type of temp: "+typeof (temp));
                            // console.log("empl3.reportTo[i] == temp: "+ (empl3.reportTo[i] == String(temp)));

                            if (empl3.reportTo[i] == String(temp)) {

                                // console.log("empl3.reportTo: "+empl3.reportTo);
                                // console.log("empl3.reportTo.length: "+empl3.reportTo.length);

                                empl3.reportTo.splice(i, 1);

                                // console.log("empl3.reportTo: "+empl3.reportTo);
                                // console.log("empl3.reportTo.length: "+empl3.reportTo.length);

                                empl3.save(function (err) {
                                    if (err)
                                        res.send(err);
                                    //console.log("save successfully");

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
                    //console.log("enter result.remove(function(err)");
                    result.remove(function (err) {
                        if (err)
                            res.send(err);
                    });
                }
            }

        });
        res.json({message: 'delete successfully!'});
        //console.log("delete successfully ************** 2");
    })
    .put(upload.any(), function (req, res, next) {
        console.log("req.params.id: " + req.params.id);
        Employee.findById(req.params.id, function (err, result) {
            if (err) {
                res.send(err);
            }
            var filename = "";
            // console.log("before enter req.files..............");
            // console.log("req.files.length: "+req.files.length);
            if (req.files.length > 0) {
                // console.log("after enter req.files..............");
                // console.log("before enter req.files.forEach..............");
                req.files.forEach(function (file) {
                    // console.log("after enter req.files.forEach..............");
                    // console.log("result.image: "+result.image);
                    // console.log("file.originalname: "+file.originalname);

                    if (result.image != file.originalname) {
                        filename = (new Date).valueOf() + "-" + file.originalname;
                        fs.rename(file.path, './uploads/' + filename, function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                    } else {
                        console.log("result.image == file.originalname ");
                        filename = file.originalname;
                    }
                });
                employee.image = filename;
            }

            console.log("req.files.length == 0..............");
            //save to mongose
            var employee = result;
            employee.name = req.body.name;
            employee.title = req.body.title;
            employee.passWord = req.body.passWord;
            employee.managerID = req.body.managerID;
            var oldManagerID = req.body.oldManagerID;

            // console.log("employee.reportTo: "+employee.reportTo);
            if (req.body.reportTo == "") {
                console.log("req.body.reportTo==' ' ");
                employee.reportTo = [];
                console.log("employee.reportTo: " + employee.reportTo);
            } else {
                console.log("req.body.reportTo!=' ' ");
                employee.reportTo = req.body.reportTo.split(",");
                console.log("employee.reportTo: " + employee.reportTo);
            }

            employee.phone = req.body.phone;
            employee.email = req.body.email;
            employee.sex = req.body.sex;
            employee.age = req.body.age;

            // console.log("employee.name: "+employee.name);
            // console.log("employee.managerID: "+employee.managerID);
            // console.log("employee.reportTo: "+employee.reportTo);
            // console.log("employee.age: "+employee.age);

            employee.save(function (err, result) {
                if (err) {
                    res.send(err);
                }
            });

            //console.log("step 1********************************************************************************");
            if (employee.reportTo.length > 0) {
                //set report_to
                for (var i = 0; i < employee.reportTo.length; i++) {
                    var idn = employee.reportTo[i];
                    Employee.findById(idn, function (err, empl) {
                        if (err) {
                            res.send(err);
                        }
                        // console.log("idn: "+idn);
                        // console.log("empl["+i+"]: "+empl.name);
                        // console.log("employee._id: "+employee._id);
                        empl.managerID = employee._id;
                        //console.log("empl.managerID: "+empl.managerID);
                        empl.save(function (err, empl2) {
                            if (err) {
                                res.send(err);
                            }
                        });

                        //console.log("step 2********************************************************************************");

                    });
                }
            }

            //console.log("step 3********************************************************************************");

            if (employee.managerID != "") {
                //set manager
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
                    //console.log("step 4********************************************************************************");
                });
            }
            //console.log("step 5********************************************************************************");

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
                    //console.log("step 4********************************************************************************");
                });
            }


            //console.log("step 6********************************************************************************");
            res.json({message: 'create a new employee!'});
            //console.log("step 7********************************************************************************");

        });
    });

app.listen(port);
console.log('Magic happens on port ' + port);