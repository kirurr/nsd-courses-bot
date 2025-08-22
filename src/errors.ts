export class DatabaseError extends Error {
  constructor(message?: string) {
    super(message ?? "Database operation failed");
    this.name = "DatabaseError";
  }
}

export class ValidationError extends Error {
	constructor(message?: string) {
		super(message ?? "Failed to validate")
		this.name = "ValidationError"
	}
}

export class EnvError extends Error {
	constructor(message?: string) {
		super(message ?? "Failed get env variable")
		this.name = "EnvError"
	}
}
