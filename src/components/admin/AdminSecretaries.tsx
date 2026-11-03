import { useSecretaries } from '../../hooks/useSecretaries';
import { DEPARTMENTS } from '../../constants/departments';

export default function AdminSecretaries({ active = true }: { active?: boolean } = {}) {
  const controller = useSecretaries(active);
  return (
    <section className="secretary-section" aria-label="Gestionare secretari">
      <h2>Gestionare secretari</h2>
      <p className="section-description">Secretarii pot revizui cererile departamentelor atribuite, dar nu propriile cereri. Nu pot edita task-uri sau administra roluri.</p>
      <form className="secretary-form" onSubmit={controller.add}>
        <h3>Adaugă secretar</h3>
        <div className="form-group">
          <label htmlFor="secretary-email">Email secretar (@bestis.ro)</label>
          <input id="secretary-email" type="email" className="transfer-input" required disabled={controller.busy}
            value={controller.email} onChange={event => controller.setEmail(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="secretary-department">Departament</label>
          <select id="secretary-department" className="transfer-select" required disabled={controller.busy}
            value={controller.department} onChange={event => controller.setDepartment(DEPARTMENTS.find(value => value === event.target.value) ?? '')}>
            <option value="">Selectează...</option>
            {controller.availableDepartments.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        {controller.error && <p className="transfer-error" role="alert">{controller.error}</p>}
        {controller.message && <p className="transfer-success" role="status">{controller.message}</p>}
        <button type="submit" className="secretary-button" disabled={controller.busy}>{controller.busy ? 'Se salvează...' : 'Adaugă secretar'}</button>
      </form>
      {controller.loading ? <p role="status">Se încarcă secretarii...</p> : controller.loadError ? (
        <div role="alert"><p>{controller.loadError}</p><button type="button" onClick={controller.retry}>Reîncearcă încărcarea secretarilor</button></div>
      ) : (
        <div className="existing-secretaries">
          <h3>Secretari existenți</h3>
          {!controller.secretaries.length ? <p>Nu există secretari în departamentele administrate.</p> : (
            <div className="secretaries-list">{controller.secretaries.map(secretary => (
              <div key={secretary.email} className="secretary-item">
                <div className="secretary-info"><p className="secretary-email">{secretary.email}</p>
                  <p className="secretary-departments">Departamente: {secretary.departments.join(', ')}</p></div>
                <button type="button" className="remove-secretary-btn" disabled={controller.busy}
                  onClick={() => controller.remove(secretary)} aria-label={`Retrage accesul pentru ${secretary.email}`}>Retrage accesul</button>
              </div>
            ))}</div>
          )}
        </div>
      )}
    </section>
  );
}
