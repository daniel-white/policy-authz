type Constructor<T> = Function & { prototype: T };

import { AuthorizationHandler } from "./AuthorizationHandler";
import { AuthorizationHandlerContext } from "./AuthorizationHandlerContext";
import { AuthorizationPolicy } from "./AuthorizationPolicy";
import { AuthorizationRequirement } from "./AuthorizationRequirement";

export class AuthorizationService {
  private readonly _handlers: Map<
    Constructor<AuthorizationRequirement>,
    AuthorizationHandler[]
  >;

  public constructor() {
    this._handlers = new Map();
  }

  public registerHandler(
    requirementType: Constructor<AuthorizationRequirement>,
    handler: AuthorizationHandler
  ): void {
    const handlers = this._handlers.get(requirementType);
    if (!handlers) {
      this._handlers.set(requirementType, [handler]);
    } else {
      handlers.push(handler);
    }
  }

  public async authorize(
    user: unknown,
    resource: unknown,
    policy: AuthorizationPolicy
  ): Promise<void> {
    const requirementHandlers = policy.requirements.map<
      [AuthorizationHandler[], AuthorizationRequirement]
    >((requirement) => {
      const handlers = this._handlers.get(requirement.constructor);
      if (handlers) {
        return [handlers, requirement];
      } else {
        throw new RangeError(`No handler for ${requirement.name}`);
      }
    });

    const context = new AuthorizationHandlerContext(
      user,
      resource,
      policy.requirements
    );

    for (const [handlers, requirement] of requirementHandlers) {
      try {
        for (const handler of handlers) {
          await handler.handleRequirement(context, requirement);
        }
      } catch {
        context.fail();
      } finally {
        if (context.hasFailed) {
          throw new Error(`Authorization failed`);
        }
      }
    }

    if (!context.hasSucceeded) {
      throw new Error(`Authorization failed`);
    }
  }
}
