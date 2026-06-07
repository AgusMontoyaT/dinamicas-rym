import { dificultad, nombresDificultad, tiempoLimiteJuegos, tiempoPrevisualizacion } from './enums';

export interface ConfigDificultad {
  nivel: dificultad;
  nombre: string;
  tiempoLimite: number;
  tiempoPreview: number;
  limiteFallos: number;
}

export interface ConfigIntruso extends ConfigDificultad {
  personajesRonda: number;
  rondasTotales: number;
  gridAjuste: string;
}

export const CONFIG_PAREJAS: Record<string, ConfigDificultad> = {
  superfacil:   { nivel: dificultad.superfacil,   nombre: nombresDificultad.superfacil,   tiempoLimite: tiempoLimiteJuegos.superfacil,   tiempoPreview: tiempoPrevisualizacion.corto,   limiteFallos: 2 },
  facil:        { nivel: dificultad.facil,         nombre: nombresDificultad.facil,         tiempoLimite: tiempoLimiteJuegos.facil,         tiempoPreview: tiempoPrevisualizacion.normal,  limiteFallos: 3 },
  medio:        { nivel: dificultad.medio,         nombre: nombresDificultad.medio,         tiempoLimite: tiempoLimiteJuegos.medio,         tiempoPreview: tiempoPrevisualizacion.normal,  limiteFallos: 6 },
  dificil:      { nivel: dificultad.dificil,       nombre: nombresDificultad.dificil,       tiempoLimite: tiempoLimiteJuegos.dificil,       tiempoPreview: tiempoPrevisualizacion.largo,   limiteFallos: 6 },
  superdificil: { nivel: dificultad.superdificil,  nombre: nombresDificultad.superdificil,  tiempoLimite: tiempoLimiteJuegos.superdificil,  tiempoPreview: tiempoPrevisualizacion.normal,  limiteFallos: 5 },
};

export const CONFIG_TRIVIA: Record<string, ConfigDificultad> = {
  superfacil:   { nivel: dificultad.superfacil,   nombre: nombresDificultad.superfacil,   tiempoLimite: tiempoLimiteJuegos.superfacil,   tiempoPreview: 0, limiteFallos: 6 },
  facil:        { nivel: dificultad.facil,         nombre: nombresDificultad.facil,         tiempoLimite: tiempoLimiteJuegos.facil,         tiempoPreview: 0, limiteFallos: 5 },
  medio:        { nivel: dificultad.medio,         nombre: nombresDificultad.medio,         tiempoLimite: tiempoLimiteJuegos.medio,         tiempoPreview: 0, limiteFallos: 4 },
  dificil:      { nivel: dificultad.dificil,       nombre: nombresDificultad.dificil,       tiempoLimite: tiempoLimiteJuegos.dificil,       tiempoPreview: 0, limiteFallos: 3 },
  superdificil: { nivel: dificultad.superdificil,  nombre: nombresDificultad.superdificil,  tiempoLimite: tiempoLimiteJuegos.superdificil,  tiempoPreview: 0, limiteFallos: 2 },
};

export const CONFIG_INTRUSO: Record<string, ConfigIntruso> = {
  superfacil:   { nivel: dificultad.superfacil,   nombre: nombresDificultad.superfacil,   tiempoLimite: tiempoLimiteJuegos.superfacil,   tiempoPreview: tiempoPrevisualizacion.normal, limiteFallos: 2, personajesRonda: dificultad.superfacil,   rondasTotales: dificultad.superfacil,   gridAjuste: 'col-6 col-md-4 col-lg-3' },
  facil:        { nivel: dificultad.facil,         nombre: nombresDificultad.facil,         tiempoLimite: tiempoLimiteJuegos.facil,         tiempoPreview: tiempoPrevisualizacion.normal, limiteFallos: 3, personajesRonda: dificultad.facil,         rondasTotales: dificultad.facil,         gridAjuste: 'col-6 col-md-4 col-lg-3' },
  medio:        { nivel: dificultad.medio,         nombre: nombresDificultad.medio,         tiempoLimite: tiempoLimiteJuegos.medio,         tiempoPreview: tiempoPrevisualizacion.normal, limiteFallos: 4, personajesRonda: dificultad.medio,         rondasTotales: dificultad.medio,         gridAjuste: 'col-6 col-md-4 col-lg-2' },
  dificil:      { nivel: dificultad.dificil,       nombre: nombresDificultad.dificil,       tiempoLimite: tiempoLimiteJuegos.dificil,       tiempoPreview: tiempoPrevisualizacion.largo,  limiteFallos: 3, personajesRonda: dificultad.dificil,       rondasTotales: dificultad.dificil,       gridAjuste: 'col-6 col-md-4 col-lg-3 col-xl-2' },
  superdificil: { nivel: dificultad.superdificil,  nombre: nombresDificultad.superdificil,  tiempoLimite: tiempoLimiteJuegos.superdificil,  tiempoPreview: tiempoPrevisualizacion.normal, limiteFallos: 2, personajesRonda: dificultad.superdificil, rondasTotales: dificultad.superdificil, gridAjuste: 'col-6 col-md-4 col-lg-3 col-xl-1' },
};

export function getSiguienteDificultad(dificultadId: string): string | null {
  const SIGUIENTE: Record<string, string> = {
    superfacil: 'facil',
    facil: 'medio',
    medio: 'dificil',
    dificil: 'superdificil',
  };
  return SIGUIENTE[dificultadId] ?? null;
}
