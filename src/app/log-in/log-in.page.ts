import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonButton,
  IonInput,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonGrid,
    IonButton,
    IonInput,
    IonItem,
    IonLabel
  ]
})
export class LogInPage implements OnInit {
  display_start = true;
  display_login = false;
  display_signup = false;
  profile_pic = '';
  email: string = '';
  password: string = '';
  url_host = 'http://localhost:3000/';
  public pretendientes: any[] = [];

  user = {
    email: '',
    password: '',
    name: '',
    description: '',
    profilepicture: ''
  };

  constructor(
    public http: HttpClient,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.display_signup = false;
    this.display_start = true;
    this.display_login = false;
    this.loadUsers();
    localStorage.removeItem('loggedInUser');
  }

  loadUsers() {
    this.http.get(this.url_host + 'users').subscribe((data: any) => {
      if (Array.isArray(data)) {
        this.pretendientes = data;
      }
    });
  }

  log_in() {
    this.display_signup = false;
    this.display_start = false;
    this.display_login = true;
  }

  sign_up() {
    this.display_signup = true;
    this.display_start = false;
    this.display_login = false;
  }

  backToStart() {
    this.display_start = true;
    this.display_login = false;
    this.display_signup = false;
  }

  handleUpload(input_file: any) {
    const file = input_file.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.user.profilepicture = reader.result as string;
      this.profile_pic = reader.result as string;
    };
  }

  async saveForm(): Promise<void> {
    if (
      !this.user.email.trim() ||
      !this.user.password.trim() ||
      !this.user.name.trim() ||
      !this.user.description.trim() ||
      !this.user.profilepicture.trim()
    ) {
      await this.showToast('Todos los campos tienen que estar llenos, retrasado');
      return;
    }

    this.http.get(this.url_host + 'users').subscribe(
      async (data: any) => {
        const existingUsers = Array.isArray(data) ? data : Object.values(data);
        const emailExists = existingUsers.some(
          (p: any) => p.email === this.user.email
        );

        if (emailExists) {
          await this.showToast('Este correo ya está en uso');
          return;
        }

        this.http.post(this.url_host + 'send_user', this.user).subscribe({
          next: (response: any) => {
            const minimalUser = {
              email: this.user.email,
              name: this.user.name,
              description: this.user.description
            };
            localStorage.setItem('loggedInUser', JSON.stringify(minimalUser));
            this.router.navigate(['/tinder']);
          },
          error: async (error) => {
            console.error('Error al crear usuario', error);
            await this.showToast('Error al crear cuenta');
          }
        });
      },
      async (error) => {
        console.error('Error al obtener usuarios', error);
        await this.showToast('No se pudo verificar el correo');
      }
    );
  }

  async onLogin() {
    if (this.pretendientes.length === 0) {
      await this.showToast('Espérate un momento coño, cargando...');
      return;
    }

    const match = this.pretendientes.find(
      (p) => p.email === this.email && p.password === this.password
    );

    if (match) {
      const minimalUser = {
        email: match.email,
        name: match.name,
        description: match.description
      };
      localStorage.setItem('loggedInUser', JSON.stringify(minimalUser));
      this.router.navigate(['/tinder']);
    } else {
      await this.showToast('Correo o contraseña incorrectos');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'white-toast'
    });
    await toast.present();
  }
}
