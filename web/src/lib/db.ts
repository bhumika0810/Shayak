import Dexie, { type Table } from 'dexie';

export interface User {
    id?: number;
    name: string;
    email: string;
    role: 'teacher' | 'student';
    classId?: number;
    password?: string;
    createdAt: Date;
}

export interface Class {
    id?: number;
    name: string;
    subject: string;
    teacherId: string;
    createdAt: Date;
}

export interface Assignment {
    id?: number;
    title: string;
    description: string;
    classId: number;
    dueDate: Date;
    type: 'homework' | 'project' | 'quiz';
    maxMarks: number;
    subject?: string;
    createdAt: Date;
}

export interface Submission {
    id?: number;
    assignmentId: number;
    studentId: string;
    content: string;
    submittedAt: Date;
    status: 'pending' | 'graded';
    obtainedMarks?: number;
    feedback?: string;
}

export interface StudentLog {
    id?: number;
    studentId: string;
    activityType: 'quiz' | 'reading' | 'voice_qa';
    score?: number;
    timestamp: Date;
    data: any;
    synced: boolean;
}

export interface Worksheet {
    id?: number;
    title: string;
    subject: string;
    content: string;
    questions?: any[];
    answers?: any[];
    createdAt: Date;
    generatedFor?: string;
}

export class SahayakDatabase extends Dexie {
    users!: Table<User>;
    classes!: Table<Class>;
    assignments!: Table<Assignment>;
    submissions!: Table<Submission>;
    studentLogs!: Table<StudentLog>;
    worksheets!: Table<Worksheet>;

    constructor() {
        super('SahayakDB');

        this.version(2).stores({
            studentLogs: '++id, studentId, activityType, timestamp, synced',
            worksheets: '++id, title, subject, createdAt, generatedFor',
            users: '++id, &email, role, classId',
            classes: '++id, teacherId, name',
            assignments: '++id, classId, dueDate',
            submissions: '++id, [assignmentId+studentId], studentId, status'
        });

        this.version(3).stores({
            studentLogs: '++id, studentId, activityType, timestamp, synced',
            worksheets: '++id, title, subject, createdAt, generatedFor',
            users: '++id, &email, role, classId',
            classes: '++id, teacherId, name',

            assignments: '++id, classId, dueDate',
            submissions: '++id, [assignmentId+studentId], studentId, status'
        });
    }
}

export const db = new SahayakDatabase();