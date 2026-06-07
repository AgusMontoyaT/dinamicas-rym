import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Personaje, RespuestaApiRyM } from '../common/interfaz-rym';

@Injectable({
  providedIn: 'root',
})
export class ServicioApi {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly url = 'https://rickandmortyapi.com/api/character';

  getUnPersById(id: number): Observable<Personaje> {
    return this.http.get<Personaje>(this.url + '/' + id);
  }

  getPersonajesById(ids: number[]): Observable<Personaje[]> {
    const idsString = ids.join(',');
    return this.http.get<Personaje[]>(this.url + '/' + idsString);
  }

  // https://rickandmortyapi.com/api/character/?page=3&status=alive
  getPersonajesPorFiltro(filtro: string, valor: string, pag: number): Observable<Personaje[]> {
    return this.http.get<RespuestaApiRyM>(this.url + '/?page=' + pag + '&' + filtro + '=' + valor)
    .pipe(map((respuesta: RespuestaApiRyM) => {
      return respuesta.results;
    }));
  }  

}
