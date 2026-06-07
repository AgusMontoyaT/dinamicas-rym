import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-portal',
  standalone: true,
  template: `
    <div class="portal-overlay" [class.cerrando]="cerrando">
      <div class="portal-contenedor">
        <div class="portal-anillo anillo-1"></div>
        <div class="portal-anillo anillo-2"></div>
        <div class="portal-anillo anillo-3"></div>
        <div class="portal-anillo anillo-4"></div>
        <div class="portal-nucleo">
          <div class="portal-interior"></div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './portal.css'
})
export class Portal implements OnInit {
  @Output() animacionCompletada = new EventEmitter<void>();
  cerrando = false;

  ngOnInit() {
    setTimeout(() => {
      this.cerrando = true;
      setTimeout(() => this.animacionCompletada.emit(), 400);
    }, 900);
  }
}
