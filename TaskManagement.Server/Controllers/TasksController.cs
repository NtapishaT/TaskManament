using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Server.Data;
using TaskManagement.Server.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TasksController> _logger;

        public TasksController(ApplicationDbContext context, ILogger<TasksController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks([FromQuery] string? status, [FromQuery] int? assignee)
        {
            var isAdmin = User.IsInRole("ADMIN");

            var query = _context.Tasks
                .Include(t => t.Creator)
                .Include(t => t.Assignee)
                .AsQueryable();

            // Hide tasks created by ADMIN from non-admin users
            if (!isAdmin)
            {
                query = query.Where(t => t.Creator.Role != UserRole.ADMIN);
            }

            if (!string.IsNullOrEmpty(status) && Enum.TryParse<TaskManagement.Server.Models.TaskStatus>(status, true, out var taskStatus))
            {
                query = query.Where(t => t.Status == taskStatus);
            }

            if (assignee.HasValue)
            {
                query = query.Where(t => t.AssigneeId == assignee.Value);
            }

            var tasks = await query.OrderBy(t => t.CreatedAt).ToListAsync();
            
            return Ok(tasks.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                CreatorId = t.CreatorId,
                CreatorName = t.Creator.Username,
                AssigneeId = t.AssigneeId,
                AssigneeName = t.Assignee?.Username,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            var isAdmin = User.IsInRole("ADMIN");

            var task = await _context.Tasks
                .Include(t => t.Creator)
                .Include(t => t.Assignee)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound();
            }

            // Hide tasks created by ADMIN from non-admin users
            if (!isAdmin && task.Creator.Role == UserRole.ADMIN)
            {
                return NotFound();
            }

            return Ok(new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                CreatorId = task.CreatorId,
                CreatorName = task.Creator.Username,
                AssigneeId = task.AssigneeId,
                AssigneeName = task.Assignee?.Username,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            });
        }

        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask([FromBody] CreateTaskRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized();
            }

            var task = new TaskItem
            {
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                CreatorId = userId,
                AssigneeId = request.AssigneeId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            await _context.Entry(task)
                .Reference(t => t.Creator)
                .LoadAsync();
            
            if (task.AssigneeId.HasValue)
            {
                await _context.Entry(task)
                    .Reference(t => t.Assignee)
                    .LoadAsync();
            }

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status.ToString(),
                Priority = task.Priority.ToString(),
                CreatorId = task.CreatorId,
                CreatorName = task.Creator.Username,
                AssigneeId = task.AssigneeId,
                AssigneeName = task.Assignee?.Username,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            task.Title = request.Title;
            task.Description = request.Description;
            task.Priority = request.Priority;
            task.AssigneeId = request.AssigneeId;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] TaskStatusRequest request)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            task.Status = request.Status;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public int CreatorId { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public int? AssigneeId { get; set; }
        public string? AssigneeName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateTaskRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public int? AssigneeId { get; set; }
    }

    public class UpdateTaskRequest
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        [Required]
        public TaskPriority Priority { get; set; }
        public int? AssigneeId { get; set; }
    }

    public class TaskStatusRequest
    {
        [Required]
        public TaskManagement.Server.Models.TaskStatus Status { get; set; }
    }
}