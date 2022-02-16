import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@app/_services';

@Component({ 
    templateUrl: 'layout.component.html' 
})
export class LayoutComponent {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {
        // továbbítás a home oldalra, ha be vagyunk jelentkezve
        if (this.accountService.userValue) {
            this.router.navigate(['/']);
        }
    }
}