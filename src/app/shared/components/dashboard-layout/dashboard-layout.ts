import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UiService } from '../../../core/services/ui.service';
import { AuthService } from '../../../core/services/auth.service';
import { TopBarComponent } from '../top-bar/top-bar';

@Component({
  selector: 'dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TopBarComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout implements OnInit, OnDestroy {

  private readonly MOBILE_BREAKPOINT = 768;
  private subscriptions = new Subscription();

  /* ── Usuario ── */
  nombreUsuario = '';
  emailUsuario = '';
  currentUrl = '';

  constructor(
    public uiService: UiService,
    private authService: AuthService,
    public router: Router
  ) {
    this.currentUrl = this.router.url;
    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.currentUrl = this.router.url;
        })
    );
  }

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

