import { Course } from './models/Course.js';
import { Teacher } from './models/Teacher.js';
import { Student } from './models/Student.js';

const course = new Course('WEB-програмування');
const teacher = new Teacher('Олена');
const student = new Student('Ігор');
teacher.addCourse(course);
course.addStudent(student);
student.addCourse(course);

console.log('ЛР №5. Варіант 1. Номер у журналі: 21');
console.log(teacher.getInfo());
console.log(student.getInfo());
console.log(`Курс: ${course.title}`);
console.log(`Курси викладача: ${teacher.getCourses().map(c => c.title).join(', ')}`);
console.log(`Студенти курсу: ${course.getStudents().map(s => s.name).join(', ')}`);
console.log(`Курси студента: ${student.getCourses().map(c => c.title).join(', ')}`);

document.getElementById('results').textContent = [
  teacher.getInfo(),
  student.getInfo(),
  `Курс: ${course.title}`,
  `Курси викладача: ${teacher.getCourses().map(c => c.title).join(', ')}`,
  `Студенти курсу: ${course.getStudents().map(s => s.name).join(', ')}`,
  `Курси студента: ${student.getCourses().map(c => c.title).join(', ')}`,
].join('\n');
