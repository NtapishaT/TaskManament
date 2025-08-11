using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Server.Middleware;
using Npgsql;
using Npgsql.NameTranslation;
using System.Text.Json.Serialization;
using TaskManagement.Server.Data;
using TaskManagement.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var configuration = builder.Configuration;

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DbContext - PostgreSQL with enum mappings
var connString = configuration.GetConnectionString("DefaultConnection");
var npgsqlDataSourceBuilder = new NpgsqlDataSourceBuilder(connString);
var noTranslate = new NpgsqlNullNameTranslator();
npgsqlDataSourceBuilder.MapEnum<TaskManagement.Server.Models.TaskStatus>("task_status", noTranslate);
npgsqlDataSourceBuilder.MapEnum<TaskManagement.Server.Models.TaskPriority>("task_priority", noTranslate);
var npgsqlDataSource = npgsqlDataSourceBuilder.Build();

builder.Services.AddDbContext<TaskManagement.Server.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(npgsqlDataSource));

// Auth + JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSection = configuration.GetSection("JwtSettings");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSection["SecretKey"]))
    };
});

builder.Services.AddAuthorization();

// DI
builder.Services.AddScoped<TaskManagement.Server.Services.IAuthService, TaskManagement.Server.Services.AuthService>();

// CORS (adjust as needed)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Ensure admin user exists on startup
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        ctx.Database.EnsureCreated();
        var adminExists = ctx.Users.Any(u => u.Role == UserRole.ADMIN);
        if (!adminExists)
        {
            var adminUsername = configuration["AdminUser:Username"] ?? Environment.GetEnvironmentVariable("ADMIN_USERNAME") ?? "admin";
            var adminEmail = configuration["AdminUser:Email"] ?? Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@example.com";
            var adminPassword = configuration["AdminUser:Password"] ?? Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "admin123";

            var adminUser = new User
            {
                Username = adminUsername,
                Email = adminEmail,
                Password = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                Role = UserRole.ADMIN,
                CreatedAt = DateTime.UtcNow
            };
            ctx.Users.Add(adminUser);
            ctx.SaveChanges();
        }
    }
    catch
    {
        // swallow to avoid startup crash; consider logging
    }
}

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

// Global exception handler
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
