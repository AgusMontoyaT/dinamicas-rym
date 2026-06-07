import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Carta } from '../carta/carta';
import { Tarjeta } from '../../../common/interfaz-rym';

@Component({
  selector: 'app-tablero',
  standalone: true,
  imports: [CommonModule, Carta],
  templateUrl: './tablero.html',
  styleUrl: './tablero.css'
})
export class Tablero {
  @Input() cartas: Tarjeta[] = [];
  @Input() dificultad: string = '';
  @Input() previsualizacion: boolean = false;
  @Input() juegoBloqueado: boolean = false;
  @Output() onCartaClick = new EventEmitter<number>();
}
