import { Routes } from '@angular/router';
import { LoginComponent } from './page/login/login.component';
import { StaffPinChangerComponent } from './page/staff-pin-changer/staff-pin-changer.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'staff-pin-changer', component: StaffPinChangerComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
