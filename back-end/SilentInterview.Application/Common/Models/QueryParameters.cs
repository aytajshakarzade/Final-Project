namespace SilentInterview.Application.Common.Models;

public class QueryParameters : PaginationParameters
{
    public string? Search { get; set; }

    public string SortBy { get; set; } = "id";

    public bool Descending { get; set; }
}