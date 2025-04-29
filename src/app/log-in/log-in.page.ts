import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonButton, IonInput, IonItem, IonLabel } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.page.html',
  styleUrls: ['./log-in.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonButton, IonInput, IonItem, IonLabel]
})
export class LogInPage implements OnInit {
  display_start = true;
  display_login = false;
  display_signup = false;
  profile_pic = '';
  email: string = '';
  password: string = '';
  user = {
    email: '',
    password: '',
    name: '',
    description: '',
    profilePicture: ''
  };
  public pretendientes: any[] = [];
  url_host = 'http://localhost:3000/';

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
    console.log('clicked log');
  }

  sign_up() {
    this.display_signup = true;
    this.display_start = false;
    this.display_login = false;
    console.log('clicked sign');
  }

  handleUpload(input_file: any) {
    const file = input_file.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.user.profilePicture = reader.result as string;
      this.profile_pic = reader.result as string;
    };
  }

  async saveForm(): Promise<void> {
    console.log('Intentando guardar:', this.user);

    if (
      !this.user.email.trim() ||
      !this.user.password.trim() ||
      !this.user.name.trim() ||
      !this.user.description.trim() ||
      !this.user.profilePicture.trim()
    ) {
      console.log('Algun campo esta vacio');
      await this.showToast('Todos los campos tienen que estar llenos');
      return;
    }

    const emailExists = this.pretendientes.some(p => p.email === this.user.email);

    if (emailExists) {
      console.log('Este correo ya existe');
      await this.showToast('Este correo ya esta en uso, espabila chaval');
      return;
    }

    this.http.post(this.url_host + 'send_user', this.user).subscribe((response: any) => {
      console.log('Usuario creado:', response);
      
      localStorage.setItem('loggedInUser', this.user.email);

      this.router.navigate(['/tinder']);
    }, async (error) => {
      console.error('Error al crear usuario', error);
      await this.showToast('Error al crear cuenta');
    });
  }

  async onLogin() {
    console.log('logeando...');
    console.log('Correo:', this.email);
    console.log('Contraseña:', this.password);

    if (this.pretendientes.length === 0) {
      console.error('Array vacio');
      await this.showToast('Un segundo coño');
      return;
    }

    const match = this.pretendientes.find(p =>
      p.email === this.email && p.password === this.password
    );

    if (match) {
      console.log('Logeado correctamente, moviendo a Tinder');

      localStorage.setItem('loggedInUser', this.email);

      this.router.navigate(['/tinder']);
    } else {
      console.log('Credenciales invalidas');
      await this.showToast('Tu correo o contraseño son incorrectos');
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
