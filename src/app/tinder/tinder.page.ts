import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IonButton, IonContent, IonGrid, IonCol, IonRow, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tinder',
  standalone: true,
  imports: [IonIcon, CommonModule, IonContent, IonGrid, IonCol, IonRow, IonButton],
  templateUrl: './tinder.page.html',
  styleUrls: ['./tinder.page.scss'],
})
export class TinderPage implements OnInit {
  url_host = 'http://localhost:3000/';
  public pretendientes: any[] = [];
  public boxStyles: any = {};
  public boxStyles2: any = {};
  public loggedInEmail: string | null = '';
  public userProfilePic: string = '';

  constructor(public http: HttpClient) {}

  ngOnInit() {
    this.loggedInEmail = localStorage.getItem('loggedInUser');
    this.userProfilePic = localStorage.getItem('loggedInUserPic') || '';
    this.loadUsers();
  }

  loadUsers() {
    this.http.get(this.url_host + 'users').subscribe((data: any) => {
      if (Array.isArray(data)) {
        this.pretendientes = data.filter(user => user.email !== this.loggedInEmail);
        this.updateCards();
      }
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

    setTimeout(() => {
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
}
