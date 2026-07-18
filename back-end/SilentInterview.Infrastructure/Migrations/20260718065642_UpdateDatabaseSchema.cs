using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SilentInterview.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InterviewAnswers_InterviewSessions_InterviewSessionId1",
                table: "InterviewAnswers");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewSessions_JobApplications_JobApplicationId1",
                table: "InterviewSessions");

            migrationBuilder.DropIndex(
                name: "IX_InterviewSessions_JobApplicationId1",
                table: "InterviewSessions");

            migrationBuilder.DropIndex(
                name: "IX_InterviewAnswers_InterviewSessionId1",
                table: "InterviewAnswers");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "JobApplicationId1",
                table: "InterviewSessions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "InterviewAnswers");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "InterviewAnswers");

            migrationBuilder.DropColumn(
                name: "InterviewSessionId1",
                table: "InterviewAnswers");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "InterviewAnswers");

            migrationBuilder.DropColumn(
                name: "Score",
                table: "InterviewAnswers");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "InterviewAnswers");

            migrationBuilder.RenameColumn(
                name: "DurationSeconds",
                table: "InterviewAnswers",
                newName: "Order");

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Token = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    Expires = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "InterviewAnswers",
                newName: "DurationSeconds");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "JobApplicationId1",
                table: "InterviewSessions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "InterviewAnswers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "InterviewAnswers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "InterviewSessionId1",
                table: "InterviewAnswers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "InterviewAnswers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<double>(
                name: "Score",
                table: "InterviewAnswers",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "InterviewAnswers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewSessions_JobApplicationId1",
                table: "InterviewSessions",
                column: "JobApplicationId1");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnswers_InterviewSessionId1",
                table: "InterviewAnswers",
                column: "InterviewSessionId1");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewAnswers_InterviewSessions_InterviewSessionId1",
                table: "InterviewAnswers",
                column: "InterviewSessionId1",
                principalTable: "InterviewSessions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewSessions_JobApplications_JobApplicationId1",
                table: "InterviewSessions",
                column: "JobApplicationId1",
                principalTable: "JobApplications",
                principalColumn: "Id");
        }
    }
}
