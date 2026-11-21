export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, "validation_error", message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Falta la clave de administracion o no es valida") {
    super(401, "unauthorized", message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Recurso no encontrado") {
    super(404, "not_found", message);
  }
}

export class UpstreamError extends ApiError {
  constructor(message = "El servicio de datos no responde") {
    super(502, "upstream_error", message);
  }
}
