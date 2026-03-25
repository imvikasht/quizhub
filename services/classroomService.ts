import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Classroom, ClassAssignment } from '../types/extensions';

// Generate a random 6 alphanumeric code
const generateClassCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createClassroom = async (name: string, teacherId: string): Promise<Classroom> => {
  const code = generateClassCode();
  const newClassroomId = `class_${Date.now()}`;
  
  const classroom: Classroom = {
    _id: newClassroomId,
    code,
    name,
    teacherId,
    students: [],
    assignments: [],
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'classrooms', newClassroomId), classroom);
  return classroom;
};

export const getClassroomsForTeacher = async (teacherId: string): Promise<Classroom[]> => {
  const q = query(collection(db, 'classrooms'), where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Classroom);
};

export const getClassroomsForStudent = async (studentId: string): Promise<Classroom[]> => {
  const q = query(collection(db, 'classrooms'), where('students', 'array-contains', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Classroom);
};

export const joinClassroom = async (code: string, studentId: string): Promise<Classroom> => {
  const q = query(collection(db, 'classrooms'), where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error('Invalid Class Code');
  }

  const classDoc = snapshot.docs[0];
  const classroomData = classDoc.data() as Classroom;

  if (classroomData.students.includes(studentId)) {
    return classroomData; // Already joined
  }

  await updateDoc(doc(db, 'classrooms', classroomData._id), {
    students: arrayUnion(studentId)
  });

  return { ...classroomData, students: [...classroomData.students, studentId] };
};

export const assignQuizToClassroom = async (classroomId: string, quizId: string, deadline?: Date) => {
  const assignment: ClassAssignment = {
    quizId,
    assignedAt: new Date(),
    deadline: deadline || null
  };

  await updateDoc(doc(db, 'classrooms', classroomId), {
    assignments: arrayUnion(assignment)
  });
};
