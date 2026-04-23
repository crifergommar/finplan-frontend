import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Contacto } from './features/contacto/contacto';
import { Footer } from './shared/components/footer/footer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Contacto],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  mostrarNavbarFooter = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.mostrarNavbarFooter = !e.urlAfterRedirects.startsWith('/dashboard');
      });
  }
}
