import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import boardService from '../api/boardService';
import Button from '../components/Button';
import Column from '../components/Column';
import FormField from '../components/FormField';
import StatePanel from '../components/StatePanel';
import TicketCard from '../components/TicketCard';

const columnSchema = z.object({
  title: z.string().trim().min(1, 'El nombre de la columna es obligatorio.'),
});

const ticketSchema = z.object({
  title: z.string().trim().min(1, 'El título del ticket es obligatorio.'),
  description: z.string().trim().optional(),
  priority: z.enum(['low', 'normal', 'high'], {
    errorMap: () => ({ message: 'Selecciona una prioridad válida.' }),
  }),
});

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState('');
  const [movingTicketIds, setMovingTicketIds] = useState(() => new Set());
  const pendingMoves = useRef(new Map());
  const [pendingMoveColumnIds, setPendingMoveColumnIds] = useState(
    () => new Set()
  );
  const [activeTicketColumn, setActiveTicketColumn] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const columnForm = useForm({
    resolver: zodResolver(columnSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
    },
  });
  const ticketForm = useForm({
    resolver: zodResolver(ticketSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      priority: 'normal',
    },
  });

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setBoard(await boardService.getBoardById(boardId));
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(''), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const updateColumn = (columnId, update) => {
    setBoard((current) => ({
      ...current,
      columns: current.columns.map((column) =>
        column._id === columnId ? update(column) : column
      ),
    }));
  };

  const refreshPendingMoveColumns = () => {
    setPendingMoveColumnIds(
      new Set(
        [...pendingMoves.current.values()].flatMap(
          ({ sourceColumnId, targetColumnId }) => [
            sourceColumnId,
            targetColumnId,
          ]
        )
      )
    );
  };

  const isColumnMovePending = (columnId) =>
    [...pendingMoves.current.values()].some(
      (move) =>
        move.sourceColumnId === columnId || move.targetColumnId === columnId
    );

  const onAddColumn = async ({ title }) => {
    setAddingColumn(true);
    setToast('');
    try {
      const column = await boardService.createColumn(boardId, { title });
      setBoard((current) => ({
        ...current,
        columns: [...current.columns, { ...column, tickets: [] }],
      }));
      columnForm.reset();
    } catch (error) {
      columnForm.setError('title', { type: 'server', message: error.message });
    } finally {
      setAddingColumn(false);
    }
  };

  const onAddTicket = async ({ title, description, priority }) => {
    const columnId = activeTicketColumn;
    if (!columnId || pendingMoveColumnIds.has(columnId)) return;
    setBusyId(columnId);
    setToast('');
    try {
      const ticket = await boardService.createTicket(boardId, columnId, {
        title,
        description,
        priority,
      });
      updateColumn(columnId, (column) => ({
        ...column,
        tickets: [...(column.tickets ?? []), ticket],
      }));
      ticketForm.reset();
      setActiveTicketColumn('');
    } catch (error) {
      ticketForm.setError('title', { type: 'server', message: error.message });
    } finally {
      setBusyId('');
    }
  };

  const onDeleteColumn = async (column) => {
    if (!window.confirm(`¿Eliminar la columna "${column.title}" y sus tickets?`)) return;
    setBusyId(column._id);
    setToast('');
    try {
      await boardService.deleteColumn(boardId, column._id);
      setBoard((current) => ({
        ...current,
        columns: current.columns.filter((item) => item._id !== column._id),
      }));
    } catch (error) {
      setToast(error.message);
    } finally {
      setBusyId('');
    }
  };

  const onDeleteTicket = async (column, ticket) => {
    if (!window.confirm(`¿Eliminar el ticket "${ticket.title}"?`)) return;
    setBusyId(ticket._id);
    setToast('');
    try {
      await boardService.deleteTicket(boardId, column._id, ticket._id);
      updateColumn(column._id, (current) => ({
        ...current,
        tickets: current.tickets.filter((item) => item._id !== ticket._id),
      }));
    } catch (error) {
      setToast(error.message);
    } finally {
      setBusyId('');
    }
  };

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    const sourceColumn = board.columns.find(
      (item) => item._id === source.droppableId
    );
    const targetColumn = board.columns.find(
      (item) => item._id === destination.droppableId
    );
    if (!sourceColumn || !targetColumn) return;
    if (
      isColumnMovePending(sourceColumn._id) ||
      isColumnMovePending(targetColumn._id)
    ) {
      return;
    }

    const ticket = sourceColumn.tickets?.find(
      (item) => item._id === draggableId
    );
    if (!ticket) return;
    if (pendingMoves.current.has(ticket._id)) return;

    if (sourceColumn._id === targetColumn._id) {
      if (source.index === destination.index) return;
      setBoard((current) => ({
        ...current,
        columns: current.columns.map((column) => {
          if (column._id !== sourceColumn._id) return column;
          const tickets = [...(column.tickets ?? [])];
          const [movedTicket] = tickets.splice(source.index, 1);
          tickets.splice(destination.index, 0, movedTicket);
          return { ...column, tickets };
        }),
      }));
      return;
    }

    const rollbackSnapshot = {
      sourceTickets: JSON.parse(JSON.stringify(sourceColumn.tickets ?? [])),
      targetTickets: JSON.parse(JSON.stringify(targetColumn.tickets ?? [])),
    };
    const sourceIndex = sourceColumn.tickets.findIndex(
      (item) => item._id === ticket._id
    );
    if (sourceIndex < 0) return;

    pendingMoves.current.set(ticket._id, {
      sourceColumnId: sourceColumn._id,
      targetColumnId: targetColumn._id,
      rollbackSnapshot,
    });
    refreshPendingMoveColumns();
    setMovingTicketIds((current) => new Set(current).add(ticket._id));
    setToast('');
    setBoard((current) => ({
      ...current,
      columns: current.columns.map((column) => {
        if (column._id === sourceColumn._id) {
          return {
            ...column,
            tickets: (column.tickets ?? []).filter(
              (item) => item._id !== ticket._id
            ),
          };
        }
        if (column._id === targetColumn._id) {
          const tickets = [...(column.tickets ?? [])];
          tickets.splice(
            Math.min(destination.index, tickets.length),
            0,
            ticket
          );
          return { ...column, tickets };
        }
        return column;
      }),
    }));

    try {
      const updatedTicket = await boardService.moveTicket(
        boardId,
        sourceColumn._id,
        ticket._id,
        targetColumn._id
      );
      setBoard((current) => ({
        ...current,
        columns: current.columns.map((item) => {
          if (item._id === targetColumn._id) {
            return {
              ...item,
              tickets: (item.tickets ?? []).map((entry) =>
                entry._id === ticket._id ? updatedTicket : entry
              ),
            };
          }
          return item;
        }),
      }));
    } catch (error) {
      setBoard((current) => {
        return {
          ...current,
          columns: current.columns.map((column) => {
            if (column._id === sourceColumn._id) {
              return {
                ...column,
                tickets: JSON.parse(
                  JSON.stringify(rollbackSnapshot.sourceTickets)
                ),
              };
            }
            if (column._id === targetColumn._id) {
              return {
                ...column,
                tickets: JSON.parse(
                  JSON.stringify(rollbackSnapshot.targetTickets)
                ),
              };
            }
            return column;
          }),
        };
      });
      setToast(
        `No se pudo mover el ticket. Se restauró su ubicación original. ${error.message}`
      );
    } finally {
      pendingMoves.current.delete(ticket._id);
      refreshPendingMoveColumns();
      setMovingTicketIds((current) => {
        const next = new Set(current);
        next.delete(ticket._id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <StatePanel title="Cargando tablero..." message="Estamos preparando tus columnas." />
      </main>
    );
  }

  if (loadError || !board) {
    return (
      <main className="page-shell">
        <StatePanel
          title="No se pudo abrir el tablero"
          message={loadError || 'No se encontró el tablero solicitado.'}
          action={
            <div className="state-actions">
              <Button variant="secondary" onClick={loadBoard}>
                Reintentar
              </Button>
              <Button onClick={() => navigate('/boards')}>Volver a tableros</Button>
            </div>
          }
        />
      </main>
    );
  }

  return (
    <main className="page-shell page-shell--wide">
      <Link className="back-link" to="/boards">
        ← Todos los tableros
      </Link>
      <header className="page-heading page-heading--board">
        <div>
          <span className="eyebrow">TABLERO</span>
          <h1>{board.name ?? board.title}</h1>
          <p>Visualiza el progreso y mueve el trabajo entre columnas.</p>
        </div>
      </header>

      {toast && (
        <div className="toast toast--error" role="alert" aria-live="assertive">
          <span>{toast}</span>
          <button
            className="toast__dismiss"
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => setToast('')}
          >
            ×
          </button>
        </div>
      )}

      <form className="create-column-form panel" onSubmit={columnForm.handleSubmit(onAddColumn)}>
        <FormField
          id="column-title"
          label="Nueva columna"
          placeholder="Ej. En progreso"
          error={columnForm.formState.errors.title?.message}
          {...columnForm.register('title')}
        />
        <Button type="submit" loading={addingColumn}>
          Añadir columna
        </Button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <section className="board-columns" aria-label="Columnas del tablero">
          {(board.columns ?? []).map((column) => (
            <Droppable droppableId={column._id} key={column._id}>
              {(dropProvided, dropSnapshot) => (
                <Column
                  column={column}
                  busy={
                    busyId === column._id ||
                    isColumnMovePending(column._id)
                  }
                  onAddTicket={(columnId) => {
                    setActiveTicketColumn(columnId);
                    ticketForm.reset();
                  }}
                  onDelete={onDeleteColumn}
                  droppableRef={dropProvided.innerRef}
                  droppableProps={dropProvided.droppableProps}
                  placeholder={dropProvided.placeholder}
                  isDraggingOver={dropSnapshot.isDraggingOver}
                >
                  {(column.tickets ?? []).map((ticket, index) => (
                    <Draggable
                      draggableId={ticket._id}
                      index={index}
                      key={ticket._id}
                      isDragDisabled={
                        busyId === ticket._id ||
                        movingTicketIds.has(ticket._id) ||
                        isColumnMovePending(column._id)
                      }
                    >
                      {(dragProvided, dragSnapshot) => (
                        <TicketCard
                          ticket={ticket}
                          busy={
                            busyId === ticket._id ||
                            movingTicketIds.has(ticket._id) ||
                            isColumnMovePending(column._id)
                          }
                          onDelete={(item) => onDeleteTicket(column, item)}
                          innerRef={dragProvided.innerRef}
                          draggableProps={dragProvided.draggableProps}
                          dragHandleProps={dragProvided.dragHandleProps}
                          isDragging={dragSnapshot.isDragging}
                        />
                      )}
                    </Draggable>
                  ))}
                  {activeTicketColumn === column._id && (
                    <form
                      className="ticket-form"
                      onSubmit={ticketForm.handleSubmit(onAddTicket)}
                    >
                      <FormField
                        id={`ticket-title-${column._id}`}
                        label="Título"
                        placeholder="Ej. Revisar propuesta"
                        error={ticketForm.formState.errors.title?.message}
                        {...ticketForm.register('title')}
                      />
                      <FormField
                        id={`ticket-description-${column._id}`}
                        label="Descripción"
                        as="textarea"
                        rows={2}
                        placeholder="Detalles opcionales"
                        error={ticketForm.formState.errors.description?.message}
                        {...ticketForm.register('description')}
                      />
                      <FormField
                        id={`ticket-priority-${column._id}`}
                        label="Prioridad"
                        as="select"
                        error={ticketForm.formState.errors.priority?.message}
                        {...ticketForm.register('priority')}
                      >
                        <option value="low">Baja</option>
                        <option value="normal">Media</option>
                        <option value="high">Alta</option>
                      </FormField>
                      <div className="form-actions">
                        <Button type="submit" loading={busyId === column._id}>
                          Guardar ticket
                        </Button>
                        <Button
                          variant="quiet"
                          onClick={() => setActiveTicketColumn('')}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  )}
                </Column>
              )}
            </Droppable>
          ))}
          {(board.columns ?? []).length === 0 && (
            <StatePanel
              title="Este tablero no tiene columnas"
              message="Añade una columna para comenzar."
            />
          )}
        </section>
      </DragDropContext>
    </main>
  );
}
