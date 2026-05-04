using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar Autenticación con el JWT de WorkOS
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // El Authority es la URL de tu entorno de WorkOS
        options.Authority = "https://api.workos.com/sso/client_01KFH6W3J1RM7X9566904X2CZ3"; 
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false, // En WorkOS el audience suele ser el client_id, ajustar si es necesario
            ValidateLifetime = true
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Política por defecto: requiere que el usuario esté autenticado
    options.AddPolicy("AuthenticatedUser", policy => policy.RequireAuthenticatedUser());
});

// 2. Configurar el Proxy Inverso (YARP)
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms(transformContext =>
    {
        // INYECCIÓN DE TRUSTED HEADERS
        transformContext.AddRequestTransform(transformContext =>
        {
            var user = transformContext.HttpContext.User;
            
            if (user.Identity?.IsAuthenticated == true)
            {
                // Extraemos el ID del usuario del token (claim 'sub')
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                            ?? user.FindFirst("sub")?.Value;
                
                if (!string.IsNullOrEmpty(userId))
                {
                    // Inyectamos el Trusted Header hacia el microservicio
                    transformContext.ProxyRequest.Headers.Add("X-Cosmos-UserId", userId);
                }

                // También podemos inyectar el Tenant (Organization ID en WorkOS)
                var orgId = user.FindFirst("org_id")?.Value;
                if (!string.IsNullOrEmpty(orgId))
                {
                    transformContext.ProxyRequest.Headers.Add("X-Cosmos-TenantId", orgId);
                }
            }
            
            return ValueTask.CompletedTask;
        });
    });

var app = builder.Build();

// Middlewares obligatorios
app.UseAuthentication();
app.UseAuthorization();

// Mapear el Proxy
app.MapReverseProxy(proxyPipeline =>
{
    // Aquí podrías añadir lógica adicional por cada petición que pasa por el proxy
});

app.Run();
