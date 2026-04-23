import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  userName = 'Student';

  stats = {
    enrolled: 6,
    completed: 3,
    progress: 58,
  };

  lastCourse = {
    title: 'Advanced Web Development',
    progress: 72,
  };

  courses = [
    { id: 1, title: 'Advanced Web Development', progress: 72, icon: 'code', color: 'blue' },
    {
      id: 2,
      title: 'Data Structures & Algorithms',
      progress: 45,
      icon: 'data_object',
      color: 'amber',
    },
    { id: 3, title: 'Database Management', progress: 90, icon: 'storage', color: 'green' },
    {
      id: 4,
      title: 'Machine Learning Fundamentals',
      progress: 20,
      icon: 'psychology',
      color: 'purple',
    },
  ];

  learningPath = {
    title: 'Full-Stack Engineering Track',
    description:
      'Master front-end, back-end, and deployment skills through a structured curriculum.',
    completed: 5,
    total: 8,
    steps: [
      { name: 'HTML & CSS Fundamentals', done: true },
      { name: 'JavaScript Essentials', done: true },
      { name: 'Angular Framework', done: true },
      { name: 'REST APIs & Node.js', done: true },
      { name: 'Database Design', done: true },
      { name: 'Authentication & Security', done: false },
      { name: 'Cloud Deployment', done: false },
      { name: 'Capstone Project', done: false },
    ],
  };

  deadlines = [
    { title: 'Web Dev Assignment 3', date: 'Apr 10, 2026', urgency: 'red', tag: 'Due Soon' },
    { title: 'DSA Quiz — Trees', date: 'Apr 14, 2026', urgency: 'amber', tag: 'This Week' },
    { title: 'ML Project Proposal', date: 'Apr 20, 2026', urgency: 'blue', tag: 'Upcoming' },
    { title: 'Database Final Exam', date: 'Apr 28, 2026', urgency: 'blue', tag: 'Upcoming' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
