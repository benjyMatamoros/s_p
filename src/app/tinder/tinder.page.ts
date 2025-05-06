import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  IonButton,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tinder',
  standalone: true,
  imports: [IonIcon, CommonModule, IonContent, IonGrid, IonCol, IonRow, IonButton],
  templateUrl: './tinder.page.html',
  styleUrls: ['./tinder.page.scss'],
})
export class TinderPage implements OnInit {
  url_host = 'https://backend-tinder-oa3y.onrender.com/';
  public pretendientes: any[] = [];
  public boxStyles: any = {};
  public boxStyles2: any = {};
  public loggedInUser: any = null;

  public showMatchPopup = false;
  public matchedUser: any = null;

  constructor(public http: HttpClient) {}

  ngOnInit() {
    const userData = localStorage.getItem('loggedInUser');
    this.loggedInUser = userData ? JSON.parse(userData) : null;

    this.loadUsersExcludingLiked();
    this.checkForUnseenMatches();
  }

  loadUsersExcludingLiked() {
    this.http.get<any[]>(this.url_host + 'users').subscribe((users: any[]) => {
      this.http.get<any[]>(`${this.url_host}matches/from/${this.loggedInUser.email}`)
        .subscribe((likes: any[]) => {
          const likedEmails = likes.map(like => like.usuario2);

          this.pretendientes = users.filter(user =>
            user.email !== this.loggedInUser.email &&
            !likedEmails.includes(user.email)
          );

          this.updateCards();
        });
    });
  }

  updateCards() {
    if (this.pretendientes.length > 0) {
      this.boxStyles = {
        transform: 'translateX(0)',
        transition: 'transform 0.3s ease',
        'background-image': `url(${this.pretendientes[0]?.profilepicture || ''})`,
      };
      this.boxStyles2 = {
        'background-image': `url(${this.pretendientes[1]?.profilepicture || ''})`,
      };
    } else {
      this.boxStyles = {};
      this.boxStyles2 = {};
    }
  }

  startSlide(direction: string) {
    if (this.pretendientes.length === 0) return;

    this.boxStyles.transition = 'transform 0.5s ease';

    if (direction === 'right') {
      this.boxStyles.transform = 'translateX(1000px) rotate(30deg)';
    } else if (direction === 'left') {
      this.boxStyles.transform = 'translateX(-1000px) rotate(-30deg)';
    }

    const likedUser = this.pretendientes[0];

    setTimeout(() => {
      this.handleLike(likedUser);
      this.pretendientes.shift();

      if (this.pretendientes.length > 0) {
        this.boxStyles['background-image'] = `url(${this.pretendientes[0]?.profilepicture})`;
      } else {
        this.boxStyles['background-image'] = '';
      }

      this.boxStyles.transition = 'none';
      this.boxStyles.transform = 'translateX(0) rotate(0)';

      setTimeout(() => {
        if (this.pretendientes.length > 1) {
          this.boxStyles2['background-image'] = `url(${this.pretendientes[1]?.profilepicture})`;
        } else {
          this.boxStyles2['background-image'] = '';
        }
        this.boxStyles.transition = 'transform 0.3s ease';
      }, 100);
    }, 500);
  }

  handleLike(user: any) {
    this.http.post(this.url_host + 'like', {
      usuario1: this.loggedInUser.email,
      usuario2: user.email
    }).subscribe((res: any) => {
      if (res.match) {
        this.matchedUser = user;
        this.showMatchPopup = true;
      }
    });
  }

  checkForUnseenMatches() {
    this.http.get<any[]>(`${this.url_host}matches?email=${this.loggedInUser.email}`)
      .subscribe((matches) => {
        if (matches.length > 0) {
          this.matchedUser = matches[0];
          this.showMatchPopup = true;
          this.markMatchesAsSeen();
        }
      });
  }

  markMatchesAsSeen() {
    this.http.patch(`${this.url_host}matches/seen`, {
      email: this.loggedInUser.email
    }).subscribe();
  }

  closePopup() {
    this.showMatchPopup = false;
    this.matchedUser = null;
  }
}
