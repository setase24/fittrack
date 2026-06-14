// Base de datos local de alimentos comunes colombianos e internacionales
// No consume Claude API — cálculo instantáneo y gratuito

export const ALIMENTOS = [
  // Snacks y dulces
  { nombre: 'Chicle Trident', cal: 5, prot: 0, carb: 2, gras: 0, porcion: '1 unidad' },
  { nombre: 'Chicle Orbit', cal: 5, prot: 0, carb: 2, gras: 0, porcion: '1 unidad' },
  { nombre: 'Chocolatina Jet', cal: 110, prot: 1, carb: 15, gras: 5, porcion: '1 unidad (20g)' },
  { nombre: 'Nucita', cal: 80, prot: 1, carb: 10, gras: 4, porcion: '1 unidad' },
  { nombre: 'Bon Bon Bum', cal: 60, prot: 0, carb: 15, gras: 0, porcion: '1 unidad' },
  { nombre: 'Maní japonés', cal: 150, prot: 5, carb: 18, gras: 7, porcion: 'puño (30g)' },
  { nombre: 'Papas fritas', cal: 150, prot: 2, carb: 15, gras: 9, porcion: 'bolsa pequeña (28g)' },
  { nombre: 'Doritos', cal: 140, prot: 2, carb: 18, gras: 7, porcion: 'bolsa pequeña (28g)' },
  { nombre: 'Galleta Oreo', cal: 53, prot: 0.5, carb: 8, gras: 2, porcion: '1 galleta' },
  { nombre: 'Galleta Ducales', cal: 30, prot: 0.5, carb: 4, gras: 1.5, porcion: '1 galleta' },
  { nombre: 'Chocolatina Mr. Brown', cal: 95, prot: 1, carb: 12, gras: 5, porcion: '1 unidad' },

  // Bebidas
  { nombre: 'Café negro', cal: 2, prot: 0, carb: 0, gras: 0, porcion: '1 taza (240ml)' },
  { nombre: 'Café con leche', cal: 60, prot: 3, carb: 6, gras: 2, porcion: '1 taza' },
  { nombre: 'Café con leche y azúcar', cal: 80, prot: 3, carb: 10, gras: 2, porcion: '1 taza' },
  { nombre: 'Tinto', cal: 2, prot: 0, carb: 0, gras: 0, porcion: '1 pocillo' },
  { nombre: 'Tinto con azúcar', cal: 20, prot: 0, carb: 5, gras: 0, porcion: '1 pocillo' },
  { nombre: 'Agua', cal: 0, prot: 0, carb: 0, gras: 0, porcion: '1 vaso (250ml)' },
  { nombre: 'Gatorade', cal: 50, prot: 0, carb: 14, gras: 0, porcion: '240ml' },
  { nombre: 'Coca Cola', cal: 105, prot: 0, carb: 26, gras: 0, porcion: '355ml' },
  { nombre: 'Coca Cola Zero', cal: 0, prot: 0, carb: 0, gras: 0, porcion: '355ml' },
  { nombre: 'Jugo de naranja natural', cal: 110, prot: 2, carb: 26, gras: 0, porcion: '1 vaso (240ml)' },
  { nombre: 'Leche entera', cal: 150, prot: 8, carb: 12, gras: 8, porcion: '1 vaso (240ml)' },
  { nombre: 'Leche descremada', cal: 90, prot: 8, carb: 12, gras: 0.5, porcion: '1 vaso (240ml)' },
  { nombre: 'Avena en agua', cal: 150, prot: 5, carb: 27, gras: 2, porcion: '1 vaso' },
  { nombre: 'Agua panela', cal: 120, prot: 0, carb: 30, gras: 0, porcion: '1 vaso' },

  // Frutas
  { nombre: 'Banano', cal: 90, prot: 1, carb: 23, gras: 0, porcion: '1 unidad mediana' },
  { nombre: 'Manzana', cal: 80, prot: 0.5, carb: 21, gras: 0, porcion: '1 unidad mediana' },
  { nombre: 'Naranja', cal: 60, prot: 1, carb: 15, gras: 0, porcion: '1 unidad mediana' },
  { nombre: 'Mango', cal: 100, prot: 1, carb: 25, gras: 0, porcion: '1 unidad mediana' },
  { nombre: 'Papaya', cal: 55, prot: 1, carb: 14, gras: 0, porcion: '1 taza' },
  { nombre: 'Fresas', cal: 50, prot: 1, carb: 12, gras: 0, porcion: '1 taza' },
  { nombre: 'Uvas', cal: 100, prot: 1, carb: 27, gras: 0, porcion: '1 taza' },
  { nombre: 'Pera', cal: 100, prot: 1, carb: 27, gras: 0, porcion: '1 unidad mediana' },
  { nombre: 'Aguacate', cal: 160, prot: 2, carb: 9, gras: 15, porcion: 'medio aguacate' },

  // Comida colombiana
  { nombre: 'Arepa blanca', cal: 140, prot: 3, carb: 28, gras: 2, porcion: '1 arepa mediana' },
  { nombre: 'Arepa con mantequilla', cal: 190, prot: 3, carb: 28, gras: 7, porcion: '1 arepa' },
  { nombre: 'Arepa con queso', cal: 220, prot: 8, carb: 28, gras: 9, porcion: '1 arepa' },
  { nombre: 'Pandebono', cal: 150, prot: 4, carb: 20, gras: 6, porcion: '1 unidad' },
  { nombre: 'Pan de bono grande', cal: 200, prot: 5, carb: 27, gras: 8, porcion: '1 unidad grande' },
  { nombre: 'Almojábana', cal: 180, prot: 5, carb: 22, gras: 8, porcion: '1 unidad' },
  { nombre: 'Empanada de pipián', cal: 250, prot: 4, carb: 35, gras: 11, porcion: '1 unidad' },
  { nombre: 'Empanada de carne', cal: 280, prot: 8, carb: 33, gras: 13, porcion: '1 unidad' },
  { nombre: 'Arroz blanco', cal: 200, prot: 4, carb: 44, gras: 0.5, porcion: '1 taza cocida' },
  { nombre: 'Frijoles', cal: 230, prot: 15, carb: 40, gras: 1, porcion: '1 taza' },
  { nombre: 'Lentejas', cal: 230, prot: 18, carb: 40, gras: 1, porcion: '1 taza' },
  { nombre: 'Bandeja paisa completa', cal: 1200, prot: 55, carb: 120, gras: 50, porcion: '1 plato completo' },
  { nombre: 'Sancocho de pollo', cal: 350, prot: 30, carb: 35, gras: 8, porcion: '1 plato' },
  { nombre: 'Ajiaco', cal: 380, prot: 28, carb: 42, gras: 10, porcion: '1 plato' },
  { nombre: 'Sopa de lentejas', cal: 280, prot: 16, carb: 38, gras: 5, porcion: '1 plato' },
  { nombre: 'Tamale bogotano', cal: 450, prot: 20, carb: 55, gras: 18, porcion: '1 unidad' },
  { nombre: 'Changua', cal: 180, prot: 8, carb: 15, gras: 8, porcion: '1 taza' },

  // Proteínas
  { nombre: 'Pechuga de pollo a la plancha', cal: 165, prot: 31, carb: 0, gras: 4, porcion: '100g' },
  { nombre: 'Pollo frito', cal: 250, prot: 25, carb: 8, gras: 14, porcion: '100g' },
  { nombre: 'Carne de res a la plancha', cal: 200, prot: 26, carb: 0, gras: 10, porcion: '100g' },
  { nombre: 'Huevo entero', cal: 70, prot: 6, carb: 0, gras: 5, porcion: '1 unidad' },
  { nombre: 'Huevos revueltos (2)', cal: 180, prot: 12, carb: 2, gras: 13, porcion: '2 huevos' },
  { nombre: 'Atún en lata', cal: 120, prot: 26, carb: 0, gras: 1, porcion: '1 lata (85g)' },
  { nombre: 'Chorizo', cal: 290, prot: 12, carb: 2, gras: 26, porcion: '1 unidad (85g)' },
  { nombre: 'Chicharrón', cal: 450, prot: 20, carb: 0, gras: 40, porcion: '100g' },

  // Lácteos
  { nombre: 'Queso campesino', cal: 110, prot: 7, carb: 1, gras: 9, porcion: '30g' },
  { nombre: 'Queso doble crema', cal: 130, prot: 6, carb: 1, gras: 11, porcion: '30g' },
  { nombre: 'Yogur natural', cal: 100, prot: 8, carb: 12, gras: 2, porcion: '1 vaso (200g)' },
  { nombre: 'Yogur con frutas', cal: 150, prot: 6, carb: 25, gras: 2, porcion: '1 vaso (200g)' },

  // Pan y cereales
  { nombre: 'Pan tajado blanco', cal: 70, prot: 2, carb: 13, gras: 1, porcion: '1 tajada' },
  { nombre: 'Pan integral', cal: 65, prot: 3, carb: 12, gras: 1, porcion: '1 tajada' },
  { nombre: 'Tostada', cal: 80, prot: 2, carb: 15, gras: 1, porcion: '1 tajada tostada' },
  { nombre: 'Cereal Special K', cal: 120, prot: 6, carb: 23, gras: 0.5, porcion: '1 taza (30g)' },
  { nombre: 'Granola', cal: 200, prot: 5, carb: 35, gras: 6, porcion: '1/2 taza (50g)' },
  { nombre: 'Avena', cal: 150, prot: 5, carb: 27, gras: 3, porcion: '1/2 taza seca' },

  // Comida rápida
  { nombre: 'Hamburguesa sencilla', cal: 550, prot: 25, carb: 45, gras: 28, porcion: '1 unidad' },
  { nombre: 'Perro caliente', cal: 350, prot: 12, carb: 32, gras: 18, porcion: '1 unidad' },
  { nombre: 'Pizza porción', cal: 280, prot: 12, carb: 35, gras: 10, porcion: '1 porción' },
  { nombre: 'Papa a la francesa McDonalds', cal: 320, prot: 4, carb: 43, gras: 15, porcion: 'porción mediana' },

  // Ensaladas y verduras
  { nombre: 'Ensalada verde', cal: 20, prot: 1, carb: 3, gras: 0, porcion: '1 taza' },
  { nombre: 'Ensalada con pollo', cal: 250, prot: 28, carb: 10, gras: 10, porcion: '1 plato' },
  { nombre: 'Brócoli cocido', cal: 55, prot: 4, carb: 11, gras: 0.5, porcion: '1 taza' },
  { nombre: 'Zanahoria', cal: 50, prot: 1, carb: 12, gras: 0, porcion: '1 unidad mediana' },
  { nombre: 'Tomate', cal: 25, prot: 1, carb: 5, gras: 0, porcion: '1 unidad mediana' },
]

export function buscarAlimento(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().trim()
  return ALIMENTOS.filter(a =>
    a.nombre.toLowerCase().includes(q)
  ).slice(0, 8)
}

export function calcularCalorias(alimento, cantidad = 1) {
  return {
    calorias: Math.round(alimento.cal * cantidad),
    proteina_g: Math.round(alimento.prot * cantidad * 10) / 10,
    carbos_g: Math.round(alimento.carb * cantidad * 10) / 10,
    grasas_g: Math.round(alimento.gras * cantidad * 10) / 10,
  }
}
