using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using TaskManagement.Server.Data;
using TaskManagement.Server.Models;
using TaskManagement.Server.Services;
using Xunit;

namespace TaskManagement.Tests
{
    public class AuthServiceTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        private IConfiguration CreateConfiguration()
        {
            var inMemorySettings = new Dictionary<string, string?>
            {
                {"JwtSettings:SecretKey", "test_secret_key_1234567890"},
                {"JwtSettings:Issuer", "TestIssuer"},
                {"JwtSettings:Audience", "TestAudience"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings)
                .Build();
        }

        [Fact]
        public async Task RegisterAsync_WhenUserExists_ReturnsFailure()
        {
            using var context = CreateDbContext();
            context.Users.Add(new User { Username = "existing", Email = "e@e.com", Password = "pwd" });
            await context.SaveChangesAsync();

            var service = new AuthService(context, CreateConfiguration());
            var result = await service.RegisterAsync(new RegisterRequest
            {
                Username = "existing",
                Email = "e@e.com",
                Password = "password"
            });

            Assert.False(result.Success);
            Assert.Equal("User already exists", result.Message);
        }

        [Fact]
        public async Task LoginAsync_WithInvalidCredentials_ReturnsFailure()
        {
            using var context = CreateDbContext();
            var hashed = BCrypt.Net.BCrypt.HashPassword("correct");
            context.Users.Add(new User { Username = "user", Email = "u@u.com", Password = hashed });
            await context.SaveChangesAsync();

            var service = new AuthService(context, CreateConfiguration());
            var result = await service.LoginAsync(new LoginRequest
            {
                Username = "user",
                Password = "wrong"
            });

            Assert.False(result.Success);
            Assert.Equal("Invalid credentials", result.Message);
        }
    }
}











