import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {

  private readonly _sidebarAbierto = new BehaviorSubject<boolean>(false);

  /** Observable del estado del sidebar (para usar con async pipe) */
  sidebarAbierto$ = this._sidebarAbierto.asObservable();

  /** Valor actual sincrónico */
  get sidebarAbierto(): boolean {
    return this._sidebarAbierto.value;
  }

  toggleSidebar(): void {
    this._sidebarAbierto.next(!this._sidebarAbierto.value);
  }

  cerrarSidebar(): void {
    this._sidebarAbierto.next(false);
  }

  abrirSidebar(): void {
    this._sidebarAbierto.next(true);
  }
}

