import axiosInstance from "./axiosInstance";

export interface Tag {
  tagId: number;
  tagName: string;
}

export interface TagLookupResponse {
  message: string;
  statusCode: string;
  data: Tag[];
}

export interface CreateTagRequest {
  tagName: string;
  note?: string | null;
}

export interface CreateTagResponse {
  message: string;
  statusCode: string;
  data: string; // Returns tag ID as string
}

class TagService {
  async lookupTags(tagName: string): Promise<TagLookupResponse> {
    const response = await axiosInstance.get<TagLookupResponse>(
      "/Tags/lookup",
      {
        params: { TagName: tagName },
      }
    );
    return response.data;
  }

  async createTag(data: CreateTagRequest): Promise<CreateTagResponse> {
    const response = await axiosInstance.post<CreateTagResponse>("/Tags", data);
    return response.data;
  }
}

const tagService = new TagService();
export default tagService;
