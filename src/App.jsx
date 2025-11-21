import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import Register from './Register' // <--- Importamos Registro
import { Container, Typography, Paper, TextField, Button, Stack, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

const LISTA_TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unico']

// ⚠️ IMPORTANTE: Reemplaza esto con TU email real con el que te registraste primero
const ADMIN_EMAIL = 'tu_email_real@ejemplo.com'; 

function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('login'); // 'login' o 'register'

  // Datos de la app
  const [rows, setRows] = useState([])
  const [selectionModel, setSelectionModel] = useState([]) 
  const [nuevaPrenda, setNuevaPrenda] = useState("")
  const [nuevoTalle, setNuevoTalle] = useState("")
  const [nuevaCantidad, setNuevaCantidad] = useState("")

  // --- DEFINICIÓN DE COLUMNAS DINÁMICA ---
  // Solo permitimos editar si el usuario actual es el Admin
  const esAdmin = session?.user?.email === ADMIN_EMAIL;

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'prenda', headerName: 'Prenda', width: 200 },
    { field: 'talle', headerName: 'Talle', width: 100 },
    { 
      field: 'cantidad', 
      headerName: 'Stock', 
      width: 130, 
      type: 'number',
      editable: esAdmin // <--- TRUE solo si es admin, FALSE si es viewer
    },
  ]

  // --- LOGIN / SESSION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  // --- CARGAR DATOS ---
  useEffect(() => {
    if (session) obtenerStock()
  }, [session])

  async function obtenerStock() {
    const { data, error } = await supabase.from('stock_ropa').select('*').order('id', { ascending: false })
    if (error) console.log(error)
    else setRows(data || [])
  }

  const processRowUpdate = async (newRow, oldRow) => {
    // Doble seguridad: Si no es admin, no hace nada
    if (!esAdmin) return oldRow; 

    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow
    const { error } = await supabase.from('stock_ropa').update({ 
        prenda: newRow.prenda, talle: newRow.talle, cantidad: newRow.cantidad
      }).eq('id', newRow.id)

    if (error) { alert("Error: " + error.message); return oldRow }
    return newRow
  }

  async function agregarRegistro() {
    if (!nuevaPrenda || !nuevoTalle || !nuevaCantidad) return alert("Faltan datos")
    const { error } = await supabase.from('stock_ropa').insert([{ prenda: nuevaPrenda, talle: nuevoTalle, cantidad: parseInt(nuevaCantidad) }])
    if (error) alert("Error: " + error.message)
    else { obtenerStock(); setNuevaPrenda(""); setNuevoTalle(""); setNuevaCantidad("") }
  }

  async function eliminarRegistros() {
    if (selectionModel.length === 0 || !confirm("¿Borrar seleccionados?")) return
    const { error } = await supabase.from('stock_ropa').delete().in('id', selectionModel)
    if (error) alert("Error al borrar"); else { obtenerStock(); setSelectionModel([]) }
  }

  // --- VISTAS DE NO-AUTENTICADO ---
  if (!session) {
    return view === 'login' 
      ? <Login onSwitchToRegister={() => setView('register')} />
      : <Register onSwitchToLogin={() => setView('login')} />;
  }

  // --- VISTA PRINCIPAL (AUTENTICADO) ---
  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" style={{ color: '#1976d2', fontWeight: 'bold' }}>
          👕 Registro de Stock
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Etiqueta para saber qué rol tengo */}
          <Chip label={esAdmin ? "Modo: ADMIN" : "Modo: LECTOR"} color={esAdmin ? "primary" : "default"} />
          <Button variant="outlined" color="secondary" onClick={() => supabase.auth.signOut()}>
            Salir
          </Button>
        </Stack>
      </Stack>

      {/* 🔒 ÁREA RESTRINGIDA: Solo se muestra el formulario si es ADMIN */}
      {esAdmin && (
        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField label="Prenda" size="small" value={nuevaPrenda} onChange={(e) => setNuevaPrenda(e.target.value)} style={{ flex: 2 }} />
            <FormControl size="small" style={{ flex: 1, minWidth: 120 }}>
              <InputLabel>Talle</InputLabel>
              <Select value={nuevoTalle} label="Talle" onChange={(e) => setNuevoTalle(e.target.value)}>
                {LISTA_TALLES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Cant" size="small" type="number" value={nuevaCantidad} onChange={(e) => setNuevaCantidad(e.target.value)} style={{ flex: 1 }} />
            <Button variant="contained" onClick={agregarRegistro} style={{ height: '40px' }}>AGREGAR</Button>
          </Stack>
        </Paper>
      )}

      {/* Botón Eliminar solo si es Admin */}
      {esAdmin && selectionModel.length > 0 && (
        <Button variant="contained" color="error" style={{ marginBottom: '10px' }} onClick={eliminarRegistros}>
          Eliminar ({selectionModel.length})
        </Button>
      )}

      <Paper elevation={2} style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection={esAdmin} // Solo el admin puede seleccionar para borrar
          disableRowSelectionOnClick
          onRowSelectionModelChange={(ids) => setSelectionModel(ids)}
          rowSelectionModel={selectionModel}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={(error) => alert(error)}
        />
      </Paper>
    </Container>
  )
}

export default App