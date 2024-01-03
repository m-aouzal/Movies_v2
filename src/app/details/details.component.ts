import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmService } from '../Service/film.service';
import { Filmdetails } from '../Model/filmdetails';
import { Genre } from '../Model/genre';
import { Comment } from '../Model/comment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Editor, NgxEditorModule, Validators } from 'ngx-editor';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { UsersloginService } from '../Service/users.login.service';
import { Commentaire } from '../Model/Commentaire';
import { DialogLoginComponent } from '../shared/dialog-login/dialog-login.component';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, NgxEditorModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  formData: { nom: string; comment: string } = { nom: '', comment: '' };
  form: FormGroup;
  isAuthenticated = false;
  userSub: Subscription;
  constructor(
    private filmservice: FilmService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    protected userLoginService: UsersloginService
  ) {
    this.form = this.formBuilder.group({
      nom: ['', Validators.required], // Add validators for required fields
      comment: ['', Validators.required], // Add validators for required fields
    });
  }

  ngOnInit(): void {
    this.userLoginService.autoLogin();
    this.userSub = this.userLoginService.userSubject.subscribe((user) => {
      console.log('user', user);
      this.isAuthenticated = !!user;

      // Automatically populate the email field if the user is authenticated
      if (this.isAuthenticated) {
        const userEmail = this.userLoginService.getEmailFromLocalStorage();
        // Extract the text before '@' symbol and set it in the form data
        this.formData.nom = userEmail.split('@')[0];
      }
    });
    this.getPopularMoviesById();
    this.getCommentaire();
    this.submit_commentaire();
    this.editor = new Editor();
    this.activatedRoute.params.subscribe((params) => {
      // Access the film.id parameter
      const id = params['id'];
      this.filmId = id;

      // Use the id as needed, for example, call your service method
      this.getCommentaireFiltred(id);
    });
    if (this.isAuthenticated) {
      const userEmail = this.userLoginService.getEmailFromLocalStorage();
      this.formData.nom = userEmail; // Set the email in the form data
    }
  }

  submit_commentaire() {
    const commentData = {
      idfilm: this.filmId,
      name: this.formData.nom,
      commentaire: this.formData.comment,
    };
    console.log(commentData);
    this.filmservice.addComment(commentData).subscribe(
      (response) => {
        console.log('Comment added successfully', response);
        this.getCommentaireFiltred(this.filmId);
      },
      (error) => {
        console.error('Error adding comment', error);
      }
    );
  }

  filmdetails!: Filmdetails;
  commentaire!: Commentaire;
  commentaireFiltred!: Commentaire[];
  filmId!: number;
  genre!: Genre[];

  //text editor
  editor!: Editor;
  html: string = 'hello world';
  /*form = new FormGroup({
    editorContent: new FormControl('', Validators.required()),
  });*/

  getPopularMoviesById() {
    //get details
    this.filmservice
      .getPopularMoviesById(this.activatedRoute.snapshot.params['id'])
      .subscribe((result) => {
        this.filmdetails = result;
        this.genre = this.filmdetails.genres;
      });
  }
  getCommentaire() {
    this.filmservice.getCommentaire().subscribe((result) => {
      this.commentaire = result;
    });
  }
  getCommentaireFiltred(idFilm: number) {
    console.log('now poe ', this.filmId);
    this.filmservice.getCommentaireFiltred(idFilm).subscribe((result) => {
      this.commentaireFiltred = result;
    });
  }
  deleteComment(id: number) {
    this.filmservice.deleteComment(id).subscribe(
      (response) => {
        // Handle success if needed
        console.log('Comment deleted successfully', response);
        // Refresh comment data after adding a new comment
        this.getCommentaireFiltred(this.filmId);
      },
      (error) => {
        // Handle error if needed
        console.error('Error adding comment', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  protected readonly Editor = Editor;
  sanitizeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onAddComment() {
    if (this.isAuthenticated) {
      this.submit_commentaire;
    } else {
      {
        const dialogRef = this.dialog.open(DialogLoginComponent);

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.router.navigate(['/signup']);
          }
        });
      }
    }
  }
}
