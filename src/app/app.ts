import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CourseBuilderToast } from './components/course-builder-toast/course-builder-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CourseBuilderToast],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('lms-frontend');

  constructor(public router: Router) {}
}
