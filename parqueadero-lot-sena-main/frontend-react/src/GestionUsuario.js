/*===========================================================*/
// Importaciones de React y Estilos
/*===========================================================*/
import React, { Component } from 'react';
import './App.css'; 

/*===========================================================*/
// Importaciones de Componentes y API de PrimeReact
/*===========================================================*/
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PrimeReactProvider } from 'primereact/api';
import { Menubar } from 'primereact/menubar';
import 'primeicons/primeicons.css';

/*===========================================================*/
// IMPORTANTE: Asegúrse de tener estilos de PrimeReact
// Si no esta, la tabla se verá desordenada
/*===========================================================*/
import "primereact/resources/themes/lara-light-indigo/theme.css"; 
import "primereact/resources/primereact.min.css";

/*===========================================================*/
// Importo mi servicio del parqueadero que conecta al puerto 8090
/*===========================================================*/
import ParqueaderolotService from './service/ParqueaderolotService';


class App extends Component {
constructor(props) {
    super(props);
    this.state = {
        pantallaActual: 'usuarios',
        usuarios: [],
        globalFilter: '', 
        usuariosistema: { nombre: '', apellido: '', correo: '', rol: '' }
};

    this.opcionesUsuario = [
{
        label: 'NUEVO',
        icon: 'pi pi-fw pi-user-plus',
        className: 'btn-menu-nuevo', 
command: () => { }
},
{
        label: 'GUARDAR',
        icon: 'pi pi-fw pi-save',
        className: 'btn-menu-guardar', 
        command: () => { }
},
{
        label: 'ELIMINAR',
        icon: 'pi pi-fw pi-trash',
        className: 'btn-menu-eliminar', 
command: () => { 
if(window.confirm("¿Estás seguro?")) {}
}
    }];
}

componentDidMount() {
    this.cargarUsuariosDelSistema();
}

cargarUsuariosDelSistema = () => {
        ParqueaderolotService.listarUsuarios()
.then(res => {
    this.setState({ usuarios: res.data });
})
    .catch(error => {
    console.error("Error al conectar con el backend:", error);
});
}

onInputChange = (e, name) => {
let val = e.target.value || '';
if (name === 'nombre' || name === 'apellido') {
        val = val.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚ ]/g, '');
if (val.length > 0) {
        val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}
}
    this.setState(prevState => ({
        usuariosistema: { ...prevState.usuariosistema, [name]: val }
}));
}

render() {
const header = (
    <div className="flex justify-content-end">
    <span className="p-input-icon-left">
    <i className="pi pi-search" />
    <input 
        type="search" 
        onInput={(e) => this.setState({ globalFilter: e.target.value })} 
        placeholder="Buscar usuario..." 
        className="p-inputtext p-component"
    />
    </span>
    </div>
);

return (
    <PrimeReactProvider>
    <div className="App">
{this.state.pantallaActual === 'usuarios' && (
    <div className="modulo-container fade-in">
                    
{/* Título del Módulo */}
    <header className="modulo-header">
    <h2 className="neon-text-green">GESTIÓN DE USUARIOS</h2>
    </header>

{/* Menú Superior */}
    <Menubar model={this.opcionesUsuario} className="menubar-lot" />

{/* Tabla Principal */}
<div className="tabla-wrapper">
    <DataTable 
        value={this.state.usuarios} 
        dataKey="id" 
        paginator 
        rows={25}
        header={header} 
        globalFilter={this.state.globalFilter} 
        emptyMessage="No hay datos disponibles."
        tableStyle={{ minWidth: '50rem' }}
>

    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
    <Column field="id" header="ID" sortable />
    <Column field="nombre" header="Nombres" sortable />
    <Column field="apellido" header="Apellidos" sortable />
    <Column field="correo" header="Correo" sortable />
    <Column field="rol" header="Rol" sortable />
        </DataTable>
</div>
                            
{/* Footer */}
    <footer className="modulo-footer">
    <button 
        className="btn-neon btn-back" 
        onClick={() => this.setState({ pantallaActual: 'dashboard' })}
>
VOLVER AL DASHBOARD
    </button>
    </footer>
    </div>
)}
    </div>
    </PrimeReactProvider>
);
    }
}

export default App;
