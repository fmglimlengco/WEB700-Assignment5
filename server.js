/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Frances Limlengco Student ID: 180927238 Date: 03/26/2025
*
*  Online (Vercel) Link: [Your Vercel Link Here]
********************************************************************************/ 

const ejs = require('ejs'); 
const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configure EJS
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// Add activeRoute middleware
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// EJS Helpers
app.locals.navLink = function(url, options) {
    return `<li class="nav-item${url == app.locals.activeRoute ? " active" : ""}">
              <a class="nav-link" href="${url}">${options}</a>
            </li>`;
};

app.locals.equal = function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Ejs Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};

// Routes
app.get("/",(req,res)=>{
    res.render("layouts/main",{body:"../home"});
})
app.get("/about", (req, res) => res.render("about"));
app.get("/htmlDemo", (req, res) => res.render("htmlDemo"));

// Students Routes
app.get("/students", (req, res) => {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then(data => {
                if (data.length > 0) {
                    res.render("students", { 
                        students: data,
                        course: req.query.course 
                    });
                } else {
                    res.render("students", { 
                        message: "no results",
                        students: [] // Pass empty array to avoid reference error
                    });
                }
            })
            .catch(err => {
                console.error(err);
                res.render("students", { 
                    message: "no results",
                    students: [] // Pass empty array to avoid reference error
                });
            });
    } else {
        collegeData.getAllStudents()
            .then(data => {
                res.render("students", { 
                    students: data || [], // Ensure we always pass an array
                    message: data.length === 0 ? "no results" : null
                });
            })
            .catch(err => {
                console.error(err);
                res.render("students", { 
                    message: "no results",
                    students: [] // Pass empty array to avoid reference error
                });
            });
    }
});

// Get a single student by student number
app.get("/student/:num", (req, res) => {
    collegeData

.getStudentByNum(req.params.num)
        .then(student => {
            if (student) {
                res.render("student", { student });
            } else {
                res.render("student", { message: "Student not found" });
            }
        })
        .catch(err => {
            console.error(err);
            res.render("student", { message: "Error retrieving student" });
        });
});

// Handle student update
app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch(err => {
            console.error(err);
            res.status(500).render("student", { 
                message: "Unable to update student",
                student: req.body
            });
        });
});

// Courses Routes
app.get("/courses", (req, res) => {
    collegeData.getCourses()
        .then(data => {
            if (data.length > 0) {
                res.render("courses", { courses: data });
            } else {
                res.render("courses", { message: "no results" });
            }
        })
        .catch(err => res.render("courses", { message: "no results" }));
});

// Get a single course by ID
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then(data => res.render("course", { course: data }))
        .catch(err => res.render("course", { message: "no results" }));
});

// Add Student Routes
app.get("/students/add", (req, res) => {
    res.render("addStudent");
});

app.post("/students/add", (req, res) => {
    // Convert TA checkbox value to boolean
    req.body.TA = req.body.TA ? true : false;
    
    collegeData.addStudent(req.body)
        .then(() => res.redirect("/students"))
        .catch(err => res.status(500).send("Error adding student: " + err));
});

// 404 Error Page
app.use((req, res) => res.status(404).send("Page Not Found"));

// Export for Vercel
module.exports = app;

// Start server locally (only when running `node server.js`)
if (require.main === module) {
    collegeData.initialize().then(() => {
        app.listen(HTTP_PORT, () => {
            console.log(`Server listening on port: ${HTTP_PORT}`);
        });
    }).catch(err => {
        console.error(`Error: ${err}`);
    });
}