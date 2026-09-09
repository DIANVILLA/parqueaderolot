import React from 'react';
import './AsiganarEspacioManual.css';

/* Modificado: Ahora la función del componente se llama AsiganarEspacioManual */
const AsiganarEspacioManual = ({ espacio, onConfirm, onClose }) => {
    if (!espacio) return null;

    return (
        <div className="modal-overlay-asignacion" onClick={onClose}>
            <div className="modal-content-asignacion" onClick={(e) => e.stopPropagation()}>
                {/* ENCABEZADO */}
                <div className="modal-header-asignacion">
                    <h2>ASIGNAR ESPACIO</h2>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
                        <i className="pi pi-times" />
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="modal-body-asignacion">
                    <div className="espacio-info">
                        <p className="info-label">ESPACIO SELECCIONADO:</p>
                        <p className="info-valor">{espacio.id}</p>
                        
                        <p className="info-label" style={{ marginTop: '15px' }}>TIPO DE VEHÍCULO:</p>
                        <p className="info-valor">{espacio.tipo}</p>
                    </div>

                    <div className="modal-question">
                        <p className="pregunta">¿Deseas registrar entrada con confirmación de datos o asignar automáticamente?</p>
                    </div>
                </div>

                {/* BOTONES */}
                <div className="modal-footer-asignacion">
                    <button 
                        className="btn-asignacion btn-manual"
                        onClick={() => onConfirm('manual', espacio.id)}
                    >
                        <i className="pi pi-clipboard icon-inline" /> REGISTRAR ENTRADA
                    </button>
                    <button 
                        className="btn-asignacion btn-automatica"
                        onClick={() => onConfirm('automatica')}
                    >
                        <i className="pi pi-bolt icon-inline" /> ASIGNAR AUTOMATICO
                    </button>
                </div>
            </div>
        </div>
    );
};

/* Modificado: Exportación actualizada con el nuevo nombre */
export default AsiganarEspacioManual;
