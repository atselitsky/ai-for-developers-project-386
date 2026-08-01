import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";
import "./models.tsp";
import "./operations.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "Booking Service"
})
@useAuth(ApiKeyAuth<ApiKeyLocation.header, "X-API-Key">)
namespace BookingService;
