import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UiService } from '../../../core/services/ui.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  mostrarNavbar = true;

  constructor(
    public uiService: UiService,
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.mostrarNavbar = !e.urlAfterRedirects.startsWith('/dashboard');
      });
  }

  toggleSidebar(): void {
    this.uiService.toggleSidebar();
  }

  cerrarSidebar(): void {
    this.uiService.cerrarSidebar();
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
