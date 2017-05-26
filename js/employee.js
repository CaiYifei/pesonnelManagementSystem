var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
    image: String,
    name: String,
    title: String,
    managerID: String,
    reportTo: Array,
    phone: String,
    email: String,
    sex: String,
    age: String,
    passWord: String
});

module.exports = mongoose.model('Employee', EmployeeSchema);