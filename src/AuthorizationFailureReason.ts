import { AuthorizationHandler } from "./AuthorizationHandler";

export class AuthorizationFailureReason {
  public constructor(
    public readonly handler: AuthorizationHandler,
    public readonly message: string
  ) {}
}
