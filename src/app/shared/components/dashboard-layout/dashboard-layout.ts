import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { UiService } from '../../../core/services/ui.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit, OnDestroy {

  private readonly MOBILE_BREAKPOINT = 768;
  private subscriptions = new Subscription();

  /* ── Usuario ── */
  nombreUsuario = '';
  emailUsuario = '';

  constructor(
    public uiService: UiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.usuarioActual$.subscribe(user => {
        if (user) {
          this.nombreUsuario = user.nombre;
          this.emailUsuario = user.email;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= this.MOBILE_BREAKPOINT) {
      this.uiService.cerrarSidebar();
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}

