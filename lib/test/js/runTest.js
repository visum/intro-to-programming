var escapeChars = function (str) {
    if (typeof str !== "string") {
        return str;
    } else {
        return str.replace(/\|/g, "||")
                .replace(/'/g, "|'")
                .replace(/\n/g, "|n")
                .replace(/\r/g, "|r")
                .replace(/\u0085/, "|x")
                .replace(/\u2028/, "|l")
                .replace(/\u2029/, "|p")
                .replace(/\[/g, "|[")
                .replace(/\]/g, "|]");
    }
};

var TeamCityOutput = function (type) {
    this.toString = function (attr) {
        var attributes = Object.keys(attr).reduce(function (str, key) {
            return str += " " + key + "='" + escapeChars(attr[key]) + "'";
        }, "");
        return "##teamcity[" + type + attributes + "]";
    };
};

console.log(new TeamCityOutput("testSuiteStarted").toString({ name: "Javascript Tests" }));

process.on('uncaughtException', function (err) {
    var time = new Date().getTime();
    var name = "Script Error " + time;
    console.log(new TeamCityOutput("testStarted").toString({ name: name }));
    console.log(new TeamCityOutput("testFailed").toString({ name: name, out: "Check log for details." }));
    console.log(new TeamCityOutput("testFinished").toString({ name: name }));
    //hopefully do some logging.
    process.exit(1);
});

process.on("exit", function () {
    console.log(new TeamCityOutput("testSuiteFinished").toString({ name: "Javascript Tests" }));
});

require("../../js/BASE.js");
var fileSystem = require("fs");

BASE.require.loader.setRoot("./");

var fs = require("fs"),
    path = require("path");

var p = "../../test/js";
fs.readdir(p, function (err, files) {
    if (err) {
        throw err;
    }


    files.map(function (file) {
        return path.join(p, file);
    }).filter(function (file) {
        return fs.statSync(file).isFile() && path.extname(file) === ".js" && file.indexOf("runTest.js") === -1;
    }).forEach(function (file) {
        require(file);
    });



});
