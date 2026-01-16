export class UserFacingError extends Error {
  readonly isUserFacing = true;

  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export function asErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error.";
}
