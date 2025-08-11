using Microsoft.EntityFrameworkCore;
using TaskManagement.Server.Models;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace TaskManagement.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Register PostgreSQL enums for EF
            modelBuilder.HasPostgresEnum<TaskManagement.Server.Models.TaskStatus>();
            modelBuilder.HasPostgresEnum<TaskManagement.Server.Models.TaskPriority>();

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Username).HasColumnName("username");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Password).HasColumnName("password");
                entity.Property(e => e.Role)
                    .HasColumnName("role");
                entity.Property(e => e.CreatedAt).HasColumnName("createdat");
            });

            // Configure TaskItems entity
            modelBuilder.Entity<TaskItem>(entity =>
            {
                entity.ToTable("taskitems");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Status)
                      .HasColumnName("status")
                      .HasColumnType("task_status");
                entity.Property(e => e.Priority)
                      .HasColumnName("priority")
                      .HasColumnType("task_priority");
                entity.Property(e => e.CreatorId).HasColumnName("creatorid");
                entity.Property(e => e.AssigneeId).HasColumnName("assigneeid");
                entity.Property(e => e.CreatedAt).HasColumnName("createdat");
                entity.Property(e => e.UpdatedAt).HasColumnName("updatedat");

                entity.HasOne(t => t.Creator)
                    .WithMany(u => u.CreatedTasks)
                    .HasForeignKey(t => t.CreatorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.Assignee)
                    .WithMany(u => u.AssignedTasks)
                    .HasForeignKey(t => t.AssigneeId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed admin user
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@taskmanagement.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    Role = UserRole.ADMIN,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    Username = "user1",
                    Email = "user1@taskmanagement.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("user123"),
                    Role = UserRole.USER,
                    CreatedAt = DateTime.UtcNow
                }
            );

            // Seed sample tasks
            modelBuilder.Entity<TaskItem>().HasData(
                new TaskItem
                {
                    Id = 1,
                    Title = "Setup project infrastructure",
                    Description = "Initialize the task management system with proper authentication",
                    Status = TaskManagement.Server.Models.TaskStatus.DONE,
                    Priority = TaskManagement.Server.Models.TaskPriority.High,
                    CreatorId = 1,
                    AssigneeId = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    UpdatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new TaskItem
                {
                    Id = 2,
                    Title = "Implement user registration",
                    Description = "Create endpoints for user registration and validation",
                    Status = TaskManagement.Server.Models.TaskStatus.IN_PROGRESS,
                    Priority = TaskManagement.Server.Models.TaskPriority.High,
                    CreatorId = 1,
                    AssigneeId = 2,
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow
                },
                new TaskItem
                {
                    Id = 3,
                    Title = "Design dashboard UI",
                    Description = "Create an intuitive dashboard for task management",
                    Status = TaskManagement.Server.Models.TaskStatus.TODO,
                    Priority = TaskManagement.Server.Models.TaskPriority.Medium,
                    CreatorId = 2,
                    AssigneeId = 2,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
        }
    }
}
