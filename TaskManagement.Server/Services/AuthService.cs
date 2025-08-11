using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskManagement.Server.Data;
using TaskManagement.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TaskManagement.Server.DTOs;

namespace TaskManagement.Server.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request);
        Task<AuthResult> LoginAsync(LoginRequest request);
        Task<User?> GetUserByIdAsync(int userId);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResult> RegisterAsync(RegisterRequest request)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.username || u.Email == request.email))
            {
                return new AuthResult { Success = false, Message = "User already exists" };
            }

            // Create new user
            var user = new User
            {
                Username = request.username,
                Email = request.email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.password),
                Role = UserRole.USER
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return new AuthResult
            {
                Success = true,
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                }
            };
        }

        public async Task<AuthResult> LoginAsync(LoginRequest request)
        {
            //var user = {};
            //try
            //{
            //  var  user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.username);
            //    // You can continue processing user here if needed
            //}
            //catch (Exception ex)
            //{
            //    // Handle or log the error here
            //    Console.WriteLine($"An error occurred while retrieving the user: {ex.Message}");
            //    // Optionaly rethrow or handle accordingly
            //}

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.password, user.Password))
            {
                return new AuthResult { Success = false, Message = "Invalid credentials" };
            }

            var token = GenerateJwtToken(user);
            return new AuthResult
            {
                Success = true,
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                }
            };


        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var key = Encoding.ASCII.GetBytes(secretKey!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public UserDto? User { get; set; }
        public string? Message { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string username { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string email { get; set; } = string.Empty;
        [Required]
        [MinLength(6)]
        public string password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        public string username { get; set; } = string.Empty;
        [Required]
        public string password { get; set; } = string.Empty;
    }
}

