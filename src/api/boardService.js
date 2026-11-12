import { apiClient, isMockMode } from './client';
import { mockStore } from './mockData';

const isNetworkError = (error) =>
  Boolean(
    error?.isAxiosError &&
      !error.response &&
      (error.request ||
        ['ERR_NETWORK', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code))
  );

const request = async (operation, mockOperation) => {
  if (isMockMode) {
    return mockOperation();
  }

  try {
    return await operation();
  } catch (error) {
    if (isNetworkError(error)) {
      return mockOperation();
    }

    if (axiosError(error)) {
      const message =
        error.response?.data?.error ??
        (error.request
          ? 'No se pudo conectar con el servidor.'
          : error.message || 'La solicitud a la API falló.');
      const apiError = new Error(message, { cause: error });
      apiError.status = error.response?.status;
      apiError.response = error.response;
      throw apiError;
    }

    throw error;
  }
};

const axiosError = (error) =>
  Boolean(error && typeof error === 'object' && 'isAxiosError' in error);

export const getAllBoards = () =>
  request(
    () => apiClient.get('/boards').then(({ data }) => data),
    () => mockStore.getAllBoards()
  );

export const getBoardById = (boardId) =>
  request(
    () =>
      apiClient
        .get(`/boards/${encodeURIComponent(boardId)}`)
        .then(({ data }) => data),
    () => mockStore.getBoardById(boardId)
  );

export const createBoard = (boardData) =>
  request(
    () => apiClient.post('/boards', boardData).then(({ data }) => data),
    () => mockStore.createBoard(boardData)
  );

export const deleteBoard = (boardId) =>
  request(
    () => apiClient.delete(`/boards/${encodeURIComponent(boardId)}`),
    () => mockStore.deleteBoard(boardId)
  );

export const createColumn = (boardId, columnData) =>
  request(
    () =>
      apiClient
        .post(
          `/boards/${encodeURIComponent(boardId)}/columns`,
          columnData
        )
        .then(({ data }) => data),
    () => mockStore.createColumn(boardId, columnData)
  );

export const deleteColumn = (boardId, columnId) =>
  request(
    () =>
      apiClient.delete(
        `/boards/${encodeURIComponent(boardId)}/columns/${encodeURIComponent(columnId)}`
      ),
    () => mockStore.deleteColumn(boardId, columnId)
  );

export const createTicket = (boardId, columnId, ticketData) =>
  request(
    () =>
      apiClient
        .post(
          `/boards/${encodeURIComponent(boardId)}/columns/${encodeURIComponent(columnId)}/tickets`,
          ticketData
        )
        .then(({ data }) => data),
    () => mockStore.createTicket(boardId, columnId, ticketData)
  );

export const moveTicket = (boardId, columnId, ticketId, targetColumnId) =>
  request(
    () =>
      apiClient
        .patch(
          `/boards/${encodeURIComponent(boardId)}/columns/${encodeURIComponent(columnId)}/tickets/${encodeURIComponent(ticketId)}`,
          { targetColumnId }
        )
        .then(({ data }) => data),
    () =>
      mockStore.moveTicket(boardId, columnId, ticketId, { targetColumnId })
  );

export const deleteTicket = (boardId, columnId, ticketId) =>
  request(
    () =>
      apiClient.delete(
        `/boards/${encodeURIComponent(boardId)}/columns/${encodeURIComponent(columnId)}/tickets/${encodeURIComponent(ticketId)}`
      ),
    () => mockStore.deleteTicket(boardId, columnId, ticketId)
  );

const boardService = {
  getAllBoards,
  getBoardById,
  createBoard,
  deleteBoard,
  createColumn,
  deleteColumn,
  createTicket,
  moveTicket,
  deleteTicket,
};

export default boardService;
