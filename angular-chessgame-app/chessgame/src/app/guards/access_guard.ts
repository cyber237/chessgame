import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../auth.service';
@Injectable({
    providedIn: 'root'
  })
export class PlayGroundGuardService implements CanActivate {
  constructor(public router: Router,private auth:AuthService) {}
  canActivate(): boolean {
   if (!this.auth.is_authenticated()){
       this.router.navigate(['/']);
       return false;
   }
    return true;
  }
}