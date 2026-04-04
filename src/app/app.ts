import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { FormsModule } from '@angular/forms';

//2- import RouterOutlet and add it to the imports array
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('lms-frontend');
}
