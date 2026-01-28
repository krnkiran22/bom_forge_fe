import axios from 'axios';
import { APIResponse, ConversionStatus, ConversionHistory } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// File Upload
export async function uploadBOMFile(file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('bomFile', file);

  const response = await axios.post(`${API_URL}/api/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

// BOM Conversion
export async function startConversion(uploadId: string): Promise<APIResponse> {
  const response = await api.post('/convert', { uploadId });
  return response.data;
}

export async function getConversionStatus(
  conversionId: string
): Promise<APIResponse<ConversionStatus>> {
  const response = await api.get(`/convert/status/${conversionId}`);
  return response.data;
}

export async function getBOMData(conversionId: string): Promise<APIResponse> {
  const response = await api.get(`/convert/bom/${conversionId}`);
  return response.data;
}

export async function getExplanation(conversionId: string): Promise<APIResponse> {
  const response = await api.get(`/convert/explanation/${conversionId}`);
  return response.data;
}

export async function saveBOMEdits(
  conversionId: string,
  changes: any[]
): Promise<APIResponse> {
  const response = await api.patch(`/convert/bom/${conversionId}`, { changes });
  return response.data;
}

export async function submitFeedback(
  conversionId: string,
  corrections: any[],
  shouldLearn: boolean = true
): Promise<APIResponse> {
  const response = await api.post('/convert/feedback', {
    conversionId,
    corrections,
    shouldLearn,
  });
  return response.data;
}

// History
export async function getConversionHistory(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<APIResponse<{ conversions: ConversionHistory[]; pagination: any }>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const response = await api.get(`/history?${params}`);
  return response.data;
}

export async function deleteConversion(conversionId: string): Promise<APIResponse> {
  const response = await api.delete(`/history/${conversionId}`);
  return response.data;
}

export default api;
