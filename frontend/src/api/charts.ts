const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const chartsApi = {
  getHeatmapUrl: (username: string): string =>
    `${API_BASE_URL}/api/charts/${username}/heatmap`,

  getLanguagesChartUrl: (username: string): string =>
    `${API_BASE_URL}/api/charts/${username}/languages`,

  getStarsChartUrl: (username: string): string =>
    `${API_BASE_URL}/api/charts/${username}/stars`,

  getCommitsChartUrl: (username: string): string =>
    `${API_BASE_URL}/api/charts/${username}/commits`,
};
