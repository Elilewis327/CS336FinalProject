import { inject } from "@angular/core";
import { CanActivateFn, Router } from '@angular/router';
import { DbService } from "../db-service/db-service.service";

export const authGuard: CanActivateFn = (route, state): boolean => {
  const dbService = inject(DbService);
  const router = inject(Router);

  if (dbService.user == null) {
    router.navigate(["/login"]);
    return false;
  }
  return true;
};
