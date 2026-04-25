import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { CourseBuilderToast } from './components/course-builder-toast/course-builder-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CourseBuilderToast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('lms-frontend');

  constructor(public router: Router) {}
}
