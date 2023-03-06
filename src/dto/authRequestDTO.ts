//Request Auth permission from  DSRoles contract an implement of authority for DSAuth contract
export class AuthRequestDTO {
  readonly requester: string;
  readonly permission: string;
  
}
