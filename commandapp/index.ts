import * as fs from 'fs';
import * as path from 'path';
import * as nconf from 'nconf';
import * as _ from 'lodash';

// Load configuration using nconf
nconf.argv().env().file({ file: path.resolve(__dirname, 'config.json') });

// Define types for the data structures
type MasterData = {
  SubjectName: string;
  TotalMarks: number;
  PassPercentage: number;
};

type StudentMarks = {
  StudentName: string;
  SubjectName: string;
  MarksObtained: number;
};

interface report {
  studentname: string,
  totalmarks : number,
  percentage : number,
  result : string,
  Subjects : any[]
}

interface top_student {
  Subjectname: string,
  StudentName: string,
  marks : string
}


function readCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, fileContent) => {
      if (err) {
        reject(err);
        return;
      }
     const parsedData = parseCSVContent(fileContent);
      resolve(parsedData);
    });
  });
}

function parseCSVContent(content: string): any[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map(header => header.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    const entry: any = {};
    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = values[j];
    }
    data.push(entry);
  }

  return data;
}
function convertMarks(data: any[], keys: string[]): any[] {
  return data.map(item => {
    keys.forEach(key => item[key] = parseFloat(item[key]));
    return item;
  });
}

// Main function to read both files and process data
async function main(): Promise<void> {
  try {
    const masterDataPath = nconf.get('masterDataPath');
    const studentMarksPath = nconf.get('studentMarksPath');

    if (!masterDataPath || !studentMarksPath) {
      throw new Error('Paths to CSV files are not defined in the configuration.');
    }

    const masterData: MasterData[] = await readCSVFile(masterDataPath) as MasterData[];
    const studentMarks: StudentMarks[] = await readCSVFile(studentMarksPath) as StudentMarks[];
     const MasterData_1 = convertMarks(masterData, ['TotalMarks', 'PassPercentage']);
    const StudentMarks_1 = convertMarks(studentMarks, ['Marks']);

   const args = process.argv.slice(2);
    if (args.length === 0) {
      console.log('Please provide arguments to generate reports.');
      return;
    }

    if (args.includes('studentReport')) {
      const name = args[args.indexOf('studentReport') + 1];
      console.log(student_report(name, MasterData_1, StudentMarks_1));

    }

    if (args.includes('failedStudentsReport')) {
      failed_students(MasterData_1,StudentMarks_1);
    }

    if (args.includes('topStudentsInSubjects')) {

      console.log(highest_marks(MasterData_1,StudentMarks_1));
    }

    if (args.includes('subjectPassPercentages')) {
      console.log(calculatePassPercentage(MasterData_1,StudentMarks_1));
    }

  }
  catch (error) {
    console.error('Error:', error);
  }

}

 //----------------- Task 1: Generate report for a particular student and their result status.--------------
  function student_report(name: string, masterData : MasterData[], studentMarks : StudentMarks[]){
      const student = studentMarks.filter((item) => item.StudentName===name);
      //console.log(student);
       if(student.length == 0){
         console.log("Student is not registered");
         return;
       }
      const totalmarks = _.sumBy(student, 'Marks');
      //console.log(totalmarks);
     const totalMaxMarks = _.sumBy(student, (item) => {
        const subject = masterData.find((subject) => subject.SubjectName === item.SubjectName);
        return subject ? subject.TotalMarks : 0; });
        const subject_status: any[]=[];
       const passFailPerSubject = masterData.map((subject) => {
       const marksForSubject = student.find((item) => item.SubjectName === subject.SubjectName);
      //console.log(marksForSubject);  
    
        if (!marksForSubject) {
          return {
            SubjectName: subject.SubjectName,
            PassFail: 'fail'
          };
        }
        const passMarks = (subject.PassPercentage * subject.TotalMarks) / 100;
        const passFail = marksForSubject['Marks'] >= passMarks ? 'pass' : 'fail';
      
        subject_status.push ({
          SubjectName: subject.SubjectName,
          PassFail: passFail
        });
        
      });
      //console.log(subject_status);
      let fail: boolean = false;
      for(let subject in subject_status){
         if(subject_status[subject].PassFail == 'fail'){
             fail = true;
             break;
         }
      }
      
      const percentage = (totalmarks * 100)/ totalMaxMarks;
      const result = percentage > 40 && student.length>=5 && fail == false ? 'pass' : 'fail';
       //console.log(result);
       
        return {
          studentname: name,
          totalmarks: totalmarks,
          percentage: percentage,
          result: result,
          Subjects : subject_status
        };
      
      
    }

//--------------- Task-2 : Total number of students failed and their names.---------------------
   function failed_students(masterData : MasterData[], studentMarks : StudentMarks[]){
       const studentNames = _.uniq(_.map(studentMarks, 'StudentName'));
       let students_failed= [];
       for(let name in studentNames){
          const report =  student_report(studentNames[name],masterData, studentMarks);
          if(report.result == 'fail'){
             students_failed.push(studentNames[name]);
          }
       }
       console.log("Total number of failed students :", students_failed.length);
       console.log(students_failed);
   }


// -----------Task-3 :: Display top student subjectwise and their marks------------------------
  function highest_marks(masterData : MasterData[], studentMarks : StudentMarks[]){
    const Subjects = _.groupBy(studentMarks, 'SubjectName');
  
    const topstudentbySubject = _.map(Subjects, (students, subjectname) => {
      // Find the highest marks in the current subject
      const maxMarks = _.maxBy(students, 'Marks')?.Marks;
      const topStudent = students.find(student => student.Marks === maxMarks);
  
      return {
        Subjectname: subjectname,
        StudentName: topStudent?.StudentName || '',
        marks : maxMarks
      };
    });
  
    return topstudentbySubject;
   }

   
   function calculatePassPercentage(masterData: MasterData[], studentMarks: StudentMarks[]) {
    const groupedBySubject = _.groupBy(studentMarks, 'SubjectName');
    const passpercent : any[] = [];


   // -------Task 4 :: Calculating which subject has lowest pass percentage and which has highest pass percentage.
    const passPercentages = _.map(masterData, (subject) => {
      const studentsForSubject = groupedBySubject[subject.SubjectName] || [];
  
      const totalStudents = studentsForSubject.length;
      const passMarks = (subject.PassPercentage * subject.TotalMarks) / 100;
  
      const passedStudents = studentsForSubject.filter(student => student.Marks >= passMarks).length;
      const failedStudents = totalStudents - passedStudents;
  
      const passPercentage = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;

      passpercent.push({
           subject : subject.SubjectName,
           passpercentage : passPercentage

      });

    });
    const lowestpasspercent = _.minBy(passpercent, 'passpercentage');
    console.log(`Subject with the lowest pass percentage: ${lowestpasspercent.subject} (${lowestpasspercent.passpercentage}%)`);
    const highestpasspercent = _.maxBy(passpercent, 'passpercentage');
    console.log(`Subject with the highest pass percentage: ${highestpasspercent.subject} (${highestpasspercent.passpercentage}%)`);
     
}
main();




