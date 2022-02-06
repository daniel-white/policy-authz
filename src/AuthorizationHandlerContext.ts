import { AuthorizationFailureReason } from "./AuthorizationFailureReason";
import { AuthorizationRequirement } from "./AuthorizationRequirement";

export class AuthorizationHandlerContext {
  private _succeedCalled: boolean = false;
  private _failCalled: boolean = false;
  private _failureReasons: AuthorizationFailureReason[] = [];
  private readonly _requirements: readonly AuthorizationRequirement[];
  private _pendingRequirements: Set<AuthorizationRequirement>;

  public constructor(
    public readonly user: unknown,
    public readonly resource: unknown,
    requirements: Iterable<AuthorizationRequirement>
  ) {
    this._requirements = Array.from(requirements);
    this._pendingRequirements = new Set(requirements);
  }

  public get requirements(): IterableIterator<AuthorizationRequirement> {
    return this._requirements.values();
  }

  public get pendingRequirements(): IterableIterator<AuthorizationRequirement> {
    return this._pendingRequirements.values();
  }

  public get hasSucceeded(): boolean {
    return (
      this._succeedCalled &&
      !this._failCalled &&
      this._pendingRequirements.size === 0
    );
  }

  public get hasFailed(): boolean {
    return this._failureReasons.length > 0;
  }

  public get failureReasons(): IterableIterator<AuthorizationFailureReason> {
    return this._failureReasons.values();
  }

  public succeed(requirement: AuthorizationRequirement): void {
    this._succeedCalled = true;
    this._pendingRequirements.delete(requirement);
  }

  public noJudgement(requirement: AuthorizationRequirement): void {}

  public fail(reason?: AuthorizationFailureReason): void {
    this._failCalled = true;
    if (reason) {
      this._failureReasons.push(reason);
    }
  }
}
