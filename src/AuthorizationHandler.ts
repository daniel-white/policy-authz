import { AuthorizationHandlerContext } from "./AuthorizationHandlerContext";
import { AuthorizationRequirement } from "./AuthorizationRequirement";

export abstract class AuthorizationHandler<
  T extends AuthorizationRequirement = AuthorizationRequirement
> {
  public abstract handleRequirement(
    context: AuthorizationHandlerContext,
    requirement: T
  ): Promise<void>;
}
