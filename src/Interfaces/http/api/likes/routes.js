import express from 'express';
import createAuthenticationMiddleware from '../../../../Infrastructures/security/AuthenticationMiddleware.js';

const createLikesRouter = (handler, container) => {
  const router = express.Router({ mergeParams: true });
  const authMiddleware = createAuthenticationMiddleware(container);

  router.put('/', authMiddleware, handler.putLikeHandler);

  return router;
};

export default createLikesRouter;
