using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskManagement.Server.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        public TaskStatus Status { get; set; } = TaskStatus.TODO;
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        [Required]
        public int CreatorId { get; set; }
        
        public int? AssigneeId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey(nameof(CreatorId))]
        public User Creator { get; set; } = null!;
        
        [ForeignKey(nameof(AssigneeId))]
        public User? Assignee { get; set; }
    }
    
    public enum TaskStatus
    {
        TODO = 0,
        IN_PROGRESS = 1,
        DONE = 2
    }
    
    public enum TaskPriority
    {
        Low = 0,
        Medium = 1,
        High = 2,
        Critical = 3
    }
}
