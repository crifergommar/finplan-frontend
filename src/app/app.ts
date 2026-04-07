import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Register } from './pages/register/register';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { Home } from './pages/home/home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Home, Register, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('finplan-frontend');
}
