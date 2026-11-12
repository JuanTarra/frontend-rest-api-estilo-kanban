import Button from './Button';

export default function Column({
  column,
  children,
  onAddTicket,
  onDelete,
  busy = false,
  droppableRef,
  droppableProps,
  placeholder,
  isDraggingOver = false,
}) {
  return (
    <section
      className={`board-column${isDraggingOver ? ' board-column--dragging-over' : ''}`}
      aria-labelledby={`column-${column._id}`}
      ref={droppableRef}
      {...droppableProps}
    >
      <header className="board-column__header">
        <div>
          <h2 id={`column-${column._id}`}>{column.title}</h2>
          <span className="column-count">{column.tickets?.length ?? 0} tickets</span>
        </div>
        <Button
          variant="quiet"
          aria-label={`Eliminar columna ${column.title}`}
          loading={busy}
          onClick={() => onDelete(column)}
        >
          Eliminar
        </Button>
      </header>
      <div className="board-column__tickets">
        {children}
        {placeholder}
      </div>
      <Button
        variant="secondary"
        disabled={busy}
        onClick={() => onAddTicket(column._id)}
      >
        + Añadir ticket
      </Button>
    </section>
  );
}
