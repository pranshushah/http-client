import fetchMock from 'jest-fetch-mock';
import { HttpError } from '../..';
import { HttpClient } from '../HttpClient';
describe('Testing get method with differnet properties', () => {
  it('should get basic Response with given-json', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: 'pranshu' }));
    const response = await HttpClient.get('https://www.x.com');
    const data = await response.json();
    expect(data).toEqual({ name: 'pranshu' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('should concat baseUrl on relative url', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async input => {
      if (typeof input !== 'object') {
        throw new TypeError('Expect to have an object request');
      }

      return new Response(input.url);
    };
    const res = await HttpClient.get('/api', {
      baseUrl: 'https://www.google.com',
    });
    const url = await res.text();
    expect(url).toBe('https://www.google.com/api');
    globalThis.fetch = originalFetch;
  });

  it('should not concat baseUrl on absoulte url', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async input => {
      if (typeof input !== 'object') {
        throw new TypeError('Expect to have an object request');
      }

      return new Response(input.url);
    };
    const res = await HttpClient.get('https://www.x.com', {
      baseUrl: 'https://www.google.com',
    });
    const url = await res.text();
    expect(url).toBe('https://www.x.com/');
    globalThis.fetch = originalFetch;
  });
  it('should throw HttpError', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: 'pranshu' }), {
      status: 401,
      statusText: 'Unauthorized',
    });
    try {
      await HttpClient.get('https://www.x.com');
    } catch (error) {
      expect(error instanceof HttpError).toBeTruthy();
    }
  });
  it('should not throw HttpError', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ name: 'pranshu' }), {
      status: 401,
      statusText: 'Unauthorized',
    });
    try {
      const res = await HttpClient.get('https://www.x.com', {
        validateStatus(status) {
          return status < 500;
        },
      });
      expect(res.status).toBe(401);
    } catch (error) {
      expect(error instanceof HttpError).toBeFalsy();
    }
  });
});