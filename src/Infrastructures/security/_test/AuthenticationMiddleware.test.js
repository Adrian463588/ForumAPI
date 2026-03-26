import { describe, it, expect, vi } from 'vitest';
import createAuthenticationMiddleware from '../AuthenticationMiddleware.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';
import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';

describe('createAuthenticationMiddleware', () => {
  const createMockContainer = (mockTokenManager) => ({
    getInstance: vi.fn().mockReturnValue(mockTokenManager),
  });

  const createMockRes = () => ({});

  it('should call next with AuthenticationError when no authorization header', async () => {
    // Arrange
    const mockTokenManager = new AuthenticationTokenManager();
    const container = createMockContainer(mockTokenManager);
    const middleware = createAuthenticationMiddleware(container);

    const req = { headers: {} };
    const res = createMockRes();
    const next = vi.fn();

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toEqual('Missing authentication');
  });

  it('should call next with AuthenticationError when authorization header does not start with Bearer', async () => {
    // Arrange
    const mockTokenManager = new AuthenticationTokenManager();
    const container = createMockContainer(mockTokenManager);
    const middleware = createAuthenticationMiddleware(container);

    const req = { headers: { authorization: 'Token some-token' } };
    const res = createMockRes();
    const next = vi.fn();

    // Action
    await middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toEqual('Missing authentication');
  });

  it('should call next with AuthenticationError when access token is invalid', async () => {
    // Arrange
    const mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyAccessToken = vi.fn()
      .mockRejectedValue(new Error('token invalid'));
    const container = createMockContainer(mockTokenManager);
    const middleware = createAuthenticationMiddleware(container);

    const req = { headers: { authorization: 'Bearer invalid_token' } };
    const res = createMockRes();
    const next = vi.fn();

    // Action
    await middleware(req, res, next);

    // Assert
    expect(mockTokenManager.verifyAccessToken).toHaveBeenCalledWith('invalid_token');
    expect(next).toHaveBeenCalledWith(expect.any(AuthenticationError));
    expect(next.mock.calls[0][0].message).toEqual('access token tidak valid');
  });

  it('should set req.auth and call next without error when token is valid', async () => {
    // Arrange
    const mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyAccessToken = vi.fn()
      .mockResolvedValue({ id: 'user-123' });
    const container = createMockContainer(mockTokenManager);
    const middleware = createAuthenticationMiddleware(container);

    const req = { headers: { authorization: 'Bearer valid_token' } };
    const res = createMockRes();
    const next = vi.fn();

    // Action
    await middleware(req, res, next);

    // Assert
    expect(mockTokenManager.verifyAccessToken).toHaveBeenCalledWith('valid_token');
    expect(req.auth).toEqual({ credentials: { id: 'user-123' } });
    expect(next).toHaveBeenCalledWith();
    expect(container.getInstance).toHaveBeenCalledWith(AuthenticationTokenManager.name);
  });
});
