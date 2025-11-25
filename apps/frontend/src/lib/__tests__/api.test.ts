import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from '../api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiError', () => {
  it('should create ApiError with message', () => {
    const error = new ApiError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('ApiError');
  });

  it('should create ApiError with status and data', () => {
    const error = new ApiError('Test error', 404, { detail: 'Not found' });
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.data).toEqual({ detail: 'Not found' });
  });
});

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on failed GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: { message: 'Resource not found' } }),
      });

      try {
        await api.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Resource not found');
      }
    });

    it('should handle network errors in GET request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      try {
        await api.get('/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Network failure');
      }
    });

    it('should handle non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(api.get('/test')).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with data', async () => {
      const mockData = { id: 1, name: 'Created' };
      const postData = { name: 'New Item' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.post('/test', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST request without data', async () => {
      const mockData = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.post('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on failed POST request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: { message: 'Invalid data' } }),
      });

      try {
        await api.post('/test', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Invalid data');
      }
    });

    it('should handle network errors in POST request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(api.post('/test', {})).rejects.toThrow('Connection timeout');
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request with data', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const putData = { name: 'Updated Item' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.put('/test/1', putData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(putData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make PUT request without data', async () => {
      const mockData = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.put('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          body: undefined,
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on failed PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: { message: 'Resource not found' } }),
      });

      await expect(api.put('/test/1', {})).rejects.toThrow('Resource not found');
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request with data', async () => {
      const mockData = { id: 1, name: 'Patched' };
      const patchData = { name: 'Patched Item' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.patch('/test/1', patchData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patchData),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should make PATCH request without data', async () => {
      const mockData = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.patch('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: undefined,
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on failed PATCH request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ error: { message: 'Access denied' } }),
      });

      try {
        await api.patch('/test/1', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Access denied');
      }
    });

    it('should handle network errors in PATCH request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await api.patch('/test/1', {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Network error');
      }
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const mockData = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on failed DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: { message: 'Resource not found' } }),
      });

      await expect(api.delete('/test/1')).rejects.toThrow('Resource not found');
    });

    it('should handle network errors in DELETE request', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection lost'));

      await expect(api.delete('/test/1')).rejects.toThrow('Connection lost');
    });
  });

  describe('Error handling', () => {
    it('should preserve ApiError when thrown from handleResponse', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: { message: 'Server error' } }),
      });

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(500);
        expect((error as ApiError).message).toBe('Server error');
      }
    });

    it('should wrap generic errors in ApiError', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe('Network request failed');
      }
    });

    it('should include error data in ApiError', async () => {
      const errorData = { error: { message: 'Validation failed', fields: ['name'] } };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => errorData,
      });

      try {
        await api.post('/test', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).data).toEqual(errorData);
      }
    });
  });
});
