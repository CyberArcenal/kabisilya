// src/renderer/api/core/core/themes.ts

import type { ApiResponse } from "../shared";

type Theme = 'light' | 'dark';

class ThemesAPI {
  async getCurrent(): Promise<ApiResponse<Theme>> {
    return window.backendAPI.themes({ method: 'get' });
  }

  async set(theme: Theme): Promise<ApiResponse<Theme>> {
    return window.backendAPI.themes({
      method: 'set',
      params: { theme }
    });
  }

  async toggle(): Promise<ApiResponse<Theme>> {
    return window.backendAPI.themes({ method: 'toggle' });
  }
}

export const themesAPI = new ThemesAPI();