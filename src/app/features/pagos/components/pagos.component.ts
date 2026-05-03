import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule],
  template: '<section style="padding: 1.5rem;"><h1>Pagos</h1><p>Proximamente</p></section>',
})
export class PagosComponent {}