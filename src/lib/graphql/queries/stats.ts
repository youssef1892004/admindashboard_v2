export const GET_DASHBOARD_STATS = `
  query GetDashboardStats {
    booksCount: libaray_Book_aggregate {
      aggregate {
        count
      }
    }
    chaptersCount: libaray_Chapter_aggregate {
      aggregate {
        count
      }
    }
  }
`;