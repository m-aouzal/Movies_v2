import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Film } from '../Model/film';
import { FilmService } from '../Service/film.service';
import { UsersloginService } from '../Service/users.login.service';
import { User } from '../login/user.model';
import { HashService } from '../Service/hash.service';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import {Subject, Subscription} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {DialogLoginComponent} from "../shared/dialog-login/dialog-login.component";
import {MatDialog} from "@angular/material/dialog";



@Component({
  selector: 'app-film-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
  templateUrl: './filmCard.component.html',
  styleUrls: ['./filmCard.component.css'],
})
export class FilmCardComponent implements OnInit {
  @Input() film!: Film;
  @Output() favoriteRemoved: EventEmitter<number> = new EventEmitter<number>();
  isAuthenticated = false;
  userSub: Subscription;
  isFavorite:boolean = false;
  constructor(private filmService: FilmService, private userService: UsersloginService,
              private router: Router,

              public dialog: MatDialog,    ) { }

  ngOnInit(): void {
    this.checkFavoriteStatus(this.film);
    this.userSub = this.userService.userSubject.subscribe((user) => {
      console.log('user', user);
      this.isAuthenticated = !!user;
    });
  }

  getUrl(name: any) {
    return this.filmService.getimagefromapi(name);
  }

  toggleFavorite(film: Film) {


    if (this.isAuthenticated) {
      film.favorite = !film.favorite;
      this.isFavorite = !film.favorite;
      const userEmail = this.userService.getEmailFromLocalStorage(); // Assuming this method gets the user's email

      if (film.favorite) {

        this.filmService.addFavoriteMovie(film.id, userEmail).subscribe(
          () => {
            console.log('Movie added to favorites:', film.id);
            // Handle success if needed
          },
          (error) => {
            console.error('Error adding movie to favorites:', error);
            // Handle error if needed
          }
        );
      } else {
        this.filmService.removeFavoriteMovie(film.id).subscribe(
          () => {
            console.log('Movie removed from favorites: AAAAAAAAAAAA', film.id);
            this.favoriteRemoved.emit(film.id); // Emit event for favorite removal
            // Handle success if needed
          },
          (error) => {
            console.error('Error removing movie from favorites:', error);
            // Handle error if needed
          }
        );
      }
    } else {
      {
        const dialogRef = this.dialog.open(DialogLoginComponent);

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.router.navigate(['/login']);
          }
        });
      }
    }





  }

  checkFavoriteStatus(film: Film) {
    const userEmail = this.userService.getEmailFromLocalStorage(); // Get user's email from local storage

    if (userEmail) {
      this.filmService.getFavoriteMovieIdsByEmail(userEmail).subscribe(
        (favoriteMovieIds: number[]) => {
          if (favoriteMovieIds.includes(film.id)) {
            film.favorite = true; // Movie is already a favorite
          } else {
            film.favorite = false; // Movie is not a favorite
          }
        },
        (error) => {
          console.error('Error retrieving favorite movie IDs:', error);
          // Handle error if needed
        }
      );
    } else {
      film.favorite = false; // No user logged in, set favorite to false
    }
  }


  // Optionally, you can implement a method to check if the movie is a favorite and set isFavorite accordingly
  // checkFavoriteStatus() {
  //   this.filmService.getFavoriteMovieIds().subscribe(
  //     (favoriteMovieIds: number[]) => {
  //       this.isFavorite = favoriteMovieIds.includes(this.film.id);
  //     },
  //     (error) => {
  //       console.error('Error retrieving favorite movie IDs:', error);
  //       // Handle error if needed
  //     }
  //   );
  // }



}
