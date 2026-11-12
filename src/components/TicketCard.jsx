import Button from './Button';

const priorityLabels = {
  low: 'Baja',
  normal: 'Media',
  high: 'Alta',
};

export default function TicketCard({
  ticket,
  onDelete,
  busy = false,
  dragHandleProps,
  draggableProps,
  innerRef,
  isDragging = false,
}) {
  return (
    <article
      className={`ticket-card${isDragging ? ' ticket-card--dragging' : ''}`}
      ref={innerRef}
      {...draggableProps}
    >
      <div className="ticket-card__content" {...dragHandleProps}>
        <h3>{ticket.title}</h3>
        {ticket.description && <p>{ticket.description}</p>}
        <span
          className={`priority priority--${priorityLabels[ticket.priority] ? ticket.priority : 'normal'}`}
          aria-label={`Prioridad ${priorityLabels[ticket.priority] ?? priorityLabels.normal}`}
        >
          {priorityLabels[ticket.priority] ?? priorityLabels.normal}
        </span>
      </div>
      <div className="ticket-card__actions">
        <Button
          variant="quiet"
          className="button--danger"
          aria-label={`Eliminar ticket ${ticket.title}`}
          loading={busy}
          onClick={() => onDelete(ticket)}
        >
          Eliminar
        </Button>
      </div>
    </article>
  );
}
