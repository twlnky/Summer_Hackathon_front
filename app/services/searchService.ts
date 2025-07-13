import apiClient from './api';
import { SearchResponse, PageParam } from '../types';

export class SearchService {
  static async search(
    query: string,
    pageParam: PageParam = { page: 0, size: 10 }
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    params.append('request', query);
    params.append('page', pageParam.page.toString());
    params.append('size', pageParam.size.toString());
    
    const response = await apiClient.get<SearchResponse>(`/search?${params.toString()}`);
    return response.data;
  }
}

export default SearchService; 