

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CalculadoraIA() {
  const [form, setForm] = React.useState({
    local: '', visitante: '',
    victoriasLocal: 0, empatesLocal: 0, derrotasLocal: 0, golesFavorLocal: 0, golesContraLocal: 0,
    victoriasVisitante: 0, empatesVisitante: 0, derrotasVisitante: 0, golesFavorVisitante: 0, golesContraVisitante: 0
  });
  const [resultado, setResultado] = React.useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: Number(value) }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Lógica simple de predicción basada en los datos ingresados
    // Puedes reemplazar esto por una llamada a API o un modelo real
    const puntosLocal =
      Number(form.victoriasLocal) * 3 +
      Number(form.empatesLocal) * 1 +
      Number(form.golesFavorLocal) * 0.2 -
      Number(form.derrotasLocal) * 1 +
      Number(form.golesContraLocal) * -0.1;
    const puntosVisitante =
      Number(form.victoriasVisitante) * 3 +
      Number(form.empatesVisitante) * 1 +
      Number(form.golesFavorVisitante) * 0.2 -
      Number(form.derrotasVisitante) * 1 +
      Number(form.golesContraVisitante) * -0.1;

    let resultadoTexto = '';
    if (puntosLocal > puntosVisitante) {
      resultadoTexto = `Predicción: Gana ${form.local || 'Equipo Local'} (Probabilidad alta)`;
    } else if (puntosLocal < puntosVisitante) {
      resultadoTexto = `Predicción: Gana ${form.visitante || 'Equipo Visitante'} (Probabilidad alta)`;
    } else {
      resultadoTexto = 'Predicción: Empate (Probabilidad alta)';
    }
    setResultado(resultadoTexto);
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0e27', color: '#fff' }}>
      <Header />
      <div style={{ maxWidth: '100%', padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '1500px', width: '100%', padding: '40px' }}>
          <h1 style={{ color: '#00ffc8', fontSize: '2.3em', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', letterSpacing: '-1px' }}>Calcular Predicciones de Partidos</h1>
          <p style={{ color: '#e6f7f3', fontSize: '1.22em', marginBottom: '40px', textAlign: 'center', lineHeight: 1.5 }}>
            Ingresa las estadísticas de los equipos y deja que nuestro modelo avanzado de IA prediga el resultado del partido con análisis detallado de probabilidades.
          </p>
          <div style={{ display: 'flex', gap: '60px', justifyContent: 'center', flexWrap: 'wrap', background: 'rgba(0,255,200,0.03)', borderRadius: 16, padding: '24px 0', marginBottom: '50px' }}>
            <form onSubmit={handleSubmit} style={{ minWidth: 320, maxWidth: 520, flex: 2 }}>
              <div style={{ background: 'rgba(0,255,200,0.10)', borderRadius: '16px', padding: '32px 24px', marginBottom: 24, boxShadow: '0 4px 24px 0 rgba(0,255,200,0.07)' }}>
                <div style={{ color: '#bff0e6', fontWeight: 'bold', marginBottom: 14, fontSize: '1.1em' }}>Información de Equipos</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <input name="local" value={form.local} onChange={handleChange} placeholder="Nombre del equipo local" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10, fontSize: '1em' }} />
                  <input name="visitante" value={form.visitante} onChange={handleChange} placeholder="Nombre del equipo visitante" style={{ flex: 1, padding: 12, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10, fontSize: '1em' }} />
                </div>
              </div>
              <div style={{ background: 'rgba(0,255,200,0.10)', borderRadius: '16px', padding: '32px 24px', marginBottom: 24, boxShadow: '0 4px 24px 0 rgba(0,255,200,0.07)' }}>
                <div style={{ color: '#bff0e6', fontWeight: 'bold', marginBottom: 14, fontSize: '1.1em' }}>Forma Reciente Equipo Local (Últimos 10 Partidos)</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Victorias</label>
                    <input name="victoriasLocal" type="number" min={0} max={10} value={form.victoriasLocal} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Empates</label>
                    <input name="empatesLocal" type="number" min={0} max={10} value={form.empatesLocal} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Derrotas</label>
                    <input name="derrotasLocal" type="number" min={0} max={10} value={form.derrotasLocal} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Goles a Favor</label>
                    <input name="golesFavorLocal" type="number" min={0} max={99} value={form.golesFavorLocal} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Goles en Contra</label>
                    <input name="golesContraLocal" type="number" min={0} max={99} value={form.golesContraLocal} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,255,200,0.10)', borderRadius: '16px', padding: '32px 24px', marginBottom: 24, boxShadow: '0 4px 24px 0 rgba(0,255,200,0.07)' }}>
                <div style={{ color: '#bff0e6', fontWeight: 'bold', marginBottom: 14, fontSize: '1.1em' }}>Forma Reciente Equipo Visitante (Últimos 10 Partidos)</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Victorias</label>
                    <input name="victoriasVisitante" type="number" min={0} max={10} value={form.victoriasVisitante} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Empates</label>
                    <input name="empatesVisitante" type="number" min={0} max={10} value={form.empatesVisitante} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Derrotas</label>
                    <input name="derrotasVisitante" type="number" min={0} max={10} value={form.derrotasVisitante} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Goles a Favor</label>
                    <input name="golesFavorVisitante" type="number" min={0} max={99} value={form.golesFavorVisitante} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ color: '#b8d0e6', fontSize: 13 }}>Goles en Contra</label>
                    <input name="golesContraVisitante" type="number" min={0} max={99} value={form.golesContraVisitante} onChange={handleNumberChange} style={{ width: '100%', padding: 10, borderRadius: 8, border: 'none', background: '#222', color: '#fff', marginBottom: 10 }} />
                  </div>
                </div>
              </div>
              <button type="submit" style={{ background: '#00ffc8', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', padding: '12px 0', cursor: 'pointer', marginTop: '10px', width: '100%', fontSize: '1.1em' }}>Calcular</button>
              {resultado && <div style={{ color: '#00ffc8', marginTop: 18, textAlign: 'center', fontWeight: 700 }}>{resultado}</div>}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
