import "@typespec/http";

using TypeSpec.Http;

namespace BookingService;

scalar uuid extends string;

scalar email extends string;

model Error {
  code: string;
  message: string;
}

model NotFoundResponse {
  @statusCode _: 404;
  @body body: Error;
}

model ConflictResponse {
  @statusCode _: 409;
  @body body: Error;
}

model UnprocessableResponse {
  @statusCode _: 422;
  @body body: Error;
}

alias OkResponse<T> = {
  @body body: T;
};

alias CreatedResponse<T> = {
  @statusCode _: 201;
  @body body: T;
};

alias NoContentResponse = {
  @statusCode _: 204;
};

alias MaybeNotFound<T> = OkResponse<T> | NotFoundResponse;

alias MaybeConflict<T> = OkResponse<T> | ConflictResponse;

alias MaybeNotFoundOrConflict<T> = OkResponse<T> | NotFoundResponse | ConflictResponse;
