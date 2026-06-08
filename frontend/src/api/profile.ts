import api from './axios';

export interface GitHubProfile {
  username: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  fork: boolean;
  owner: {
    login: string;
  };
}

export interface LanguageStats {
  name: string;
  percentage: number;
  color: string;
}

export interface CommitStats {
  total_commits: number;
  commits_per_week: Record<string, number>;
  most_active_day: string;
  most_active_hour: number;
}

export interface ProfileData {
  username: string;
  display_name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  following: number;
  top_repos: any[];
  languages: any[];
  commit_stats: CommitStats;
  activity_heatmap: any;
  summary: {
    total_stars: number;
    total_repos: number;
    total_forks: number;
    top_language: string | null;
    account_age_days: number;
    public_gists: number;
  };
  fetched_at: string;
}

export interface CompareData {
  user1: string;
  user2: string;
  stats: {
    total_stars: { user1: number; user2: number; winner: string };
    total_repos: { user1: number; user2: number; winner: string };
    total_forks: { user1: number; user2: number; winner: string };
    followers: { user1: number; user2: number; winner: string };
    total_commits: { user1: number; user2: number; winner: string };
    account_age_days: { user1: number; user2: number; winner: string };
    top_language: { user1: string | null; user2: string | null; winner: string };
  };
}


export const profileApi = {
  getProfile: async (username: string): Promise<ProfileData> => {
    const response = await api.get<ProfileData>(`/api/profile/${username}`);
    return response.data;
  },

  compare: async (u1: string, u2: string): Promise<CompareData> => {
    const response = await api.get<CompareData>('/api/compare/', {
      params: { u1, u2 },
    });
    return response.data;
  },
};
