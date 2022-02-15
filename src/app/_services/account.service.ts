import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/_models';
import { environment } from '@environments/environment';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({ 
    providedIn: 'root' 
})
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    login(username, password) {
        return this.http.post<User>(`${environment.apiUrl}/users/authenticate`, { username, password})
            .pipe(map(user => {
                // a felhasználói adatokat és a jwt tokent elmentjük a local storage-ba,
                // hogy a felhasználó bejelentkezve maradjon az oldalfrissítések között.
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }

    logout() {
        // távolítsuk el a felhasználót a local stroge-ból,
        // a jelenlegi felhasználót állítsuk null-ra
        // továbbítsuk a bejelentkezési oldalra a felhasználót
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(user: User) {
        return this.http.post(`${environment.apiUrl}/users/register`, user);
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById(id: string) {
        return this.http.get<User[]>(`${environment.apiUrl}/users/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/users/${id}`, params)
            .pipe(map(x => {
                // tárolt felhasználó frissítése, ha a saját adatainkat 
                // módosítjuk
                if (id === this.userValue.id) {
                    const user = { ...this.userValue, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // frissített felhasználó közzététele a feliratkozók számára
                    this.userSubject.next(user);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/users/${id}`)
            .pipe(map(x => {
                // automatikus kijelentkeztetés, ha a bejelentkezett
                // felhasználó a saját adatait törölte
                if (id === this.userValue.id) {
                    this.logout();
                }
                return x;
            }));
    }
}