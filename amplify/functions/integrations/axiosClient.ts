import axios, { AxiosInstance, AxiosError } from 'axios';

export class AxiosClient {
  private static instances: Map<string, AxiosClient> = new Map();
  private apiClient: AxiosInstance;

  private constructor(baseURL: string) {
    console.log(`Creating new AxiosClient instance for baseURL: ${baseURL}`);
    this.apiClient = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('Request:', {
          method: config.method,
          url: config.url,
          data: config.data,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log('Response:', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => this.handleError(error)
    );
  }

  public static getInstance(baseURL: string): AxiosClient {
    console.log(`Getting AxiosClient instance for baseURL: ${baseURL}`);
    if (!this.instances.has(baseURL)) {
      console.log(`Creating new instance for baseURL: ${baseURL}`);
      this.instances.set(baseURL, new AxiosClient(baseURL));
    }
    return this.instances.get(baseURL)!;
  }

  public getClient(): AxiosInstance {
    return this.apiClient;
  }

  private handleError(error: AxiosError): Promise<never> {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response) {
      const message = (error.response.data as any)?.message || error.message;
      const status = error.response.status;

      switch (status) {
        case 404:
          throw new Error(`Resource not found: ${message}`);
        case 400:
          throw new Error(`Invalid request: ${message}`);
        case 403:
          throw new Error(`Access denied: ${message}`);
        case 429:
          throw new Error(`Rate limit exceeded: ${message}`);
        case 500:
          throw new Error(`Server error: ${message}`);
        default:
          throw new Error(`API error: ${message}`);
      }
    }
    throw error;
  }
}
