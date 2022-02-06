import { AuthorizationRequirement } from "./AuthorizationRequirement";

export class AuthorizationPolicy {
  public readonly requirements: readonly AuthorizationRequirement[];

  private constructor(
    public readonly name: string,
    requirements: readonly AuthorizationRequirement[]
  ) {
    this.requirements = Array.from(requirements);
  }

  public static create(
    name: string,
    build: (policy: AuthorizationPolicyBuilder) => void
  ) {
    const requirements = new Set<AuthorizationRequirement>();
    const builder = new AuthorizationPolicyBuilder(requirements);
    build(builder);
    return new AuthorizationPolicy(name, Array.from(requirements));
  }
}

class AuthorizationPolicyBuilder {
  public constructor(
    private readonly requirements: Set<AuthorizationRequirement>
  ) {}

  public require(requirement: AuthorizationRequirement): this {
    this.requirements.add(requirement);
    return this;
  }
}
