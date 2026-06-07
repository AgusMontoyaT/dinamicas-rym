export interface RespuestaApiRyM {
  info: Info;
  results: Personaje[];
}

export interface Info {
  count: number;
  pages: number;
  next: string;
  prev: any;
}

export interface Personaje {
  id: number;
  name: string;
  status: string;
  species: string;
  type?: string;
  gender: string;
  origin?: Origin;
  location?: Location;
  image: string;
  episode?: string[];
  url?: string;
  created?: string;
}

export interface Origin {
  name: string;
  url: string;
}

export interface Location {
  name: string;
  url: string;
}

/////////////////////

export interface Tarjeta {
  id: number;
  idPers: number;
  namePers: string;
  imagePers: string;
  isVisible: boolean;
  isEmparejada: boolean;
  isDesactivada: boolean;
  isFallo: boolean;
  isAcierto: boolean;
}

export interface GrupoIntruso {
  personajes: Personaje[];
  caractComun: string;
  intruso: Personaje;
  pista?: string;
}

export interface EstadoJugando {
  grupoActual: GrupoIntruso | null;
  puntuacion: number;
  rondasJugador: number;
}

/////////////////////

export interface PreguntaTrivia {
  personaje: Personaje;
  opciones: string[];
  correcta: string;
  respondida: boolean;
  esCorrecto: boolean | null;
  seleccionada?: string;
}

export interface Puntuacion {
  uid: string;
  nombre: string;
  juego: 'parejas' | 'intruso' | 'trivia';
  dificultad: string;
  movimientos: number;
  tiempo: number; // segundos restantes al ganar
  fecha: Date;
}
