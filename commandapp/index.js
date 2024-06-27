"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var nconf = require("nconf");
var _ = require("lodash");
// Load configuration using nconf
nconf.argv().env().file({ file: path.resolve(__dirname, 'config.json') });
function readCSVFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, 'utf-8', function (err, fileContent) {
            if (err) {
                reject(err);
                return;
            }
            var parsedData = parseCSVContent(fileContent);
            resolve(parsedData);
        });
    });
}
function parseCSVContent(content) {
    var lines = content.trim().split('\n');
    if (lines.length < 2) {
        return [];
    }
    var headers = lines[0].split(',').map(function (header) { return header.trim(); });
    var data = [];
    for (var i = 1; i < lines.length; i++) {
        var values = lines[i].split(',').map(function (value) { return value.trim(); });
        var entry = {};
        for (var j = 0; j < headers.length; j++) {
            entry[headers[j]] = values[j];
        }
        data.push(entry);
    }
    return data;
}
function convertMarks(data, keys) {
    return data.map(function (item) {
        keys.forEach(function (key) { return item[key] = parseFloat(item[key]); });
        return item;
    });
}
// Main function to read both files and process data
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var masterDataPath, studentMarksPath, masterData, studentMarks, MasterData_1, StudentMarks_1, args, name_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    masterDataPath = nconf.get('masterDataPath');
                    studentMarksPath = nconf.get('studentMarksPath');
                    if (!masterDataPath || !studentMarksPath) {
                        throw new Error('Paths to CSV files are not defined in the configuration.');
                    }
                    return [4 /*yield*/, readCSVFile(masterDataPath)];
                case 1:
                    masterData = _a.sent();
                    return [4 /*yield*/, readCSVFile(studentMarksPath)];
                case 2:
                    studentMarks = _a.sent();
                    MasterData_1 = convertMarks(masterData, ['TotalMarks', 'PassPercentage']);
                    StudentMarks_1 = convertMarks(studentMarks, ['Marks']);
                    args = process.argv.slice(2);
                    if (args.length === 0) {
                        console.log('Please provide arguments to generate reports.');
                        return [2 /*return*/];
                    }
                    if (args.includes('studentReport')) {
                        name_1 = args[args.indexOf('studentReport') + 1];
                        console.log(student_report(name_1, MasterData_1, StudentMarks_1));
                    }
                    if (args.includes('failedStudentsReport')) {
                        failed_students(MasterData_1, StudentMarks_1);
                    }
                    if (args.includes('topStudentsInSubjects')) {
                        console.log(highest_marks(MasterData_1, StudentMarks_1));
                    }
                    if (args.includes('subjectPassPercentages')) {
                        console.log(calculatePassPercentage(MasterData_1, StudentMarks_1));
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//----------------- Task 1: Generate report for a particular student and their result status.--------------
function student_report(name, masterData, studentMarks) {
    var student = studentMarks.filter(function (item) { return item.StudentName === name; });
    //console.log(student);
    if (student.length == 0) {
        console.log("Student is not registered");
        return;
    }
    var totalmarks = _.sumBy(student, 'Marks');
    //console.log(totalmarks);
    var totalMaxMarks = _.sumBy(student, function (item) {
        var subject = masterData.find(function (subject) { return subject.SubjectName === item.SubjectName; });
        return subject ? subject.TotalMarks : 0;
    });
    var subject_status = [];
    var passFailPerSubject = masterData.map(function (subject) {
        var marksForSubject = student.find(function (item) { return item.SubjectName === subject.SubjectName; });
        //console.log(marksForSubject);  
        if (!marksForSubject) {
            return {
                SubjectName: subject.SubjectName,
                PassFail: 'fail'
            };
        }
        var passMarks = (subject.PassPercentage * subject.TotalMarks) / 100;
        var passFail = marksForSubject['Marks'] >= passMarks ? 'pass' : 'fail';
        subject_status.push({
            SubjectName: subject.SubjectName,
            PassFail: passFail
        });
    });
    //console.log(subject_status);
    var fail = false;
    for (var subject in subject_status) {
        if (subject_status[subject].PassFail == 'fail') {
            fail = true;
            break;
        }
    }
    var percentage = (totalmarks * 100) / totalMaxMarks;
    var result = percentage > 40 && student.length >= 5 && fail == false ? 'pass' : 'fail';
    //console.log(result);
    return {
        studentname: name,
        totalmarks: totalmarks,
        percentage: percentage,
        result: result,
        Subjects: subject_status
    };
}
//--------------- Task-2 : Total number of students failed and their names.---------------------
function failed_students(masterData, studentMarks) {
    var studentNames = _.uniq(_.map(studentMarks, 'StudentName'));
    var students_failed = [];
    for (var name_2 in studentNames) {
        var report = student_report(studentNames[name_2], masterData, studentMarks);
        if (report.result == 'fail') {
            students_failed.push(studentNames[name_2]);
        }
    }
    console.log("Total number of failed students :", students_failed.length);
    console.log(students_failed);
}
// -----------Task-3 :: Display top student subjectwise and their marks------------------------
function highest_marks(masterData, studentMarks) {
    var Subjects = _.groupBy(studentMarks, 'SubjectName');
    var topstudentbySubject = _.map(Subjects, function (students, subjectname) {
        var _a;
        // Find the highest marks in the current subject
        var maxMarks = (_a = _.maxBy(students, 'Marks')) === null || _a === void 0 ? void 0 : _a.Marks;
        var topStudent = students.find(function (student) { return student.Marks === maxMarks; });
        return {
            Subjectname: subjectname,
            StudentName: (topStudent === null || topStudent === void 0 ? void 0 : topStudent.StudentName) || '',
            marks: maxMarks
        };
    });
    return topstudentbySubject;
}
function calculatePassPercentage(masterData, studentMarks) {
    var groupedBySubject = _.groupBy(studentMarks, 'SubjectName');
    var passpercent = [];
    // -------Task 4 :: Calculating which subject has lowest pass percentage and which has highest pass percentage.
    var passPercentages = _.map(masterData, function (subject) {
        var studentsForSubject = groupedBySubject[subject.SubjectName] || [];
        var totalStudents = studentsForSubject.length;
        var passMarks = (subject.PassPercentage * subject.TotalMarks) / 100;
        var passedStudents = studentsForSubject.filter(function (student) { return student.Marks >= passMarks; }).length;
        var failedStudents = totalStudents - passedStudents;
        var passPercentage = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
        passpercent.push({
            subject: subject.SubjectName,
            passpercentage: passPercentage
        });
    });
    var lowestpasspercent = _.minBy(passpercent, 'passpercentage');
    console.log("Subject with the lowest pass percentage: ".concat(lowestpasspercent.subject, " (").concat(lowestpasspercent.passpercentage, "%)"));
    var highestpasspercent = _.maxBy(passpercent, 'passpercentage');
    console.log("Subject with the highest pass percentage: ".concat(highestpasspercent.subject, " (").concat(highestpasspercent.passpercentage, "%)"));
}
main();
