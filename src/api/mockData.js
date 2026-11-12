const createSeedData = () => [
  {
    _id: '650000000000000000000001',
    name: 'Lanzamiento de producto',
    createdAt: '2026-10-20T12:00:00.000Z',
    updatedAt: '2026-10-20T12:00:00.000Z',
    columns: [
      {
        _id: '650000000000000000000011',
        title: 'Pendiente',
        board: '650000000000000000000001',
        createdAt: '2026-10-20T12:10:00.000Z',
        updatedAt: '2026-10-20T12:10:00.000Z',
        tickets: [
          {
            _id: '650000000000000000000101',
            title: 'Definir alcance del MVP',
            description: 'Acordar funcionalidades para la primera entrega.',
            priority: 'high',
            column: '650000000000000000000011',
            createdAt: '2026-10-20T12:20:00.000Z',
            updatedAt: '2026-10-20T12:20:00.000Z',
          },
          {
            _id: '650000000000000000000102',
            title: 'Preparar entrevistas',
            description: 'Seleccionar participantes para las entrevistas.',
            priority: 'normal',
            column: '650000000000000000000011',
            createdAt: '2026-10-20T12:30:00.000Z',
            updatedAt: '2026-10-20T12:30:00.000Z',
          },
        ],
      },
      {
        _id: '650000000000000000000012',
        title: 'En progreso',
        board: '650000000000000000000001',
        createdAt: '2026-10-20T12:15:00.000Z',
        updatedAt: '2026-10-20T12:15:00.000Z',
        tickets: [
          {
            _id: '650000000000000000000103',
            title: 'Diseñar flujo de onboarding',
            description: 'Crear el primer borrador de experiencia.',
            priority: 'normal',
            column: '650000000000000000000012',
            createdAt: '2026-10-20T12:35:00.000Z',
            updatedAt: '2026-10-20T12:35:00.000Z',
          },
        ],
      },
      {
        _id: '650000000000000000000013',
        title: 'Hecho',
        board: '650000000000000000000001',
        createdAt: '2026-10-20T12:18:00.000Z',
        updatedAt: '2026-10-20T12:18:00.000Z',
        tickets: [],
      },
    ],
  },
  {
    _id: '650000000000000000000002',
    name: 'Mejoras de plataforma',
    createdAt: '2026-10-19T12:00:00.000Z',
    updatedAt: '2026-10-19T12:00:00.000Z',
    columns: [
      {
        _id: '650000000000000000000021',
        title: 'Por hacer',
        board: '650000000000000000000002',
        createdAt: '2026-10-19T12:10:00.000Z',
        updatedAt: '2026-10-19T12:10:00.000Z',
        tickets: [
          {
            _id: '650000000000000000000201',
            title: 'Revisar métricas de rendimiento',
            description: 'Identificar las rutas con mayor latencia.',
            priority: 'low',
            column: '650000000000000000000021',
            createdAt: '2026-10-19T12:20:00.000Z',
            updatedAt: '2026-10-19T12:20:00.000Z',
          },
        ],
      },
    ],
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const createId = () => {
  const randomPart = Math.floor(Math.random() * 0xffffffffffff)
    .toString(16)
    .padStart(12, '0');
  return `${Date.now().toString(16).padStart(12, '0')}${randomPart}`;
};

const createMockError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const findBoard = (boards, boardId) => {
  const board = boards.find((item) => item._id === boardId);
  if (!board) throw createMockError('Tablero no encontrado', 404);
  return board;
};

const findColumn = (board, columnId) => {
  const column = board.columns.find((item) => item._id === columnId);
  if (!column) throw createMockError('Columna no encontrada', 404);
  return column;
};

export const createMockStore = (initialData = createSeedData()) => {
  const boards = clone(initialData);

  return {
    getAllBoards() {
      return clone(
        [...boards]
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
          .map(({ _id, name, createdAt, updatedAt }) => ({
            _id,
            name,
            createdAt,
            updatedAt,
          }))
      );
    },

    getBoardById(boardId) {
      return clone(findBoard(boards, boardId));
    },

    createBoard(boardData) {
      const name = boardData?.title ?? boardData?.name;
      if (typeof name !== 'string' || !name.trim()) {
        throw createMockError('El título del tablero es obligatorio', 400);
      }

      const now = new Date().toISOString();
      const board = {
        _id: createId(),
        name: name.trim(),
        createdAt: now,
        updatedAt: now,
        columns: [],
      };
      boards.push(board);
      return clone(board);
    },

    deleteBoard(boardId) {
      const index = boards.findIndex((item) => item._id === boardId);
      if (index < 0) throw createMockError('Tablero no encontrado', 404);
      boards.splice(index, 1);
    },

    createColumn(boardId, columnData) {
      const board = findBoard(boards, boardId);
      if (typeof columnData?.title !== 'string' || !columnData.title.trim()) {
        throw createMockError('El título de la columna es obligatorio', 400);
      }

      const now = new Date().toISOString();
      const column = {
        _id: createId(),
        title: columnData.title.trim(),
        board: boardId,
        createdAt: now,
        updatedAt: now,
        tickets: [],
      };
      board.columns.push(column);
      board.updatedAt = now;
      return clone(column);
    },

    deleteColumn(boardId, columnId) {
      const board = findBoard(boards, boardId);
      findColumn(board, columnId);
      board.columns = board.columns.filter((item) => item._id !== columnId);
      board.updatedAt = new Date().toISOString();
    },

    createTicket(boardId, columnId, ticketData) {
      const board = findBoard(boards, boardId);
      const column = findColumn(board, columnId);
      if (typeof ticketData?.title !== 'string' || !ticketData.title.trim()) {
        throw createMockError('El título del ticket es obligatorio', 400);
      }
      const priority = ticketData.priority ?? 'normal';
      if (!['low', 'normal', 'high'].includes(priority)) {
        throw createMockError('La prioridad del ticket no es válida', 400);
      }

      const now = new Date().toISOString();
      const ticket = {
        _id: createId(),
        title: ticketData.title.trim(),
        description:
          typeof ticketData.description === 'string'
            ? ticketData.description.trim()
            : '',
        priority,
        column: columnId,
        createdAt: now,
        updatedAt: now,
      };
      column.tickets.push(ticket);
      column.updatedAt = now;
      board.updatedAt = now;
      return clone(ticket);
    },

    moveTicket(boardId, columnId, ticketId, updateData) {
      const board = findBoard(boards, boardId);
      const sourceColumn = findColumn(board, columnId);
      const ticketIndex = sourceColumn.tickets.findIndex(
        (item) => item._id === ticketId
      );
      if (ticketIndex < 0) {
        throw createMockError(
          'Ticket no encontrado en la columna especificada',
          404
        );
      }

      const ticket = sourceColumn.tickets[ticketIndex];
      const targetColumnId = updateData?.targetColumnId ?? columnId;
      const targetColumn = findColumn(board, targetColumnId);
      if (
        updateData?.title !== undefined &&
        (typeof updateData.title !== 'string' || !updateData.title.trim())
      ) {
        throw createMockError('El título no puede estar vacío', 400);
      }
      if (
        updateData?.description !== undefined &&
        typeof updateData.description !== 'string'
      ) {
        throw createMockError('La descripción debe ser texto', 400);
      }

      const now = new Date().toISOString();
      if (targetColumnId !== columnId) {
        sourceColumn.tickets.splice(ticketIndex, 1);
        targetColumn.tickets.push(ticket);
      }
      if (updateData?.title !== undefined) {
        ticket.title = updateData.title.trim();
      }
      if (updateData?.description !== undefined) {
        ticket.description = updateData.description.trim();
      }
      ticket.column = targetColumnId;
      ticket.updatedAt = now;
      sourceColumn.updatedAt = now;
      targetColumn.updatedAt = now;
      board.updatedAt = now;
      return clone(ticket);
    },

    deleteTicket(boardId, columnId, ticketId) {
      const board = findBoard(boards, boardId);
      const column = findColumn(board, columnId);
      const ticketIndex = column.tickets.findIndex(
        (item) => item._id === ticketId
      );
      if (ticketIndex < 0) {
        throw createMockError(
          'Ticket no encontrado en la columna especificada',
          404
        );
      }

      column.tickets.splice(ticketIndex, 1);
      const now = new Date().toISOString();
      column.updatedAt = now;
      board.updatedAt = now;
    },
  };
};

export const mockStore = createMockStore();
