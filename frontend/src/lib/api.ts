const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Refresh token from localStorage on each request
    this.token = localStorage.getItem('auth_token');
    
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('API Request:', { url, hasToken: !!this.token, headers: config.headers });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('API Error:', { status: response.status, error });
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', { endpoint, data });
    return data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async login(memberId: string, nationalId: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ memberId, nationalId }),
    });
  }

  async verifyOTP(memberId: string, otp: string) {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ memberId, otp }),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // User endpoints
  async getUsers(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ 
      page: page.toString(), 
      limit: limit.toString(),
      ...(search && { search })
    });
    return this.request(`/api/users?${params}`);
  }

  async getBranchStats() {
    return this.request('/api/users/branch-stats');
  }

  async importUsers(formData: FormData) {
    return this.request('/api/users/import', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  // Election endpoints
  async getElections() {
    return this.request('/api/elections');
  }

  async createElection(data: any) {
    return this.request('/api/elections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateElection(id: string, data: any) {
    return this.request(`/api/elections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Position endpoints
  async getPositions(electionId?: string) {
    const params = electionId ? `/${electionId}/positions` : '/positions';
    return this.request(`/api/elections${params}`);
  }

  async createPosition(data: any) {
    return this.request('/api/elections/positions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Candidate endpoints
  async getCandidates(positionId?: string) {
    return this.request('/api/elections/candidates');
  }

  async createCandidate(data: any) {
    return this.request('/api/elections/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Vote endpoints
  async getBallot(userId: string) {
    return this.request(`/api/votes/ballot/${userId}`);
  }

  async castVote(userId: string, votes: any[]) {
    return this.request('/api/votes/cast', {
      method: 'POST',
      body: JSON.stringify({ userId, votes }),
    });
  }

  // Branch endpoints
  async getBranches() {
    return this.request('/api/branches');
  }

  // Upload candidate photo
  async uploadCandidatePhoto(formData: FormData) {
    // Refresh token for upload request
    this.token = localStorage.getItem('auth_token');
    
    return this.request('/api/upload/candidate-photo', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData - browser sets it automatically
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/api/dashboard/admin');
  }
}

export const api = new ApiClient(API_BASE_URL);