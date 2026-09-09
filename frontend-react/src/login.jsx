/*======================================================*/
/* BLOQUE J1: IMPORTS DE LIBRERÍAS Y ESTILOS            */
/*======================================================*/
import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { apiUrl } from './apiConfig';

const Login = () => {
    /*======================================================*/
    /* BLOQUE J2: ESTADOS (STATES) Y REFERENCIAS            */
    /*======================================================*/
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
    const toast = useRef(null); 
    const navigate = useNavigate();

    /*======================================================*/
    /* BLOQUE J3: LÓGICA DE ENVÍO Y NAVEGACIÓN              */
    /*======================================================*/
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(apiUrl("/usuarios/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                toast.current.show({ 
                    severity: 'success', summary: 'Éxito', 
                    detail: 'Acceso concedido', life: 2000 
                });
                
                // Salto automático al menú tras el éxito
                setTimeout(() => {
                    navigate('/menu');
                }, 1500);

            } else {
                toast.current.show({ 
                    severity: 'error', summary: 'Error', 
                    detail: 'Credenciales inválidas', life: 3000 
                });
            }
        } catch (error) {
            toast.current.show({ 
                severity: 'warn', summary: 'Error', 
                detail: 'Sin conexión con el servidor', life: 3000 
            });
        } finally {
            setLoading(false);
        }
    };

    /*======================================================*/
    /* BLOQUE J4: ESTRUCTURA PRINCIPAL Y ENCABEZADO         */
    /*======================================================*/
    return (
        <div className="login-container">
            <Toast ref={toast} />

            <div className="login-box">
                <h1 className="main-title">
                    PARQUEADERO <span className="highlight">LOT</span>
                </h1>
                
                <form onSubmit={handleLogin} autoComplete="off">
                    
                    {/* BLOQUE J5: CAMPO DE USUARIO */}
                    <div className="field">
                        <label>Usuario</label>
                        <div className="custom-input-wrapper">
                            <i className="pi pi-user icon-left" />
                            <InputText 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                className="w-full custom-padding" 
                                placeholder="Usuario"
                            />
                        </div>
                    </div>

                    {/* BLOQUE J6: CAMPO DE CONTRASEÑA (CON OJO) */}
                    <div className="field">
                        <label>Contraseña</label>
                        <div className="custom-input-wrapper">
                            <i className="pi pi-lock icon-left" />
                            <InputText 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full custom-padding" 
                                placeholder="••••••••"
                            />
                            <i 
                                className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'} icon-right-eye`} 
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    {/* BLOQUE J7: BOTÓN DE ACCIÓN */}
                    <Button 
                        label="INGRESAR" 
                        className="btn-ingresar" 
                        type="submit" 
                        loading={loading} 
                    />

                </form>
            </div>
        </div>
    );
};

export default Login;
