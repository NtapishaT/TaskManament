using System.ComponentModel.DataAnnotations;

namespace TaskManagement.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        public UserRole Role { get; set; } = UserRole.USER;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<TaskItem> CreatedTasks { get; set; } = new List<TaskItem>();
        public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    }
    
    public enum UserRole
    {
        USER = 0,
        ADMIN = 1
    }

}

