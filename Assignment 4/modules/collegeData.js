const fs = require("fs");
const path = require("path");

class Data {
    constructor(students, courses) {
        this.students = students;
        this.courses = courses;
    }
}

let dataCollection = null;

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        try {
            const coursePath = path.join(__dirname, '../data/courses.json');
            const studentPath = path.join(__dirname, '../data/students.json');

            if (!fs.existsSync(coursePath)) {
                reject("courses.json does not exist");
                return;
            }
            if (!fs.existsSync(studentPath)) {
                reject("students.json does not exist");
                return;
            }

            fs.readFile(coursePath, 'utf8', (err, courseData) => {
                if (err) {
                    reject("unable to load courses");
                    return;
                }

                fs.readFile(studentPath, 'utf8', (err, studentData) => {
                    if (err) {
                        reject("unable to load students");
                        return;
                    }

                    try {
                        const courses = JSON.parse(courseData);
                        const students = JSON.parse(studentData);
                        dataCollection = new Data(students, courses);
                        resolve();
                    } catch (e) {
                        reject("invalid JSON data");
                    }
                });
            });
        } catch (err) {
            reject(err.message);
        }
    });
}

module.exports.getAllStudents = function() {
    return new Promise((resolve, reject) => {
        if (!dataCollection || dataCollection.students.length === 0) {
            reject("query returned 0 results");
            return;
        }
        resolve(dataCollection.students);
    });
}

module.exports.getCourses = function() {
    return new Promise((resolve, reject) => {
        if (!dataCollection || dataCollection.courses.length === 0) {
            reject("query returned 0 results");
            return;
        }
        resolve(dataCollection.courses);
    });
};

module.exports.getStudentByNum = function(num) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("data not initialized");
            return;
        }
        const student = dataCollection.students.find(s => s.studentNum == num);
        student ? resolve(student) : reject("query returned 0 results");
    });
};

module.exports.getStudentsByCourse = function(course) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("data not initialized");
            return;
        }
        const filteredStudents = dataCollection.students.filter(s => s.course == course);
        filteredStudents.length > 0 ? resolve(filteredStudents) : reject("query returned 0 results");
    });
};

module.exports.getCourseById = function(id) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("data not initialized");
            return;
        }
        const course = dataCollection.courses.find(c => c.courseId == id);
        course ? resolve(course) : reject("query returned 0 results");
    });
};

module.exports.addStudent = function(studentData) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("data not initialized");
            return;
        }
        try {
            // Ensure all required fields are present
            if (!studentData.firstName || !studentData.lastName || !studentData.email) {
                reject("missing required fields");
                return;
            }

            // Set default values if not provided
            studentData.TA = studentData.TA ? true : false;
            studentData.status = studentData.status || "Full Time";
            studentData.course = studentData.course || "1";
            studentData.studentNum = dataCollection.students.length + 1;

            dataCollection.students.push(studentData);
            resolve();
        } catch (err) {
            reject("unable to add student");
        }
    });
};

module.exports.updateStudent = function(studentData) {
    return new Promise((resolve, reject) => {
        if (!dataCollection) {
            reject("data not initialized");
            return;
        }
        try {
            const index = dataCollection.students.findIndex(s => s.studentNum == studentData.studentNum);
            if (index === -1) {
                reject("student not found");
                return;
            }
            
            // Preserve existing data for fields not being updated
            const existingStudent = dataCollection.students[index];
            const updatedStudent = {
                ...existingStudent,
                ...studentData,
                TA: studentData.TA ? true : false
            };

            dataCollection.students[index] = updatedStudent;
            resolve();
        } catch (err) {
            reject("unable to update student");
        }
    });
};
