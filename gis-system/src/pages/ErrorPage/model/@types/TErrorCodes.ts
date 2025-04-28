import type { SERVER_ERRORS } from '../../const'

export type TErrorCodes =
  | typeof SERVER_ERRORS.NOT_FOUND
  | typeof SERVER_ERRORS.SERVER_ERROR
  | typeof SERVER_ERRORS.FORBIDDEN
  | typeof SERVER_ERRORS.UNAUTHORIZED
