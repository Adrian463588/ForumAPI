import express from 'express';
import createAuthenticationMiddleware from '../../../../Infrastructures/security/AuthenticationMiddleware.js';

const createThreadsRouter = (handler, container) => {
  const router = express.Router();
  const authMiddleware = createAuthenticationMiddleware(container);

  router.post('/', authMiddleware, handler.postThreadHandler);
  router.get('/:threadId', handler.getThreadByIdHandler);

  return router;
};

export default createThreadsRouter;
