import { useTaskEditor } from '../../hooks/useTaskEditor';
import { REQUEST_DEPARTMENTS } from '../../constants/departments';

function TaskForm({ editor }: { editor: ReturnType<typeof useTaskEditor> }) {
  return (
    <div className="task-form">
      <h3>{editor.editing ? 'Editează task' : 'Adaugă task'}</h3>
      {editor.error && <p role="alert">{editor.error}</p>}
      <form onSubmit={editor.save}>
        <div className="form-group">
          <label htmlFor="task-description">Descriere</label>
          <input id="task-description" className="task-input" value={editor.description} disabled={editor.busy} required autoFocus
            onChange={event => editor.setDescription(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="task-points">Puncte</label>
          <input id="task-points" className="task-input" type="number" min="1" step="1" required disabled={editor.busy}
            value={editor.points} onChange={event => editor.setPoints(event.target.value)} />
        </div>
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={editor.busy}>{editor.busy ? 'Se salvează...' : 'Salvează'}</button>
          <button type="button" className="cancel-btn" disabled={editor.busy} onClick={editor.closeForm}>Anulează</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminTasks({ active = true }: { active?: boolean } = {}) {
  const editor = useTaskEditor(active);
  const { tasks, department, busy } = editor;
  return (
    <section className="tab-content" aria-label="Gestionare task-uri">
      <div className="tasks-header filter-group">
        <label htmlFor="task-department">Departament</label>
        <select id="task-department" className="admin-select" value={department} disabled={busy}
          onChange={event => editor.setSelected(REQUEST_DEPARTMENTS.find(value => value === event.target.value) ?? '')}>
          {editor.availableDepartments.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      {!editor.showForm && editor.error && <p role="alert">{editor.error}</p>}
      {editor.message && <p role="status">{editor.message}</p>}
      {editor.showForm && !editor.editing && <TaskForm editor={editor} />}
      {!editor.showForm && <button type="button" className="add-task-btn" disabled={busy} onClick={() => editor.setShowForm(true)}>Adaugă Task Nou</button>}
      <div className="tasks-list">
        <h3>Task-uri {department} ({tasks.tasks.length})</h3>
        {tasks.loading ? <p role="status">Se încarcă task-urile...</p> : tasks.error ? (
          <div role="alert"><p>{tasks.error}</p><button type="button" onClick={tasks.fetchTasks}>Reîncearcă încărcarea task-urilor</button></div>
        ) : tasks.tasks.length === 0 ? <p className="no-tasks">Nu există task-uri.</p> : (
          <div className="tasks-grid">{tasks.tasks.map(task => (
            <article key={task.id} className="task-card">
              {editor.showForm && editor.editing?.id === task.id ? <TaskForm editor={editor} /> : <>
              <div className="task-info"><p className="task-description">{task.description}</p><p className="task-points">{task.points} puncte</p></div>
              <div className="task-actions">
                <button type="button" className="edit-btn" disabled={busy} onClick={() => editor.edit(task)} aria-label={`Editează ${task.description}`} title="Editează">✏️</button>
                <button type="button" className="delete-btn" disabled={busy} onClick={() => editor.remove(task)} aria-label={`Șterge ${task.description}`} title="Șterge">🗑️</button>
              </div>
              </>}
            </article>
          ))}</div>
        )}
      </div>
    </section>
  );
}
