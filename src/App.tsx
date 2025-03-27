import React, { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SignaturePad from 'react-signature-canvas';
import { 
  Ambulance, 
  Clock, 
  User, 
  UserCog, 
  Stethoscope, 
  Activity,
  Building2,
  FileSignature,
  Brain,
  Timer,
  ClipboardList,
  Search,
  X
} from 'lucide-react';
import { format, parse } from 'date-fns';

const formSchema = z.object({
  fecha: z.string(),
  id_atencion: z.string().min(1, 'Requerido'),
  ambulancia: z.string().min(1, 'Requerido'),
  movil_placa: z.string().min(1, 'Requerido'),
  nombres_paciente: z.string().min(1, 'Requerido'),
  tipo_identificacion: z.string().min(1, 'Requerido'),
  id_paciente: z.string().min(1, 'Requerido'),
  tipo_servicio: z.string().min(1, 'Requerido'),
  direccion_servicio: z.string().min(1, 'Requerido'),
  localizacion: z.string().min(1, 'Requerido'),
  ips_destino: z.string().min(1, 'Requerido'),
  antecedentes: z.string().optional(),
  examen_fisico: z.string().optional(),
  procedimientos: z.string().optional(),
  frecuencia_cardiaca: z.string().optional(),
  frecuencia_respiratoria: z.string().optional(),
  spo2: z.string().optional(),
  tension_arterial: z.string().optional(),
  temperatura: z.string().optional(),
  glasgow_ocular: z.number().min(1).max(4),
  glasgow_verbal: z.number().min(1).max(5),
  glasgow_motor: z.number().min(1).max(6),
});

type FormData = z.infer<typeof formSchema>;

const PLACAS_VEHICULOS = [
  "AMB-001",
  "AMB-002",
  "AMB-003",
  "AMB-004",
  "AMB-005",
  "AMB-006",
  "AMB-007",
  "AMB-008",
  "AMB-009",
  "AMB-010",
];

function App() {
  const [showConsulta, setShowConsulta] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const startTime = useRef<Date>(new Date());
  const [glasgowTotal, setGlasgowTotal] = useState(3);
  
  const paramedicSignature = useRef<SignaturePad>(null);
  const doctorSignature = useRef<SignaturePad>(null);
  const patientSignature = useRef<SignaturePad>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
      glasgow_ocular: 1,
      glasgow_verbal: 1,
      glasgow_motor: 1,
    },
  });

  const glasgowOcular = watch('glasgow_ocular');
  const glasgowVerbal = watch('glasgow_verbal');
  const glasgowMotor = watch('glasgow_motor');

  useEffect(() => {
    setGlasgowTotal(Number(glasgowOcular) + Number(glasgowVerbal) + Number(glasgowMotor));
  }, [glasgowOcular, glasgowVerbal, glasgowMotor]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.current.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const clearSignature = (padRef: React.RefObject<SignaturePad>) => {
    padRef.current?.clear();
  };

  const onSubmit = (data: FormData) => {
    const formData = {
      ...data,
      glasgow_total: glasgowTotal,
      firma_paramedico: paramedicSignature.current?.toDataURL(),
      firma_medico: doctorSignature.current?.toDataURL(),
      firma_paciente: patientSignature.current?.toDataURL(),
    };
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ambulance className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Gestión de Atención Médica</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowConsulta(!showConsulta)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
            >
              {showConsulta ? <ClipboardList className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              {showConsulta ? 'Nuevo Registro' : 'Consultar Registros'}
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-8 px-4">
        {showConsulta ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Consulta de Registros</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID de Atención
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Buscar por ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Desde
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha Hasta
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Atención
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        AT-001
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        2024-03-15
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Juan Pérez
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Emergencia
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completado
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-800">
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Stethoscope className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Registro de Atención Médica</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Información Básica */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha y Hora
                    </label>
                    <div className="mt-1 relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        {...register('fecha')}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ID de Atención
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        {...register('id_atencion')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="ID de Atención"
                      />
                    </div>
                    {errors.id_atencion && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_atencion.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-4">Información del Vehículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ambulancia
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        {...register('ambulancia')}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="ID de Ambulancia"
                      />
                    </div>
                    {errors.ambulancia && (
                      <p className="mt-1 text-sm text-red-600">{errors.ambulancia.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Placa del Vehículo
                    </label>
                    <div className="mt-1 relative">
                      <Ambulance className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        {...register('movil_placa')}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Seleccione una placa</option>
                        {PLACAS_VEHICULOS.map((placa) => (
                          <option key={placa} value={placa}>
                            {placa}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.movil_placa && (
                      <p className="mt-1 text-sm text-red-600">{errors.movil_placa.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del Paciente */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-purple-900 flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Información del Paciente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      {...register('nombres_paciente')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Nombre del Paciente"
                    />
                    {errors.nombres_paciente && (
                      <p className="mt-1 text-sm text-red-600">{errors.nombres_paciente.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Identificación
                    </label>
                    <select
                      {...register('tipo_identificacion')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Seleccione tipo de ID</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="PP">Pasaporte</option>
                    </select>
                    {errors.tipo_identificacion && (
                      <p className="mt-1 text-sm text-red-600">{errors.tipo_identificacion.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número de Identificación
                    </label>
                    <input
                      type="text"
                      {...register('id_paciente')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Número de ID"
                    />
                    {errors.id_paciente && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_paciente.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del Servicio */}
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-900 flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5" />
                  Información del Servicio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Servicio
                    </label>
                    <select
                      {...register('tipo_servicio')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Seleccione tipo de servicio</option>
                      <option value="emergency">Emergencia</option>
                      <option value="transfer">Traslado</option>
                      <option value="consultation">Consulta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dirección del Servicio
                    </label>
                    <input
                      type="text"
                      {...register('direccion_servicio')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Dirección del Servicio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción de la Ubicación
                    </label>
                    <input
                      type="text"
                      {...register('localizacion')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Detalles de la Ubicación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Centro Médico de Destino
                    </label>
                    <input
                      type="text"
                      {...register('ips_destino')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Centro Médico de Destino"
                    />
                  </div>
                </div>
              </div>

              {/* Signos Vitales */}
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-red-900 flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5" />
                  Signos Vitales
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Frecuencia Cardíaca (lpm)
                    </label>
                    <input
                      type="number"
                      {...register('frecuencia_cardiaca')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Frecuencia Respiratoria (rpm)
                    </label>
                    <input
                      type="number"
                      {...register('frecuencia_respiratoria')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SpO2 (%)
                    </label>
                    <input
                      type="number"
                      {...register('spo2')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tensión Arterial
                    </label>
                    <input
                      type="text"
                      {...register('tension_arterial')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="ej. 120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Temperatura (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('temperatura')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Escala de Glasgow */}
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-900 flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5" />
                  Escala de Glasgow
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Respuesta Ocular
                    </label>
                    <select
                      {...register('glasgow_ocular', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="1">1 - No abre los ojos</option>
                      <option value="2">2 - Abre los ojos al dolor</option>
                      <option value="3">3 - Abre los ojos a la voz</option>
                      <option value="4">4 - Abre los ojos espontáneamente</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Respuesta Verbal
                    </label>
                    <select
                      {...register('glasgow_verbal', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="1">1 - Sin respuesta verbal</option>
                      <option value="2">2 - Sonidos incomprensibles</option>
                      <option value="3">3 - Palabras inapropiadas</option>
                      <option value="4">4 - Confuso</option>
                      <option value="5">5 - Orientado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Respuesta Motora
                    </label>
                    <select
                      {...register('glasgow_motor', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="1">1 - Sin respuesta motora</option>
                      <option value="2">2 - Extensión al dolor</option>
                      <option value="3">3 - Flexión al dolor</option>
                      <option value="4">4 - Retirada al dolor</option>
                      <option value="5">5 - Localiza el dolor</option>
                      <option value="6">6 - Obedece órdenes</option>
                    </select>
                  </div>
                </div>

                <div className="bg-indigo-100 p-4 rounded-lg mt-4">
                  <p className="text-lg font-semibold text-indigo-700">
                    Puntuación Total de Glasgow: {glasgowTotal}
                  </p>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-teal-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-teal-900 flex items-center gap-2 mb-4">
                  <FileSignature className="h-5 w-5" />
                  Información Médica
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Antecedentes Médicos
                    </label>
                    <textarea
                      {...register('antecedentes')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Antecedentes médicos del paciente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Examen Físico
                    </label>
                    <textarea
                      {...register('examen_fisico')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Hallazgos del examen físico"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Procedimientos Realizados
                    </label>
                    <textarea
                      {...register('procedimientos')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Lista de procedimientos realizados"
                    />
                  </div>
                </div>
              </div>

              {/* Firmas */}
              <div className="bg-pink-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-pink-900 flex items-center gap-2 mb-4">
                  <FileSignature className="h-5 w-5" />
                  Firmas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Firma del Paramédico
                    </label>
                    <div className="border rounded-lg p-2 bg-white">
                      <SignaturePad
                        ref={paramedicSignature}
                        canvasProps={{
                          className: 'w-full h-40 border rounded',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => clearSignature(paramedicSignature)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Limpiar Firma
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Firma del Médico
                    </label>
                    <div className="border rounded-lg p-2 bg-white">
                      <SignaturePad
                        ref={doctorSignature}
                        canvasProps={{
                          className: 'w-full h-40 border rounded',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => clearSignature(doctorSignature)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Limpiar Firma
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Firma del Paciente
                    </label>
                    <div className="border rounded-lg p-2 bg-white">
                      <SignaturePad
                        ref={patientSignature}
                        canvasProps={{
                          className: 'w-full h-40 border rounded',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => clearSignature(patientSignature)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Limpiar Firma
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="submit"
                    className="w-full md:w-auto inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Guardar Registro
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Timer className="h-5 w-5" />
                    <span className="font-mono text-lg">Tiempo transcurrido: {elapsedTime}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;