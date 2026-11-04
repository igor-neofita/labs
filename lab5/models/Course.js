export class Course {
  constructor(title) { this.title = title; this.students = []; }
  addStudent(student) {
    if (!this.students.includes(student)) this.students.push(student);
  }
  getStudents() { return this.students; }
}
