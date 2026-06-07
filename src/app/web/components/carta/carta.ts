import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarjeta } from '../../../common/interfaz-rym';

@Component({
  selector: 'app-carta',
  standalone: true,
  template: `
    <div
      class="carta"
      [class.bloqueada]="bloqueado"
      [class.reverso]="!visible && !emparejada"
      [class.fallo]="fallo"
      [class.acierto]="acierto"
      [class.volteando]="visible && !emparejada"
      (click)="alHacerClick()"
    >
      @if (visible || emparejada) {
        <img
          [src]="carta.imagePers"
          [alt]="carta.namePers"
          class="carta-visible"
          [class.emparejada]="emparejada"
        />
      } @else {
        <div class="carta-oculta">
          <img src="assets/img/reverso-carta1.png" alt="Reverso" />
        </div>
      }
    </div>
  `,
  styleUrl: './carta.css',
})
export class Carta {
  @Input({ required: true }) carta!: Tarjeta;
  @Input() bloqueado: boolean = false;
  @Input() emparejada: boolean = false;
  @Input() visible: boolean = false;
  @Input() fallo: boolean = false;
  @Input() acierto: boolean = false;
  @Input() siempreClickable: boolean = false;
  @Output() clickCarta = new EventEmitter<void>();
  @Output() clickBloqueado = new EventEmitter<void>();

  alHacerClick() {
    if (this.bloqueado) {
      this.clickBloqueado.emit();
      return;
    }
    const puedeClicar = this.siempreClickable
      ? !this.emparejada
      : !this.emparejada && !this.visible;
    if (puedeClicar) {
      this.clickCarta.emit();
    }
  }
}
