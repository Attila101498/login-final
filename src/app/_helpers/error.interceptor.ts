import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor() {}
}