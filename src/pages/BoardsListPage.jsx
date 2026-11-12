import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import boardService from '../api/boardService';
import Button from '../components/Button';
import FormField from '../components/FormField';
import StatePanel from '../components/StatePanel';

const boardSchema = z.object({
  title: z.string().trim().min(1, 'El nombre del tablero es obligatorio.'),
});

export default function BoardsListPage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingBoardId, setDeletingBoardId] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(boardSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
    },
  });

  const loadBoards = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setBoards(await boardService.getAllBoards());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const onSubmit = async ({ title }) => {
    setSubmitting(true);
    try {
      const board = await boardService.createBoard({ title });
      reset();
      navigate(`/boards/${board._id}`);
    } catch (error) {
      setError('title', {
        type: 'server',
        message: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteBoard = async (board) => {
    if (!window.confirm(`¿Eliminar el tablero "${board.name ?? board.title}" y todo su contenido?`)) {
      return;
    }

    setDeletingBoardId(board._id);
    setDeleteError('');
    try {
      await boardService.deleteBoard(board._id);
      setBoards((current) => current.filter((item) => item._id !== board._id));
    } catch (error) {
      setDeleteError(
        `No se pudo eliminar el tablero "${board.name ?? board.title}". ${error.message}`
      );
    } finally {
      setDeletingBoardId('');
    }
  };

  return (
    <main className="page-shell">
      <header className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>Tus tableros</h1>
          <p>Organiza el trabajo y mantén cada proyecto en movimiento.</p>
        </div>
      </header>

      <form className="create-board-form panel" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          id="board-title"
          label="Crear un tablero"
          placeholder="Ej. Lanzamiento de producto"
          error={errors.title?.message}
          {...register('title')}
        />
        <Button type="submit" loading={submitting}>
          Crear tablero
        </Button>
      </form>

      {loading ? (
        <StatePanel title="Cargando tableros..." message="Un momento, por favor." />
      ) : loadError ? (
        <StatePanel
          title="No se pudieron cargar los tableros"
          message={loadError}
          action={
            <Button variant="secondary" onClick={loadBoards}>
              Reintentar
            </Button>
          }
        />
      ) : boards.length === 0 ? (
        <StatePanel
          title="Todavía no hay tableros"
          message="Crea el primero para empezar a organizar tu trabajo."
        />
      ) : (
        <>
          {deleteError && (
            <div className="notice notice--error" role="alert">
              {deleteError}
            </div>
          )}
          <section className="board-grid" aria-label="Lista de tableros">
            {boards.map((board) => (
              <article className="board-tile panel" key={board._id}>
                <button
                  className="board-tile__open"
                  onClick={() => navigate(`/boards/${board._id}`)}
                  type="button"
                >
                  <span className="board-tile__icon" aria-hidden="true">
                    ▦
                  </span>
                  <span className="board-tile__title">
                    {board.name ?? board.title}
                  </span>
                  <span className="board-tile__arrow" aria-hidden="true">
                    →
                  </span>
                </button>
                <Button
                  variant="quiet"
                  className="button--danger board-tile__delete"
                  aria-label={`Eliminar tablero ${board.name ?? board.title}`}
                  loading={deletingBoardId === board._id}
                  disabled={Boolean(deletingBoardId && deletingBoardId !== board._id)}
                  onClick={() => onDeleteBoard(board)}
                >
                  Eliminar
                </Button>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
