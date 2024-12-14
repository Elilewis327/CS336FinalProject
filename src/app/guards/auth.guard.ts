import { inject } from "@angular/core";
import { CanActivateFn, Router } from '@angular/router';
import { DbService } from "../db-service/db-service.service";

export const loggedInGuard: CanActivateFn = (route, state): boolean => {
  const dbService = inject(DbService); // cannot call from outside function
  const router = inject(Router);

  if (dbService.user === null) {
    router.navigate(["/login"]);
    return false;
  }
  return true;
};

export const isMemberGuard: CanActivateFn = (route, state): boolean => {
  const targetRoomID = route.url[1].path;
  if (targetRoomID === "All_Users")
    return true; // user is just trying to go to All_Users

  const dbService = inject(DbService);
  for (let room of dbService.user?.rooms!) {
    const roomID = room.path.split('/')[1];
    if (roomID === targetRoomID)
      return true;
  }

  return false;
};
