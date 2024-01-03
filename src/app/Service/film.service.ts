import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { Movie } from '../Model/movie';
import { Comment } from '../Model/comment';
import { of } from 'rxjs';
import { UsersloginService } from './users.login.service';
import { User } from '../login/user.model';
import { Favorite } from '../Model/Favorite';
import { forkJoin } from 'rxjs';
import { Film } from '../Model/film';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FilmService {
  private readonly api = 'https://emiflex-60e21-default-rtdb.firebaseio.com';
  private readonly baseurl = 'https://api.themoviedb.org/3/discover/movie';
  private readonly apikey = '4722616a8836f0b929a9cb3a04f6a6a4';
  private readonly dbPath = '/Movies';
  favoritesChanged: Subject<Favorite[]> = new Subject<Favorite[]>();
  favoritesMoviesIds: Subject<number[]> = new Subject<number[]>();
  commentsChanged: Subject<Comment[]> = new Subject<Comment[]>();
  allFilmsSource = new BehaviorSubject<Film[]>([]);
  allFilms$ = this.allFilmsSource.asObservable();

  filteredFilmsSource = new BehaviorSubject<Film[]>([]);
  filteredFilms$ = this.filteredFilmsSource.asObservable();

  user: User;
  constructor(
    private http: HttpClient,
    private usersService: UsersloginService
  ) {}

  setAllFilms(films: Film[]) {
    this.allFilmsSource.next(films);
    this.filteredFilmsSource.next(films);
  }

  updateFilteredFilms(films: Film[]) {
    this.filteredFilmsSource.next(films);
  }

  getPopularMovies(): Observable<any> {
    return this.http.get<any>(`${this.baseurl}?api_key=${this.apikey}`);
  }

  getMovieById(id: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${this.apikey}`;
    return this.http.get<any>(url);
  }

  getImageFromApi(poster_path: string): string {
    return 'https://image.tmdb.org/t/p/w1280' + poster_path;
  }

  getimagefromapi( poster_path: string){
    return 'https://image.tmdb.org/t/p/w300' + poster_path
  }

  getPopularMoviesById(id: number): Observable<any> {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${this.apikey}`;
    return this.http.get<any>(url);

  }




































  //#######################

  secondBaseUrl="http://localhost:9999/Commentaire"
  private favoritesUrl = 'http://localhost:9999/api';



  extractMovieIdsFromFavorites(favoriteMovies: any[]): number[] {
    return favoriteMovies.map((favorite) => favorite.movieId);
  }
  // Get favorite movie IDs
  getFavoriteMovieIds(): Observable<number[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/favorite`).pipe(
      map((response: any[]) => {
        console.log('Received favorite movies:', response);

        const movieIds = this.extractMovieIdsFromFavorites(response);
        console.log('Extracted movie IDs:', movieIds);

        return movieIds; // Return extracted movie IDs
      })
    );
  }
  getFavoriteMovieIdsByEmail(email: string): Observable<number[]> {
    return this.http.get<any[]>(`${this.favoritesUrl}/favorite/${email}`).pipe(
      map((response: any[]) => {
        console.log('Received favorite movie IDs for email', email, ':', response);

        const movieIds: number[] = response.map(movie => movie.movieId);
        console.log('Extracted movie IDs:', movieIds);

        return movieIds; // Return extracted movie IDs associated with the email
      })
    );
  }


  // Add a movie to favorites
  addFavoriteMovie(movieId: number, email: string): Observable<any> {
    return this.http.post<any>(`${this.favoritesUrl}/add/${movieId}/${email}`, {});
  }


  // Remove a movie from favorites
  removeFavoriteMovie(id: number): Observable<any> {
    return this.http.delete<any>(`${this.favoritesUrl}/delete/${id}`);
  }





  getCommentaire():Observable<any>{
    return this.http.get<any>(`${this.secondBaseUrl}/commentaires`)
  }
  getCommentaireFiltred(idFilm:number):Observable<any>{
    return this.http.get<any>(`${this.secondBaseUrl}/find/${idFilm}`)
  }
  addComment(commentData: any): Observable<any> {
    console.log("Added commend", commentData)
    return this.http.post<any>(`${this.secondBaseUrl}/add`, commentData);
  }
  deleteComment(id:number): Observable<any> {
    return this.http.delete<any>(`${this.secondBaseUrl}/delete/${id}`);
  }




}
