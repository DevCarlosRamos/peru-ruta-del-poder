import type { CardCategory, CardDef, ContentTag, Rarity, ResourceDelta } from '../engine/types';

/**
 * Mazo de cartas de "PERÚ: LA RUTA DEL PODER" (obra satírica original).
 *
 * ETIQUETAS DE PROCEDENCIA:
 * - [HISTÓRICO]: hecho histórico documentado, redactado de forma neutral.
 * - [INVESTIGACIÓN]: investigación/acusación fiscal o periodística. NUNCA se presenta
 *   una acusación como condena ni una sospecha como hecho. Es mecánica de juego.
 * - [FICCIÓN]: eventos con personas, empresas e instituciones ficticias.
 * - [SÁTIRA]: humor político ficticio, sin acusaciones contra personas reales.
 *
 * Nada de este contenido es una afirmación de culpabilidad sobre ninguna persona real.
 */
export const CARDS: CardDef[] = [];

function add(
  id: string,
  nombre: string,
  categoria: CardCategory,
  tag: ContentTag,
  textoCorto: string,
  descripcion: string,
  contexto: string,
  efectos: ResourceDelta,
  riesgo: { institucional: number; judicial: number },
  rareza: Rarity = 'comun',
  impacto: 'bajo' | 'medio' | 'alto' = 'bajo',
  decision?: CardDef['decision'],
  requiereVerificacion?: string,
): void {
  const dinero = efectos.dinero ?? 0;
  CARDS.push({
    id,
    nombre,
    categoria,
    tag,
    descripcion,
    contexto,
    efectos,
    costo: dinero < 0 ? -dinero : 0,
    recompensa: dinero > 0 ? dinero : 0,
    riesgo,
    rareza,
    impacto,
    textoCorto,
    decision,
    requiereVerificacion,
  });
}

// ============ EVENTO POLÍTICO ============
add('ep1', 'Disolución del Congreso', 'evento_politico', 'HISTORICO',
  'El Ejecutivo disuelve el Congreso.',
  'Hecho histórico documentado (2019): disolución del Congreso y convocatoria a nuevas elecciones parlamentarias. En el juego: tu poder crece, tu relación con el hemiciclo se rompe.',
  'Hecho de conocimiento público. REQ-VERIFICACIÓN: detalle exacto de fechas y normas.',
  { poder: 10, apoyoPolitico: -8, riesgoInstitucional: 6 }, { institucional: 6, judicial: 0 }, 'poco_comun', 'alto');
add('ep2', 'Vacancia presidencial', 'evento_politico', 'HISTORICO',
  'El Congreso debate la vacancia.',
  'Hecho histórico documentado (2020): destitución presidencial por el Congreso. En el juego: si tu apoyo político es bajo, el riesgo de caer crece.',
  'Hecho de conocimiento público. No se atribuyen causas ni calificaciones.',
  { poder: -5, apoyoPolitico: -5, riesgoInstitucional: 10 }, { institucional: 10, judicial: 0 }, 'poco_comun', 'alto');
add('ep3', 'Toma de la Vía Expresa', 'evento_politico', 'SATIRA',
  'Medio país en camioneta por el carril de siempre.',
  'Un sábado cualquiera, la ciudad entera está en la avenida. La gente aplaude a quien le promete llegar más rápido.',
  'Situación satírica ficticia de tráfico y protestas urbanas.',
  { popularidad: 5, influencia: -3 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('ep4', 'Moción de censura al gabinete', 'evento_politico', 'HISTORICO',
  'Cae el gabinete en bloque.',
  'Mecánica basada en el mecanismo constitucional de censura ministerial. Si tu apoyo político es bajo, pierdes poder.',
  'Mecanismo constitucional real; situación genérica de juego.',
  { poder: -8, apoyoPolitico: -3 }, { institucional: 4, judicial: 0 }, 'comun', 'medio');
add('ep5', 'Ministro renuncia con estilo', 'evento_politico', 'FICCION',
  'Renuncia por motivos personales (y redes sociales).',
  'Un ministro ficticio renuncia en plena noche. El gabinete queda cojo una semana.',
  'Evento ficticio, personaje ficticio.',
  { popularidad: -4, influencia: 3 }, { institucional: 2, judicial: 0 }, 'comun', 'bajo');
add('ep6', 'Cumbre de cúpulas en Miraflores', 'evento_politico', 'SATIRA',
  'Todos sonríen, nadie escucha.',
  'Reunión de altas esferas en un hotel ficticio. Foto de familia perfecta; acuerdos, ninguno.',
  'Situación satírica ficticia.',
  { influencia: 5, popularidad: -2 }, { institucional: 0, judicial: 0 }, 'comun', 'bajo');

// ============ EVENTO ECONÓMICO ============
add('ee1', 'Hiperinflación (referencia 1988-1990)', 'evento_economico', 'HISTORICO',
  'El dinero pierde valor de la noche a la mañana.',
  'Hecho económico documentado: período de hiperinflación. En el juego: pierdes el 15% de tu dinero y sube el riesgo institucional.',
  'Fenómeno económico histórico documentado.',
  { dinero: 0, riesgoInstitucional: 4 }, { institucional: 4, judicial: 0 }, 'raro', 'alto',
  undefined, 'Verificar cifras históricas exactas antes de publicar.');
add('ee2', 'Boom de la minería', 'evento_economico', 'HISTORICO',
  'Las exportaciones despegan.',
  'Auge exportador documentado en la década de 2000. En el juego: todos ganan dinero y el mercado sube.',
  'Fenómeno económico histórico de auge de precios de materias primas.',
  { dinero: 10 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('ee3', 'Fenómeno de El Niño', 'evento_economico', 'HISTORICO',
  'La naturaleza no negocia presupuesto.',
  'Fenómeno climático recurrente y documentado. En el juego: pierdes dinero y popularidad.',
  'Fenómeno climático de conocimiento público.',
  { dinero: -8, popularidad: -3 }, { institucional: 2, judicial: 0 }, 'poco_comun', 'alto');
add('ee4', 'TLC con el Lejano Oriente', 'evento_economico', 'FICCION',
  'Nuevo acuerdo comercial con un país lejano y simpático.',
  'Acuerdo comercial ficticio: tus exportaciones crecen y entran inversiones.',
  'Evento económico ficticio.',
  { dinero: 6, influencia: 3 }, { institucional: 0, judicial: 0 }, 'poco_comun', 'medio');
add('ee5', 'El dólar se mueve de golpe', 'evento_economico', 'SATIRA',
  'Nadie sabe por qué, pero todos opinan.',
  'Volatilidad cambiaria ficticia: ganas o pierdes según la coyuntura.',
  'Situación económica satírica genérica.',
  { dinero: -6 }, { institucional: 0, judicial: 0 }, 'comun', 'medio',
  { opciones: [
    { texto: 'Comprar dólares', efectos: { dinero: -6, influencia: 2 } },
    { texto: 'Esperar sentado', efectos: { dinero: -3 } },
  ] });
add('ee6', 'Rally de inversión extranjera', 'evento_economico', 'FICCION',
  'Los capitales miran al país con cariño.',
  'Semana ficticia de confianza inversionista: ingresos para todos y mercado alcista.',
  'Evento económico ficticio.',
  { dinero: 8 }, { institucional: 0, judicial: 0 }, 'poco_comun', 'medio');

// ============ CRISIS ============
add('cr1', 'Tres presidentes en una semana', 'crisis', 'HISTORICO',
  'Noviembre de 2020: vértigo institucional.',
  'Hecho histórico documentado (noviembre 2020): sucesión presidencial acelerada. En el juego: el riesgo institucional sube para todos.',
  'Hecho de conocimiento público, redactado de forma neutral.',
  { riesgoInstitucional: 8 }, { institucional: 8, judicial: 0 }, 'poco_comun', 'alto');
add('cr2', 'Paro de transportistas', 'crisis', 'FICCION',
  'La ciudad se detiene por el combustible.',
  'Gremio ficticio paraliza el transporte. Gastas para mitigar o pierdes popularidad.',
  'Evento ficticio.',
  { popularidad: -5 }, { institucional: 2, judicial: 0 }, 'comun', 'medio',
  { opciones: [
    { texto: 'Negociar y gastar S/ 8', efectos: { dinero: -8, popularidad: 2 } },
    { texto: 'Dejar que pase', efectos: { popularidad: -5 } },
  ] });
add('cr3', 'Huelga de maestros', 'crisis', 'FICCION',
  'Las aulas esperan.',
  'Huelga ficticia del magisterio: pagas un bono o la popularidad se resiente.',
  'Evento ficticio.',
  { popularidad: -4 }, { institucional: 1, judicial: 0 }, 'comun', 'bajo',
  { opciones: [
    { texto: 'Pagar bono de S/ 6', efectos: { dinero: -6, popularidad: 4 } },
    { texto: 'Esperar', efectos: { popularidad: -4 } },
  ] });
add('cr4', 'Deslizamiento en región ficticia', 'crisis', 'FICCION',
  'La naturaleza golpea una provincia.',
  'Desastre natural ficticio en la provincia de Rumiñawi (ficticia). Gastas en ayuda o pierdes popularidad e influencia.',
  'Evento ficticio.',
  { popularidad: -4, influencia: -2 }, { institucional: 2, judicial: 0 }, 'poco_comun', 'alto',
  { opciones: [
    { texto: 'Declarar emergencia y gastar S/ 10', efectos: { dinero: -10, popularidad: 6 } },
    { texto: 'Solo lamentarlo', efectos: { popularidad: -4, influencia: -2 } },
  ] });
add('cr5', 'Crisis de gabinete a las 3 a.m.', 'crisis', 'SATIRA',
  'Nadie renunció, pero todos estuvieron a punto.',
  'Una madrugada ficticia de teléfonos calientes y tuits borrados.',
  'Situación satírica ficticia.',
  { riesgoInstitucional: 5, popularidad: -2 }, { institucional: 5, judicial: 0 }, 'comun', 'medio');


// ============ INVESTIGACIÓN ============
add('in1', 'Fiscalía (ficticia) anuncia diligencias', 'investigacion', 'FICCION',
  'Diligencias preliminares en curso.',
  'Una fiscalía ficticia abre diligencias por un caso abstracto de gestión pública. Es mecánica de juego, no una afirmación sobre nadie.',
  'Situación ficticia.',
  { riesgoJudicial: 8, popularidad: -3 }, { institucional: 3, judicial: 8 }, 'poco_comun', 'alto');
add('in2', 'Lava Jato: contexto de investigaciones', 'investigacion', 'INVESTIGACION',
  'Investigaciones internacionales documentadas.',
  'Referencia histórica: la operación Lava Jato y la trama de Odebrecht fueron objeto de investigaciones y procesos. En el juego solo se representa el clima de investigación: sube tu riesgo judicial. No implica culpabilidad de ningún personaje real.',
  'Investigaciones de conocimiento público. Las condenas y procesos son materia judicial, no mecánica de juego.',
  { riesgoJudicial: 10 }, { institucional: 4, judicial: 10 }, 'raro', 'alto',
  undefined, 'REQUIERE VERIFICACIÓN: estado actual de cada proceso judicial individual.');
add('in3', 'Carpeta fiscal encontrada', 'investigacion', 'SATIRA',
  'Una carpeta aparece donde no debía.',
  'Sátira burocrática ficticia: una carpeta olvidada genera revuelo. Nadie sabe qué contiene.',
  'Situación satírica ficticia.',
  { riesgoJudicial: 6 }, { institucional: 2, judicial: 6 }, 'comun', 'medio');
add('in4', 'Allanamiento a empresa ficticia', 'investigacion', 'FICCION',
  'Los reflectores apuntan a una empresa inventada.',
  'La empresa ficticia Constructora Andina S.A. amanece en portada. Es una mecánica de exposición, no una acusación a persona alguna.',
  'Situación ficticia con empresa ficticia.',
  { riesgoJudicial: 9, popularidad: -2, dinero: -4 }, { institucional: 4, judicial: 9 }, 'poco_comun', 'alto');
add('in5', 'Audiencia preliminar', 'investigacion', 'FICCION',
  'Tribunal ficticio evalúa el expediente.',
  'Un tribunal ficticio cita a rendir declaración por un caso abstracto. Defiéndete pagando o asume el golpe de imagen.',
  'Situación ficticia.',
  { riesgoJudicial: 6, influencia: -4 }, { institucional: 3, judicial: 6 }, 'comun', 'alto',
  { opciones: [
    { texto: 'Contratar defensa (S/ 8)', efectos: { dinero: -8, riesgoJudicial: -6 } },
    { texto: 'Declarar sin abogados', efectos: { riesgoJudicial: 6, influencia: -4 } },
  ] });

// ============ ESCÁNDALO ============
add('es1', 'Audio filtrado en reunión privada', 'escandalo', 'FICCION',
  'Todos escucharon lo que no se dijo.',
  'Un audio ficticio se filtra. La opinión pública se enciende. Es ficción: ningún personaje real está implicado.',
  'Situación ficticia.',
  { popularidad: -6, riesgoInstitucional: 8 }, { institucional: 8, judicial: 4 }, 'poco_comun', 'alto');
add('es2', 'Correos que viajaron solos', 'escandalo', 'FICCION',
  'Un reenvío desafortunado.',
  'Correos ficticios llegan a la prensa. Costo de imagen, daño institucional.',
  'Situación ficticia.',
  { popularidad: -5, riesgoJudicial: 6 }, { institucional: 5, judicial: 6 }, 'comun', 'alto');
add('es3', 'Boletas que no cierran', 'escandalo', 'FICCION',
  'La contabilidad de campaña no cuadra.',
  'Irregularidad abstracta en la contabilidad de una campaña ficticia. Sube tu nivel de riesgo.',
  'Situación ficticia.',
  { popularidad: -8, riesgoJudicial: 12 }, { institucional: 4, judicial: 12 }, 'raro', 'alto',
  undefined, 'En el mundo real: cada proceso es materia judicial; el juego no afirma nada.');
add('es4', 'Video de salón oscuro', 'escandalo', 'SATIRA',
  'Las cámaras graban un brindis incómodo.',
  'Sátira: un brindis con gente misteriosa en un salón oscuro da que hablar.',
  'Situación satírica ficticia.',
  { popularidad: -4, riesgoInstitucional: 6 }, { institucional: 6, judicial: 2 }, 'comun', 'medio');
add('es5', 'El chat que se filtró', 'escandalo', 'SATIRA',
  'Emoji comprometedor en grupo de trabajo.',
  'Un chat grupal ficticio se filtra y el país entero debate el significado de un emoji.',
  'Situación satírica ficticia.',
  { popularidad: -3, riesgoInstitucional: 4 }, { institucional: 4, judicial: 0 }, 'comun', 'bajo');


// ============ OPOSICIÓN ============
add('op1', 'Bancada pide interpelación', 'oposicion', 'FICCION',
  'Preguntas incómodas en el pleno.',
  'Una bancada ficticia interpela a un ministro ficticio. Si tu apoyo político es bajo, pierdes poder.',
  'Situación ficticia.',
  { apoyoPolitico: -5, poder: -4 }, { institucional: 3, judicial: 0 }, 'comun', 'medio');
add('op2', 'Censura al ministro de turno', 'oposicion', 'FICCION',
  'El gabinete pierde una pieza.',
  'Censura a un ministro ficticio por el pleno. Pierdes apoyo político.',
  'Situación ficticia.',
  { apoyoPolitico: -6 }, { institucional: 2, judicial: 0 }, 'comun', 'bajo');
add('op3', 'Mociones que no llegan a votación', 'oposicion', 'SATIRA',
  'Mucho ruido, pocas firmas.',
  'Sátira: decenas de mociones se presentan y ninguna se debate.',
  'Situación satírica ficticia.',
  { riesgoInstitucional: 3 }, { institucional: 3, judicial: 0 }, 'comun', 'bajo');

// ============ ELECCIÓN ============
add('el1', 'Debate electoral encendido', 'eleccion', 'FICCION',
  'El rating sube, las propuestas también.',
  'Debate ficticio: ganas popularidad e influencia para la contienda.',
  'Situación ficticia.',
  { popularidad: 6, influencia: 4 }, { institucional: 0, judicial: 0 }, 'poco_comun', 'medio');
add('el2', 'Encuesta de última hora', 'eleccion', 'FICCION',
  'Las encuestas pintan de colores.',
  'Encuesta ficticia favorable: bono de popularidad en campaña.',
  'Situación ficticia.',
  { popularidad: 8 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('el3', 'Denuncias sin pruebas en campaña', 'eleccion', 'SATIRA',
  'En campaña todo se dice.',
  'Sátira: una denuncia sin pruebas (y sin nombre real) llena portadas. Sube el riesgo de todos los candidatos.',
  'Situación satírica ficticia.',
  { riesgoInstitucional: 5 }, { institucional: 5, judicial: 0 }, 'comun', 'bajo');


// ============ OPORTUNIDAD ============
add('oportunidad1', 'Oferta de un grupo empresarial', 'oportunidad', 'FICCION',
  'Un socio anónimo quiere colaborar.',
  'Un grupo empresarial ficticio ofrece financiamiento rápido. Tú decides el costo político.',
  'Situación ficticia.',
  { dinero: 25, riesgoInstitucional: 10 }, { institucional: 10, judicial: 5 }, 'poco_comun', 'alto',
  { opciones: [
    { texto: 'Aceptar el financiamiento', efectos: { dinero: 25, riesgoInstitucional: 10, riesgoJudicial: 5 } },
    { texto: 'Declinar con elegancia', efectos: { influencia: 2 } },
  ] });
add('oportunidad2', 'Programa de TV te invita', 'oportunidad', 'FICCION',
  'El prime time es tuyo.',
  'Un programa ficticio de entrevistas te da tribuna. Sube tu popularidad.',
  'Situación ficticia.',
  { popularidad: 8 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('oportunidad3', 'Socio internacional misterioso', 'oportunidad', 'FICCION',
  'Un fondo lejano busca oportunidades.',
  'Un fondo de inversión ficticio propone un trato ventajoso con cláusulas turbias.',
  'Situación ficticia.',
  { dinero: 18, riesgoJudicial: 8 }, { institucional: 3, judicial: 8 }, 'poco_comun', 'alto',
  { opciones: [
    { texto: 'Aceptar el trato', efectos: { dinero: 18, riesgoJudicial: 8 } },
    { texto: 'Pedir documentación', efectos: { dinero: 6, influencia: 3 } },
  ] });
add('oportunidad4', 'Apoyo de ONG ficticia', 'oportunidad', 'FICCION',
  'Talleres, cascos y fotos.',
  'Una ONG ficticia te invita a una gira. Ganas popularidad sin costo.',
  'Situación ficticia.',
  { popularidad: 6, influencia: 3 }, { institucional: 0, judicial: 0 }, 'comun', 'bajo');
add('oportunidad5', 'El arte de no hacer nada', 'oportunidad', 'SATIRA',
  'A veces gobernar es no estorbar.',
  'Sátira: una semana sin novedades mejora tu imagen.',
  'Situación satírica ficticia.',
  { popularidad: 4 }, { institucional: 0, judicial: 0 }, 'comun', 'bajo');

// ============ PROYECTO ============
add('pr1', 'Proyecto ficticio “Agua para Todos”', 'proyecto', 'FICCION',
  'Una obra con nombre de campaña.',
  'Programa ficticio de acceso al agua en provincias. Ganas popularidad e influencia.',
  'Proyecto ficticio.',
  { dinero: -8, popularidad: 7, influencia: 3 }, { institucional: 1, judicial: 0 }, 'comun', 'medio');
add('pr2', 'Estadio del Bicentenario (ficticio)', 'proyecto', 'FICCION',
  'Inauguración con partido amistoso.',
  'Infraestructura deportiva ficticia. Popularidad inmediata, costo alto.',
  'Proyecto ficticio.',
  { dinero: -14, popularidad: 9 }, { institucional: 2, judicial: 0 }, 'poco_comun', 'medio');
add('pr3', 'Teleférico del Cañón (fallido)', 'proyecto', 'FICCION',
  'El proyecto que no llegó a estrenarse.',
  'Proyecto ficticio fallido: obra paralizada. Solo pérdidas de imagen y dinero.',
  'Proyecto fallido ficticio.',
  { dinero: -6, popularidad: -5 }, { institucional: 4, judicial: 3 }, 'poco_comun', 'alto',
  undefined, 'Proyecto 100% ficticio; no corresponde a ninguna obra real.');

// ============ ALIANZA ============
add('al1', 'Pacto con movimiento regional', 'alianza', 'FICCION',
  'El sur apoya tu nombre.',
  'Un movimiento regional ficticio (Movimiento Regional Flor y Viento) se alinea contigo.',
  'Situación ficticia.',
  { apoyoPolitico: 6, influencia: 4 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('al2', 'Coalición parlamentaria', 'alianza', 'FICCION',
  'Bancadas que suman.',
  'Coalición ficticia de bancadas técnicas. Apoyo político en el hemiciclo.',
  'Situación ficticia.',
  { apoyoPolitico: 8, dinero: -4 }, { institucional: 1, judicial: 0 }, 'poco_comun', 'alto');
add('al3', 'Movimiento Cívico Cercanía', 'alianza', 'FICCION',
  'Voluntarios, banderines y buena vibra.',
  'Movimiento cívico ficticio que te acompaña en campañas.',
  'Situación ficticia.',
  { apoyoPolitico: 4, popularidad: 4 }, { institucional: 0, judicial: 0 }, 'comun', 'bajo');

// ============ MERCADO ============
add('me1', 'Bolsas en alza', 'mercado', 'HISTORICO',
  'La región acompaña.',
  'Jornada de mercados en alza (referencia documentada de ciclos alcistas). Todos ganan.',
  'Ciclo de mercado histórico genérico.',
  { dinero: 8 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('me2', 'Caída del cobre', 'mercado', 'HISTORICO',
  'El metal rojo se apaga.',
  'Caída de precios de materias primas (ciclo histórico documentado). Todos pierden.',
  'Ciclo de mercado histórico genérico.',
  { dinero: -6 }, { institucional: 0, judicial: 0 }, 'comun', 'medio');
add('me3', 'Subasta de bonos', 'mercado', 'FICCION',
  'El Estado pide prestado.',
  'Subasta ficticia de bonos: tu influencia te permite acceder a tasas amigables.',
  'Situación ficticia.',
  { dinero: 5, influencia: -2, deuda: 8 }, { institucional: 1, judicial: 0 }, 'comun', 'medio',
  { opciones: [
    { texto: 'Participar', efectos: { dinero: 5, deuda: 8 } },
    { texto: 'Pasar la subasta', efectos: { influencia: 1 } },
  ] });
add('me4', 'Indicadores maquillados', 'mercado', 'SATIRA',
  'El gráfico se ve mejor con otra escala.',
  'Sátira: un comunicado optimista sube las expectativas.',
  'Situación satírica ficticia.',
  { popularidad: 3, dinero: 4 }, { institucional: 2, judicial: 0 }, 'comun', 'bajo');


// ============ DECISIÓN PRESIDENCIAL ============
add('dp1', 'Pactar con el Congreso', 'decision_presidencial', 'FICCION',
  'Las leyes se cocinan en el hemiciclo.',
  'Negocias apoyo parlamentario a cambio de cargos y prebendas ficticias.',
  'Situación ficticia.',
  { apoyoPolitico: 8, influencia: -5 }, { institucional: 3, judicial: 0 }, 'poco_comun', 'medio',
  { opciones: [
    { texto: 'Ceder cargos', efectos: { apoyoPolitico: 8, influencia: -5 } },
    { texto: 'Mantener tu equipo', efectos: { poder: 4, apoyoPolitico: -3 } },
  ] });
add('dp2', 'Perdonazo tributario', 'decision_presidencial', 'FICCION',
  'Las deudas vuelan.',
  'Perdón fiscal ficticio: popularidad de corto plazo, menos caja.',
  'Situación ficticia.',
  { dinero: -10, popularidad: 8 }, { institucional: 2, judicial: 0 }, 'poco_comun', 'medio');
add('dp3', 'Decretazo de emergencia', 'decision_presidencial', 'FICCION',
  'Firmar y despachar.',
  'Medida de emergencia ficticia: resuelves rápido, pero el hemiciclo se molesta.',
  'Situación ficticia.',
  { poder: 6, apoyoPolitico: -5, riesgoInstitucional: 4 }, { institucional: 4, judicial: 0 }, 'poco_comun', 'alto');
add('dp4', 'Nombramiento polémico', 'decision_presidencial', 'FICCION',
  'Un ministro con mucha historia.',
  'Nombramiento ficticio de un ministro con pasado complicado.',
  'Situación ficticia.',
  { poder: 3, riesgoInstitucional: 6, popularidad: -3 }, { institucional: 6, judicial: 0 }, 'comun', 'medio');
add('dp5', 'Cortina de humo mediática', 'decision_presidencial', 'SATIRA',
  'Anuncia un tema, esconde otro.',
  'Sátira: una buena noticia empaquetada distrae de una mala.',
  'Situación satírica ficticia.',
  { popularidad: 5, riesgoInstitucional: 3 }, { institucional: 3, judicial: 0 }, 'comun', 'bajo');
add('dp6', 'Refrendo del gabinete', 'decision_presidencial', 'FICCION',
  'Voto de confianza al nuevo equipo.',
  'El pleno vota la confianza al gabinete ficticio. Sale bien si tienes apoyo.',
  'Situación ficticia.',
  { apoyoPolitico: 5, poder: 4 }, { institucional: 1, judicial: 0 }, 'comun', 'medio');

/** Índice de cartas por id. */
export const CARD_MAP: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

/** Mazo por categoría (para robo dirigido según casilla). */
export const CARDS_BY_CATEGORY: Record<CardDef['categoria'], string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const c of CARDS) {
    (out[c.categoria] ??= []).push(c.id);
  }
  return out as Record<CardDef['categoria'], string[]>;
})();

