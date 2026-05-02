import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.html',
  styleUrls: ['./top-bar.scss']
})
export class TopBarComponent implements OnInit {

  fechaActual: Date = new Date();

  ngOnInit(): void {
    setInterval(() => {
      this.fechaActual = new Date();
    }, 1000);
  }
}