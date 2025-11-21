import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login' // <--- 1. Importamos el componente Login
import { Container, Typography, Paper, TextField, Button, Stack, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import LogoutIcon from '@mui/icons-material/Logout'; // (Opcional: icono si quieres instalar iconos, si no, se verá solo texto)

// --- DEFINICIÓN DE COLUMNAS (Igual que antes) ---
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'prenda', headerName: 'Prenda', width: 200 },
  { field: 'talle', headerName: 'Talle', width: 100 },
  { field: 'cantidad', 
    headerName: 'Stock', 
    width: 130, 
    type: 'number',
    editable: true 
  },
]
const LISTA_TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unico']

const processRowUpdate = async (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow
    const { error } = await supabase
      .from('stock_ropa')
      .update({ 
        prenda: newRow.prenda,
        talle: newRow.talle,
        cantidad: newRow.cantidad
      })
      .eq('id', newRow.id)

    if (error) {
      alert("Error al actualizar: " + error.message)
      return oldRow
    }
    return newRow
}

function App() {
  // --- 1. ESTADOS DE AUTENTICACIÓN ---
  const [session, setSession] = useState(null)

  // --- 2. ESTADOS DE LA APP DE STOCK ---
  const [rows, setRows] = useState([])
  const [selectionModel, setSelectionModel] = useState([]) 
  const [nuevaPrenda, setNuevaPrenda] = useState("")
  const [nuevoTalle, setNuevoTalle] = useState("")
  const [nuevaCantidad, setNuevaCantidad] = useState("")

  // --- 3. EFECTO PARA CONTROLAR LA SESIÓN (LOGIN) ---
  useEffect(() => {
    // Verificar sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Escuchar cambios (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --- 4. EFECTO PARA CARGAR DATOS (Solo si hay sesión) ---
  useEffect(() => {
    if (session) {
      obtenerStock()
    }
  }, [session]) // Se ejecuta cuando cambia la sesión

  // --- FUNCIONES CRUD ---
  async function obtenerStock() {
    const { data, error } = await supabase
      .from('stock_ropa')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) console.log(error)
    else setRows(data || [])
  }

  async function agregarRegistro() {
    if (!nuevaPrenda || !nuevoTalle || !nuevaCantidad) return alert("Faltan datos")
    
    const { error } = await supabase
      .from('stock_ropa')
      .insert([{ prenda: nuevaPrenda, talle: nuevoTalle, cantidad: parseInt(nuevaCantidad) }])

    if (error) alert("Error: " + error.message)
    else {
      obtenerStock()
      setNuevaPrenda(""); setNuevoTalle(""); setNuevaCantidad("")
    }
  }

  async function eliminarRegistros() {
    if (selectionModel.length === 0) return
    if (!confirm("¿Borrar seleccionados?")) return

    const { error } = await supabase
      .from('stock_ropa')
      .delete()
      .in('id', selectionModel)

    if (error) alert("Error al borrar")
    else {
      obtenerStock()
      setSelectionModel([])
    }
  }

  // --- 5. RENDERIZADO CONDICIONAL ---
  
  // Si NO hay sesión, mostramos el componente LOGIN
  if (!session) {
    return <Login />
  }

  // Si SÍ hay sesión, mostramos la APP DE STOCK
  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      
      {/* CABECERA CON TÍTULO Y BOTÓN DE SALIR */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" style={{ color: '#1976d2', fontWeight: 'bold' }}>
          👕 Mi Farma Stock
        </Typography>
        
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => supabase.auth.signOut()}
        >
          Cerrar Sesión
        </Button>
      </Stack>

      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField 
            label="Prenda" 
            variant="outlined" 
            size="small"
            value={nuevaPrenda}
            onChange={(e) => setNuevaPrenda(e.target.value)} 
            style={{ flex: 2 }} 
          />
          <FormControl size="small" style={{ flex: 1, minWidth: 120 }}>
            <InputLabel>Talle</InputLabel>
            <Select
              value={nuevoTalle}
              label="Talle"
              onChange={(e) => setNuevoTalle(e.target.value)}
            >
              {LISTA_TALLES.map((talle) => (
                <MenuItem key={talle} value={talle}>{talle}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Cant" 
            variant="outlined" 
            size="small"
            type="number"
            value={nuevaCantidad}
            onChange={(e) => setNuevaCantidad(e.target.value)}
            style={{ flex: 1 }} 
          />
          <Button 
            variant="contained" 
            onClick={agregarRegistro}
            style={{ height: '40px' }} 
          >
            AGREGAR
          </Button>
        </Stack>
      </Paper>    

      {selectionModel.length > 0 && (
        <Button variant="contained" color="error" style={{ marginBottom: '10px' }} onClick={eliminarRegistros}>
          Eliminar ({selectionModel.length})
        </Button>
      )}

      <Paper elevation={2} style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
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