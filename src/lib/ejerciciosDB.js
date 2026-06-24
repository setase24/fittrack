// Base de datos de ejercicios comunes por parte del cuerpo
// MET = Metabolic Equivalent, usado para calcular calorías: kcal = MET * peso_kg * horas

export const EJERCICIOS_POR_PARTE = {
  'Brazos': [
    { nombre: 'Curl de bíceps con barra', met: 3.5 },
    { nombre: 'Curl de bíceps con mancuernas', met: 3.5 },
    { nombre: 'Curl martillo', met: 3.5 },
    { nombre: 'Press francés', met: 3.5 },
    { nombre: 'Extensión de tríceps en polea', met: 3.5 },
    { nombre: 'Fondos en banco', met: 4.0 },
    { nombre: 'Curl de muñeca', met: 2.5 },
    { nombre: 'Press de tríceps con cuerda', met: 3.5 },
  ],
  'Tren superior': [
    { nombre: 'Press de banca', met: 5.0 },
    { nombre: 'Press militar', met: 4.5 },
    { nombre: 'Remo con barra', met: 4.5 },
    { nombre: 'Dominadas', met: 6.0 },
    { nombre: 'Press inclinado', met: 5.0 },
    { nombre: 'Aperturas con mancuernas', met: 4.0 },
    { nombre: 'Jalón al pecho', met: 4.0 },
    { nombre: 'Remo en máquina', met: 4.0 },
    { nombre: 'Elevaciones laterales', met: 3.5 },
    { nombre: 'Face pull', met: 3.5 },
    { nombre: 'Flexiones de pecho', met: 4.0 },
  ],
  'Piernas': [
    { nombre: 'Sentadilla con barra', met: 5.5 },
    { nombre: 'Prensa de piernas', met: 5.0 },
    { nombre: 'Peso muerto', met: 6.0 },
    { nombre: 'Zancadas', met: 5.0 },
    { nombre: 'Extensión de cuádriceps', met: 3.5 },
    { nombre: 'Curl femoral', met: 3.5 },
    { nombre: 'Elevación de talones', met: 3.0 },
    { nombre: 'Sentadilla búlgara', met: 5.5 },
    { nombre: 'Hip thrust', met: 4.5 },
    { nombre: 'Abductores en máquina', met: 3.0 },
  ],
  'Core / abdomen': [
    { nombre: 'Crunch abdominal', met: 3.0 },
    { nombre: 'Crunch en banco inclinado', met: 3.5 },
    { nombre: 'Crunch con peso', met: 4.0 },
    { nombre: 'Abdominales normales (suelo)', met: 3.0 },
    { nombre: 'Sit-up completo', met: 3.5 },
    { nombre: 'Twist ruso', met: 4.5 },
    { nombre: 'Twist ruso con peso', met: 5.0 },
    { nombre: 'Plancha', met: 3.5 },
    { nombre: 'Plancha lateral', met: 3.5 },
    { nombre: 'Elevación de piernas', met: 3.5 },
    { nombre: 'Elevación de piernas colgado', met: 5.0 },
    { nombre: 'Rueda rusa (ab wheel)', met: 4.0 },
    { nombre: 'Abdominales en polea', met: 3.5 },
    { nombre: 'Bicicleta abdominal', met: 4.0 },
    { nombre: 'Mountain climbers', met: 6.0 },
    { nombre: 'V-ups', met: 4.5 },
    { nombre: 'Hollow hold', met: 3.5 },
    { nombre: 'Dead bug', met: 2.5 },
  ],
  'Full body': [
    { nombre: 'Burpees', met: 8.0 },
    { nombre: 'Clean and press', met: 7.0 },
    { nombre: 'Kettlebell swing', met: 6.0 },
    { nombre: 'Thrusters', met: 7.5 },
    { nombre: 'Circuito funcional', met: 6.5 },
  ],
}

export function calcularCaloriasEjercicio(metPromedio, pesoKg, minutos) {
  const horas = minutos / 60
  return Math.round(metPromedio * pesoKg * horas)
}

export function buscarEjercicio(query, parte) {
  const lista = EJERCICIOS_POR_PARTE[parte] || []
  if (!query) return lista
  const q = query.toLowerCase()
  return lista.filter(e => e.nombre.toLowerCase().includes(q))
}
