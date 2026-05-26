import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '~/hooks/useAuthStore';
import { errorService } from '~/services/ErrorService';
import type { TableParams } from '~/hooks/useTableQuery';
import { useCartStore } from '~/hooks/useCartStore';

// Interface para parâmetros de query
export interface QueryParams {
  [key: string]: string | number | boolean | undefined | QueryParams;
}

// Interface para dados de requisição
export interface RequestData {
  [key: string]: unknown;
}

// Interface para opções de requisição extendida
export interface RequestOptions extends Omit<
  AxiosRequestConfig,
  'method' | 'data' | 'headers'
> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: RequestData;
  headers?: Record<string, string>;
}

class Request {
  static getQueryParams(paramToBuild: QueryParams): string {
    const filteredParams = Object.entries(paramToBuild).filter(
      ([, value]) => value !== undefined,
    );
    const searchParams = new URLSearchParams(
      filteredParams.map(([key, value]) => [key, String(value)]),
    );
    return searchParams.toString();
  }

  static removeStartEndBar(text: string) {
    return text.replace(/^\/|\/+$/g, '');
  }

  static getServerUri(): string {
    const serverUri = import.meta.env.VITE_API_URL || '';
    return Request.removeStartEndBar(serverUri);
  }

  static async sendCustom<T = unknown>(url: string, options: RequestOptions): Promise<T> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    const { method, data, headers = {}, ...restOptions } = options;
    const config: AxiosRequestConfig = {
      method: method || 'GET',
      url,
      headers: Object.assign(defaultHeaders, headers),
      ...restOptions,
    };

    if (data !== undefined) {
      config.data = data;
    }

    return axios(config).then((response: AxiosResponse<T>) => response.data);
  }

  static async send<T = unknown>(endPoint: string, options: RequestOptions): Promise<T> {
    const serverUri = Request.getServerUri();
    const endPointSanitized = Request.removeStartEndBar(endPoint);
    const URI = endPoint.includes('http')
      ? endPoint
      : `${serverUri}/${endPointSanitized}`;
    const { method, data, headers = {} } = options;
    const token = useAuthStore.getState().token; //StorageHandler.getAuthToken();

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: '',
    };
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }
    const config: AxiosRequestConfig = {
      method: method || 'GET',
      url: URI.endsWith('index.php') ? `${URI}/` : URI,
      headers: Object.assign(defaultHeaders, headers),
    };

    if (data !== undefined) {
      config.data = data;
    }

    return axios(config)
      .then((response: AxiosResponse<T>) => {
        return response.data;
      })
      .catch((error: unknown) => {
        console.log(URI, error);
        if (axios.isAxiosError(error)) {
          const { response } = error;
          // Logout on unauthorized
          if ([401, 403].includes(response?.status || 0)) {
            useAuthStore.getState().logout();
            useCartStore.getState().clearCart();
          }

          // Try to extract friendly message from backend
          const status = response?.status;
          let message = 'Ocorreu um erro inesperado. Tente novamente.';
          try {
            const data = response?.data as any;
            if (!data) {
              message = response?.statusText || message;
            } else if (typeof data === 'string') {
              message = data;
            } else if (data.message) {
              message = data.message;
            } else if (data.error) {
              message =
                typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
            } else if (data.errors) {
              if (Array.isArray(data.errors)) {
                message = data.errors.map((e: any) => e.message || e).join(', ');
              } else if (typeof data.errors === 'object') {
                message = Object.values(data.errors)
                  .map((v: any) => (Array.isArray(v) ? v.join(', ') : String(v)))
                  .join(', ');
              }
            }
          } catch (e) {
            // ignore parsing errors
          }

          errorService.notify({
            title: status ? `Erro ${status}` : undefined,
            message,
            code: status,
            meta: { url: URI, raw: response?.data },
          });
        }

        return Promise.reject(error);
      });
  }

  static async post<T = unknown>(
    endPoint: string,
    data: RequestData = {},
    options: RequestOptions = {},
  ): Promise<T> {
    return Request.send<T>(endPoint, {
      ...options,
      method: 'POST',
      data,
    });
  }

  static async put<T = unknown>(
    endPoint: string,
    data: RequestData = {},
    options: RequestOptions = {},
  ): Promise<T> {
    return Request.send<T>(endPoint, {
      ...options,
      method: 'PUT',
      data,
    });
  }
  static async patch<T = unknown>(
    endPoint: string,
    data: RequestData = {},
    options: RequestOptions = {},
  ): Promise<T> {
    return Request.send<T>(endPoint, {
      ...options,
      method: 'PATCH',
      data,
    });
  }

  static async get<T = unknown>(
    endPoint: string,
    params: QueryParams = {},
    options: RequestOptions = {},
  ): Promise<T> {
    const hasParams = Object.keys(params).length;
    const URI = `${endPoint}${hasParams ? '?' + Request.getQueryParams(params) : ''}`;
    return Request.send<T>(URI, { ...options, method: 'GET' });
  }

  static async getTableData<T = unknown>(
    endPoint: string,
    tableParams: TableParams,
    options: RequestOptions = {},
  ): Promise<{ data: T[]; total: number }> {
    const filters = {} as Record<string, string | boolean | number | any[]>;

    for (let filterKey in tableParams.filters) {
      const filterValue = tableParams.filters[filterKey] as
        | string
        | boolean
        | number
        | any[];
      const isEmptyArray = Array.isArray(filterValue) && filterValue.length === 0;
      if (filterValue !== null && filterValue !== undefined && !isEmptyArray) {
        filters[filterKey] = filterValue;
      }
    }
    const params = {
      page: tableParams.page,
      pageSize: tableParams.pageSize,
      search: tableParams.search || '',
      filters,
      sort: tableParams.sorters,
    };

    return Request.send<{ data: T[]; total: number }>(endPoint, {
      ...options,
      data: params,
      method: 'POST',
    });
  }

  static async delete<T = unknown>(
    endPoint: string,
    data: RequestData = {},
    options: RequestOptions = {},
  ): Promise<T> {
    return Request.send<T>(endPoint, {
      ...options,
      method: 'DELETE',
      data,
    });
  }
}

export { Request };
export default Request;
