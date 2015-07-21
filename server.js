var express = require("express");
var db = require("./app/config/db");
var bodyParser = require('body-parser');
var Thing = require("./app/models/thing");

var Tab = require("./app/tab");




//db.set('debug', true);
db.connect()
    .then(function(){
        console.log("connected to DB");
    })
    .catch(function(err){
        console.log(err);
    });


var app = express();

app.locals.pretty = true;
app.set("view engine", "jade");


// middleware

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next){
    res.locals.tabs = [
            new Tab("Home", "/"),
            new Tab("People", "/people"),
            new Tab("Things", "/things")
    ];
    next(); 
});


// api endpoints

app.get("/", function (req, res) {
    res.render("index", {
        title: "Home",
        activePath: "/"
    });
});



app.get("/", function (req, res) {
    res.render("index", {
        title: "Home",
        activePath: "/"
    });
});

app.get("/people", function (req, res) {
    res.render("people", {
        title: "People",
        activePath: "/people"
    });
});

app.get("/things", function (req, res) {
    Thing.find({}).then(function (things) {
        res.render("things", {
            title: "Things",
            activePath: "/things",
            things: things
        });
    });
});

app.post("/things/new", function (req, res) {
    var thing = new Thing(req.body);
    var promise= thing.save();

    promise.then(function () {
        res.redirect("/things");
    }, function (err) {
        if (err) {
            console.log("Error = ", err, "occured when saving ", thing);
            serverError = err;
            res.render("error");

        }

    });


    res.redirect("/things");

});

app.post("/things/:id", function (req, res) {

    if (req.body.Delete) {
        Thing.findOneAndRemove({name: req.body.name}, function (err) {
            if (err) {
                console.log("Error = ", err, " occurred when deleting ", req.body.name);
                serverError = err;
                res.render("error");
            }

            console.log("Successfully deleted =", req.body.name);
            res.redirect("/things");
        })


    };

    if (req.body.Save) {
        Thing.update(
            {_id: req.params.id},
            {$set: {name: req.body.name, active: req.body.active}}
        ).then(function () {
                res.redirect("/things");
            }), function (err) {
            if (err) {
                console.log("Error = ", err);
                serverError = err;
                res.render("error");
            }
        };
    }
});

app.get("/things/new", function (req, res) {
    res.render("thing_new", {
        activePath: "/things",
        title: "Insert a New Thing",
        active: false
    });

});

app.get("/things/:id", function (req, res) {
    Thing.findById(req.params.id)
        .then(function (thing) {
            res.render("thing", {
                activePath: "/things",
                thing: thing,
                title: "Thing " + thing.name,
                active: thing.active
            });
        });
});




var port = process.env.PORT ||  8080
app.listen(port , function () {
    console.log( "server connected to port ", port);
});

