import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';
import AuthenticationTokenManager from '../../Applications/security/AuthenticationTokenManager.js';

const createAuthenticationMiddleware = (container) => {
  return async (req, res, next) => {
    const authenticationTokenManager = container.getInstance(AuthenticationTokenManager.name);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AuthenticationError('Missing authentication'));
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await authenticationTokenManager.verifyAccessToken(token);
      req.auth = { credentials: { id: payload.id } };
      return next();
    } catch (_error) {
      return next(new AuthenticationError('access token tidak valid'));
    }
  };
};

export default createAuthenticationMiddleware;
