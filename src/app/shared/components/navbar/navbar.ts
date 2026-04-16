import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  menuAbierto = false;

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
    document.body.classList.toggle('menu-abierto', this.menuAbierto);
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
    document.body.classList.remove('menu-abierto');
  }
}
