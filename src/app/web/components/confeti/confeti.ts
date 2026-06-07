import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import p5 from 'p5';

@Component({
  selector: 'app-confeti',
  standalone: true,
  template: `
    <div #canvasContainer
         style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2;">
    </div>`,
})
export class Confeti implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) contenedor!: ElementRef;

  private instanciaP5?: p5;

  ngOnInit(): void {
    this.instanciaP5 = new (p5 as any)(this.crearAnimacion.bind(this), this.contenedor.nativeElement);
  }

  ngOnDestroy(): void {
    this.instanciaP5?.remove();
  }

  private crearAnimacion(p: p5) {
    let particulas: Particula[] = [];
    const numTrozos = 200;
    const paletaColores = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#4CAF50', '#FFEB3B', '#FF9800'];

    p.setup = () => {
      const ancho = this.contenedor.nativeElement.offsetWidth || 400;
      const alto = this.contenedor.nativeElement.offsetHeight || 300;

      p.createCanvas(ancho, alto);
      for (let i = 0; i < numTrozos; i++) {
        particulas.push(new Particula(p, paletaColores));
      }
    };

    p.draw = () => {
      p.clear(); // Fondo transparente para que se vea el juego de fondo

      particulas.forEach(punto => {
        punto.actualizar();
        punto.dibujar();
      });
    };

    p.windowResized = () => {
      const ancho = this.contenedor.nativeElement.offsetWidth;
      const alto = this.contenedor.nativeElement.offsetHeight;
      p.resizeCanvas(ancho, alto);
    };
  }
}

class Particula {
  posicion: p5.Vector;
  velocidad: p5.Vector;
  gravedad: p5.Vector;
  color: string;
  tamaño: number;

  constructor(private p: p5, colores: string[]) {
    // Aparecen en posiciones aleatorias
    this.posicion = p.createVector(p.random(p.width), p.random(-200, -50));
    this.velocidad = p.createVector(p.random(-2, 2), p.random(2, 5));
    this.gravedad = p.createVector(0, 0.05);
    this.color = p.random(colores);
    this.tamaño = p.random(8, 12);
  }

  actualizar() {
    this.velocidad.add(this.gravedad);
    this.posicion.add(this.velocidad);

    // Si el confeti cae al suelo, lo mandamos arriba de nuevo
    if (this.posicion.y > this.p.height) {
      this.posicion.y = -20;
      this.velocidad.y = this.p.random(2, 5);
    }
  }

  dibujar() {
    this.p.fill(this.color);
    this.p.noStroke();
    this.p.rect(this.posicion.x, this.posicion.y, this.tamaño, this.tamaño / 3);
  }
}
