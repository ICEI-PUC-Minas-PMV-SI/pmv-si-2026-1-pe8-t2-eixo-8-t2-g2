import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
};

class SupabaseStorage {
  private client: SupabaseClient;

  constructor() {
    const { SUPABASE_URL = '', SUPABASE_SERVICE_ROLE_KEY = '' } = process.env;

    if (!SUPABASE_URL) {
      throw new Error('SUPABASE_URL not configured');
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    this.client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async createBucket(
    id: string,
    options: {
      fileSizeLimit?: string | number;
      allowedMimeTypes?: string[];
      isPublic?: boolean;
    } = {},
  ) {
    const { fileSizeLimit = null, allowedMimeTypes = null, isPublic = false } = options;

    const { data, error } = await this.client.storage.createBucket(id, {
      public: isPublic,
      fileSizeLimit,
      allowedMimeTypes,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async listBuckets() {
    const { data, error } = await this.client.storage.listBuckets();

    if (error) {
      throw error;
    }

    return data;
  }

  async getBucket(id: string) {
    const { data, error } = await this.client.storage.getBucket(id);

    if (error) {
      throw error;
    }

    return data;
  }

  async removeBucket(id: string) {
    const { data, error } = await this.client.storage.deleteBucket(id);

    if (error) {
      throw error;
    }

    return data;
  }

  async saveFile(
    bucketId: string,
    path: string,
    file: Buffer,
    options: {
      contentType?: string;
      upsert?: boolean;
    } = {},
  ) {
    const { contentType = 'application/octet-stream', upsert = false } = options;

    const { data, error } = await this.client.storage.from(bucketId).upload(path, file, {
      contentType,
      upsert,
    });

    return { data, error };
  }

  async removeFile(bucketId: string, paths: string[]) {
    const { data, error } = await this.client.storage.from(bucketId).remove(paths);

    if (error) {
      throw error;
    }

    return data;
  }

  async listFiles(bucketId: string, path = '') {
    const { data, error } = await this.client.storage.from(bucketId).list(path);

    if (error) {
      throw error;
    }

    return data;
  }

  getPublicUrl(bucketId: string, path: string) {
    return this.client.storage.from(bucketId).getPublicUrl(path);
  }

  async createSignedUrl(bucketId: string, path: string, expiresIn = 60) {
    const { data, error } = await this.client.storage
      .from(bucketId)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw error;
    }

    return data;
  }
}

export default new SupabaseStorage();
