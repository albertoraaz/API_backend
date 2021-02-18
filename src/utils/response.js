class Response {
  constructor(code, msgCode, msg) {
    this.code = code;
    this.msgCode = msgCode;
    this.msg = msg;
  }
}

class Success extends Response {
  constructor(msg) {
    super(200, 'success', msg);
  }
}

class MissingParams extends Response {
  constructor(status, err, errorMsg) {
    super(
      400,
      'missing_wrong_params',
      errorMsg ||
        'Faltan completar campos obligatorios o hay un error en el formato'
    );
  }
}

class WrongOptionalParams extends Response {
  constructor(status, err, errorMsg) {
    super(
      400,
      'wrong_optional_params',
      errorMsg || 'Error de formato en los parámetros opcionales'
    );
  }
}

class UnauthorizedError extends Response {
  constructor(status, err, errorMsg) {
    super(
      401,
      'unauthorized',
      errorMsg || 'Credenciales inválidas para el recurso solicitado'
    );
  }
}

class TokenError extends Response {
  constructor(status, err, errorMsg) {
    super(
      401,
      'invalid_token',
      errorMsg || "Token doesn't exists or is expired"
    );
  }
}

class RouteNotFound extends Response {
  constructor(status, err, errorMsg) {
    super(404, 'not_found_route', errorMsg || 'Path no encontrado');
  }
}

class ResourceNotFound extends Response {
  constructor(status, err, errorMsg) {
    super(404, 'not_found_resource', errorMsg || 'Recurso no encontrado');
  }
}

class ConflictException extends Response {
  constructor(status, err, errorMsg) {
    super(
      409,
      'conflict',
      errorMsg || 'Error al actualizar o crear la entidad'
    );
  }
}

class UnknownException extends Response {
  constructor(status, err, errorMsg) {
    super(500, 'unknown', errorMsg || 'Error desconocido');
  }
}

class GenericError extends Response {
  constructor(msgCode, msg) {
    super(-1, msgCode, msg);
  }
}

module.exports = {
  GenericError,
  Response,
  Success,
  MissingParams,
  UnauthorizedError,
  RouteNotFound,
  ResourceNotFound,
  ConflictException,
  UnknownException,
  WrongOptionalParams,
};
