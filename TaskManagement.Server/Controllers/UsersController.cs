using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TaskManagement.Server.Data;
using TaskManagement.Server.DTOs;

namespace TaskManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }
    }
}

