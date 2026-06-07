import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import {
  faRotateRight,
  faArrowDown,
  faLanguage,
  faCircleLeft,
  faRotateLeft,
  faLeftLong,
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [FaIconComponent, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnChanges {
  @Input() nombreJuego: string = '';
  @Input() nombreDificultad: string = '';
  @Input() tiempoFormateado: string = '';
  @Input() tiempoRestante: number = 0;
  @Input() tiempoLimite: number = 0;
  @Input() fallos: number = 0;
  @Input() limiteFallos: number = 0;
  @Input() movimientos: number = 0;
  @Input() tipoVida: 'nave' | 'corazon' | 'cerebro' = 'nave';

  @Output() onReiniciar = new EventEmitter<void>();
  @Output() onSalir = new EventEmitter<void>();

  isLangMenuOpen = false;
  shakingVidas = false;

  // Cronómetro circular
  readonly RADIO = 28;
  readonly CIRCUNFERENCIA = 2 * Math.PI * this.RADIO;
  strokeDashoffset = 0;
  colorAnillo = '#97ce4c';

  // Vidas
  vidas: boolean[] = [];

  private readonly EMOJIS: Record<string, [string, string]> = {
    nave:     ['🛸', '💥'],
    corazon:  ['❤️',  '💔'],
    cerebro:  ['🧠', '❌'],
  };

  getEmojiVida(activa: boolean): string {
    const [vivo, muerto] = this.EMOJIS[this.tipoVida] ?? this.EMOJIS['nave'];
    return activa ? vivo : muerto;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiempoRestante'] || changes['tiempoLimite']) {
      this.actualizarAnillo();
    }
    if (changes['fallos'] || changes['limiteFallos']) {
      this.actualizarVidas();

      if (changes['fallos'] && !changes['fallos'].firstChange) {
        const antes = changes['fallos'].previousValue;
        const ahora = changes['fallos'].currentValue;
        if (ahora > antes) {
          this.shakingVidas = true;
          setTimeout(() => (this.shakingVidas = false), 500);
        }
      }
    }
  }

  private actualizarAnillo(): void {
    if (this.tiempoLimite === 0) {
      this.strokeDashoffset = 0;
      return;
    }
    const progreso = this.tiempoRestante / this.tiempoLimite;
    this.strokeDashoffset = this.CIRCUNFERENCIA * (1 - progreso);

    if (this.tiempoRestante <= 10) {
      this.colorAnillo = '#ff4444';
    } else if (this.tiempoRestante <= 30) {
      this.colorAnillo = '#ff9500';
    } else {
      this.colorAnillo = '#97ce4c';
    }
  }

  private actualizarVidas(): void {
    this.vidas = Array.from({ length: this.limiteFallos }, (_, i) => i >= this.fallos);
  }

  get pocotiempo(): boolean {
    return this.tiempoRestante <= 10 && this.tiempoRestante > 0;
  }

  constructor(public translate: TranslateService) {}

  selectLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('idioma_preferido', lang);
    this.isLangMenuOpen = false;
  }

  toggleMenu() {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  faCircleLeft = faCircleLeft;
  faRotateRight = faRotateRight;
  faArrowDown = faArrowDown;
  faLanguage = faLanguage;
  faRotateLeft = faRotateLeft;
  faLeftLong = faLeftLong;
}
