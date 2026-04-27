export const MOCK_DOCTOR = {
  id:           '608ba0ed-10f6-4370-ab78-104b0bce02bb',
  name:         'Dra. Sofía Quispe',
  firstName:    'Sofía',
  specialty:    'Medicina General',
  cmp:          '62101',
  rating:       4.9,
  reviews:      247,
  visits:       312,
  initials:     'SQ',
  level:        'Doctor House Pro',
  joinedMonths: 8,
};

export const MOCK_TODAY = {
  date:      'Jueves, 24 de abril',
  visits:    4,
  completed: 2,
  earned:    420,
  hours:     6.5,
};

export const MOCK_INCOMING = {
  patient:       'Juana Ramírez',
  age:           58,
  symptom:       'Fiebre persistente y dolor de cabeza',
  symptomDetail: 'Desde hace 2 días. Fiebre de 38.5°C, dolor de cabeza intenso, malestar general. Sin vómitos.',
  address:       'Av. Arequipa 2345, Dpto 402',
  district:      'Lince',
  distance:      '2.3 km',
  eta:           '18 min',
  fee:           85,
  net:           69.70,
  patientPhone:  '+51 999 123 456',
  patientLat:    -12.083,
  patientLng:    -77.035,
};

export const MOCK_ACTIVE_VISIT = {
  id:        null, // filled from real API after accept
  patient:   'Juana Ramírez',
  age:       58,
  gender:    'F',
  dni:       '08345678',
  phone:     '+51 999 123 456',
  address:   'Av. Arequipa 2345, Dpto 402, Lince',
  startedAt: '14:52',
  status:    'traveling',
  allergies:    ['Penicilina'],
  medications:  ['Losartán 50mg'],
  conditions:   ['Hipertensión'],
  lastVisit:    'Hace 3 meses · Dr. Carlos Ramos',
};

export const MOCK_CONSULTATION = {
  chiefComplaint: 'Fiebre persistente y cefalea de 48h',
  vitals: { temp: '38.5', bp: '140/90', hr: '92', spo2: '97', rr: '18', weight: '' },
  symptoms:     ['Fiebre', 'Cefalea', 'Malestar general', 'Mialgia'],
  diagnosis:    'Faringoamigdalitis aguda',
  diagnosisCode:'J03.9',
  notes:        'Paciente refiere odinofagia leve. Exudado faríngeo positivo. Adenopatías cervicales sensibles.',
  followUp:     '5 días',
  recommendations: [
    'Reposo relativo 48 horas',
    'Hidratación abundante (3L/día)',
    'Dieta blanda, evitar irritantes',
    'Control de temperatura cada 6h',
  ],
};

export const MOCK_PRESCRIPTION = [
  { drug: 'Amoxicilina', dose: '500 mg', form: 'Cápsulas',  freq: 'Cada 8 horas',          duration: '7 días',   qty: 21, instructions: 'Después de las comidas' },
  { drug: 'Paracetamol', dose: '500 mg', form: 'Tabletas',  freq: 'Cada 6h si fiebre >38°C', duration: 'Por 3 días', qty: 12, instructions: 'Con agua' },
  { drug: 'Ibuprofeno',  dose: '400 mg', form: 'Tabletas',  freq: 'Cada 8h',                duration: 'Por 3 días', qty: 9,  instructions: 'Después de comer, no en ayunas' },
];

export const MOCK_EARNINGS = {
  today:          420,
  week:           2180,
  month:          9420,
  pending:        640,
  thisWeekVisits: 26,
  trend: [65, 82, 71, 95, 88, 110, 0],
  days:  ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
};

export const MOCK_HISTORY = [
  { id: 'h1', date: 'Hoy · 12:40',   patient: 'Roberto Delgado', age: 42, diagnosis: 'Lumbalgia mecánica',  fee: 85, net: 69.70, rating: 5, district: 'Jesús María' },
  { id: 'h2', date: 'Hoy · 10:15',   patient: 'María Pinto',     age: 31, diagnosis: 'Gastritis aguda',      fee: 85, net: 69.70, rating: 5, district: 'Lince' },
  { id: 'h3', date: 'Ayer · 19:20',  patient: 'Carlos Flores',   age: 67, diagnosis: 'Control HTA',          fee: 85, net: 69.70, rating: 4, district: 'San Isidro' },
  { id: 'h4', date: 'Ayer · 16:45',  patient: 'Paula Rojas',     age: 28, diagnosis: 'Cefalea tensional',    fee: 85, net: 69.70, rating: 5, district: 'Miraflores' },
  { id: 'h5', date: 'Ayer · 11:10',  patient: 'Luis Gómez',      age: 52, diagnosis: 'Infección urinaria',   fee: 85, net: 69.70, rating: 5, district: 'Barranco' },
];

export const MOCK_REVIEWS = [
  { name: 'Roberto D.', stars: 5, text: 'Muy profesional y puntual. Explicó todo con paciencia.', ago: 'hace 2h' },
  { name: 'María P.',   stars: 5, text: 'Excelente trato. Me sentí muy bien atendida.',           ago: 'hace 4h' },
  { name: 'Paula R.',   stars: 5, text: 'Llegó antes de lo estimado, muy amable.',                ago: 'ayer' },
];

export const SCHEDULED_VISITS = [
  { time: '16:00', patient: 'Alberto Chávez', district: 'San Isidro', type: 'Control' },
  { time: '18:30', patient: 'Rosa Linares',   district: 'Lince',      type: 'Primera visita' },
];
