import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Container, Typography, Paper, TextField, Button, Stack, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

// 1. Columnas afuera (Siempre)
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

// Función que recibe la fila NUEVA (con el cambio) y la VIEJA
const processRowUpdate = async (newRow, oldRow) => {
    // 1. Si no hubo cambios, no hacemos nada
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) return oldRow

    // 2. Guardamos en Supabase
    const { error } = await supabase
      .from('stock_ropa')
      .update({ 
        prenda: newRow.prenda,
        talle: newRow.talle,
        cantidad: newRow.cantidad
      })
      .eq('id', newRow.id) // Buscamos por ID

    if (error) {
      alert("Error al actualizar: " + error.message)
      return oldRow // Si falla, revertimos el cambio visualmente
    }
    
    console.log("Guardado:", newRow)
    return newRow // Si sale bien, confirmamos el cambio en la tabla
  }

function App() {
  const [rows, setRows] = useState([])
  const [selectionModel, setSelectionModel] = useState([]) 

  // Formulario
  const [nuevaPrenda, setNuevaPrenda] = useState("")
  const [nuevoTalle, setNuevoTalle] = useState("")
  const [nuevaCantidad, setNuevaCantidad] = useState("")

  useEffect(() => {
    obtenerStock()
  }, [])

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

  return (
    <Container maxWidth="md" style={{ marginTop: '40px' }}>
      
      <Typography variant="h4" gutterBottom style={{ color: '#1976d2', fontWeight: 'bold' }}>
        👕 Mi Farma Stock
      </Typography>

      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <Stack direction="row" spacing={2} alingItems="center">
          <TextField 
            label="Prenda" 
            variant="outlined" 
            size="small"
            value={nuevaPrenda}
            onChange={(e) => setNuevaPrenda(e.target.value)} 
            style={{ flex: 2 }} // Ocupa más espacio (el doble que los otros)
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
            style={{ flex: 1 }} // Ocupa 1 unidad de espacio
          />
          <Button 
            variant="contained" 
            onClick={agregarRegistro}
            style={{ height: '40px' }} // Forzamos la altura para que coincida con los inputs
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
          onprocessRowUpdateError={(error) => alert(error)}
        />
      </Paper>

    </Container>
  )
}

export default App