import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser = new BehaviorSubject<User | null>(this.getStoredUser());

  isLoggedIn$ = this.loggedIn.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getStoredUser(): User | null {
    const data = localStorage.getItem('user');
    if (data) {
      try { return JSON.parse(data); } catch { return null; }
    }
    return null;
  }

  login(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.loggedIn.next(true);
    this.currentUser.next(user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
