import { apiClient } from './api';
import {
  DocType,
  GetDocumentsResponse,
  UpdateSpecificDocResponse,
} from '../types/document';

export class DocumentService {
  /**
   * Upload specific document via POST /documents/:docType
   * Accepts multipart FormData with file fields:
   * - frontPhoto / backPhoto (for drivingLicense, rc, aadharCard)
   * - photo (for insurance, permit)
   * and text fields (dlNo, rcNo, insuranceNo, permitNo, cardNo, type, etc.)
   */
  async uploadSpecificDocument(
    docType: DocType,
    formData: FormData
  ): Promise<UpdateSpecificDocResponse> {
    return await apiClient.postFormData<UpdateSpecificDocResponse>(
      `/documents/${docType}`,
      formData
    );
  }

  /**
   * Get authenticated driver's documents from GET /documents/me
   */
  async getMyDocuments(): Promise<GetDocumentsResponse> {
    return await apiClient.get<GetDocumentsResponse>('/documents/me');
  }
}

export const documentService = new DocumentService();
