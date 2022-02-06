import { AuthorizationFailureReason } from "./AuthorizationFailureReason";
import { AuthorizationHandler } from "./AuthorizationHandler";
import { AuthorizationHandlerContext } from "./AuthorizationHandlerContext";
import { AuthorizationPolicy } from "./AuthorizationPolicy";
import { AuthorizationRequirement } from "./AuthorizationRequirement";
import { AuthorizationService } from "./AuthorizationService";

const svr = new AuthorizationService();

class RoleRequirement extends AuthorizationRequirement {
  constructor(public readonly role: string) {
    super(`role:${role}`);
  }
}

function mustBeInRole(role: string) {
  return new RoleRequirement(role);
}

class PermissionRequirement extends AuthorizationRequirement {
  constructor(
    public readonly requestProp: string,
    public readonly type: string,
    public readonly permission: string
  ) {
    super(`permission:${permission}:${type}:${requestProp}`);
  }
}

const adminPolicy = AuthorizationPolicy.create("admin", (policy) =>
  policy.require(mustBeInRole("admin"))
);

class RoleAuthorizationHandler extends AuthorizationHandler {
  public async handleRequirement(
    context: AuthorizationHandlerContext,
    requirement: RoleRequirement
  ): Promise<void> {
    if (context.user === requirement.role) {
      context.succeed(requirement);
    } else {
      context.fail(new AuthorizationFailureReason(this, "No role"));
    }
  }
}

function canEditProject(requestProp = "projectId") {
  return new PermissionRequirement(requestProp, "project", "edit");
}

const editProjectPolicy = AuthorizationPolicy.create("edit project", (policy) =>
  policy.require(canEditProject())
);

class PermissionRequirementHandler extends AuthorizationHandler {
  public async handleRequirement(
    context: AuthorizationHandlerContext,
    requirement: PermissionRequirement
  ): Promise<void> {
    if (
      isRecord(context.resource) &&
      context.resource[requirement.requestProp] === context.user
    ) {
      context.succeed(requirement);
    } else {
      context.fail(new AuthorizationFailureReason(this, "No permission"));
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

svr.registerHandler(RoleRequirement, new RoleAuthorizationHandler());
svr.registerHandler(PermissionRequirement, new PermissionRequirementHandler());

(async () => {
  await svr.authorize("admin", null, adminPolicy);
  await svr.authorize(
    "project-1",
    { projectId: "project-1" },
    editProjectPolicy
  );
})();
