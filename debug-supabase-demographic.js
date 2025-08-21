// Script de diagnóstico avanzado para datos demográficos en Supabase
// Ejecutar en la consola del navegador para diagnosticar problemas

console.log('🔍 INICIANDO DIAGNÓSTICO AVANZADO DE DATOS DEMOGRÁFICOS');

// 1. Verificar autenticación de Supabase
function verificarAutenticacion() {
    console.log('\n📋 1. VERIFICANDO AUTENTICACIÓN');
    
    // Verificar si Supabase está disponible
    if (typeof window !== 'undefined' && window.supabase) {
        console.log('✅ Cliente Supabase encontrado');
        
        // Obtener usuario actual
        window.supabase.auth.getUser().then(({ data: { user }, error }) => {
            if (error) {
                console.error('❌ Error al obtener usuario:', error);
                return;
            }
            
            if (user) {
                console.log('✅ Usuario autenticado:', {
                    id: user.id,
                    email: user.email,
                    role: user.role
                });
            } else {
                console.error('❌ Usuario no autenticado');
            }
        });
    } else {
        console.error('❌ Cliente Supabase no encontrado');
    }
}

// 2. Verificar políticas RLS
function verificarPoliticasRLS() {
    console.log('\n📋 2. VERIFICANDO POLÍTICAS RLS');
    
    if (window.supabase) {
        // Consultar políticas activas
        const query = `
            SELECT 
                schemaname,
                tablename,
                policyname,
                permissive,
                roles,
                cmd,
                qual,
                with_check
            FROM pg_policies 
            WHERE schemaname = 'public' 
              AND tablename = 'plan_accion'
            ORDER BY policyname;
        `;
        
        window.supabase.rpc('execute_sql', { query })
            .then(({ data, error }) => {
                if (error) {
                    console.error('❌ Error al consultar políticas RLS:', error);
                } else {
                    console.log('✅ Políticas RLS activas:', data);
                }
            })
            .catch(err => {
                console.log('ℹ️ No se pudo ejecutar consulta SQL directa (normal en producción)');
            });
    }
}

// 3. Interceptar llamadas a Supabase
function interceptarLlamadasSupabase() {
    console.log('\n📋 3. INTERCEPTANDO LLAMADAS A SUPABASE');
    
    // Interceptar fetch para capturar llamadas a Supabase
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options] = args;
        
        // Solo interceptar llamadas a Supabase
        if (url && url.includes('supabase') && url.includes('plan_accion')) {
            console.log('🔗 Llamada a Supabase interceptada:', {
                url,
                method: options?.method || 'GET',
                headers: options?.headers,
                body: options?.body
            });
            
            // Parsear el body si es JSON
            if (options?.body) {
                try {
                    const bodyData = JSON.parse(options.body);
                    console.log('📦 Datos enviados:', bodyData);
                    
                    // Verificar campos demográficos específicamente
                    const camposDemograficos = {
                        grupo_etareo: bodyData.grupo_etareo,
                        grupo_poblacion: bodyData.grupo_poblacion,
                        zona: bodyData.zona,
                        grupo_etnico: bodyData.grupo_etnico,
                        cantidad: bodyData.cantidad
                    };
                    
                    console.log('👥 Campos demográficos en la petición:', camposDemograficos);
                    
                    // Verificar si hay campos demográficos con valores
                    const tieneValoresDemograficos = Object.values(camposDemograficos).some(valor => 
                        valor !== null && valor !== undefined && valor !== ''
                    );
                    
                    if (tieneValoresDemograficos) {
                        console.log('✅ Se encontraron datos demográficos en la petición');
                    } else {
                        console.warn('⚠️ No se encontraron datos demográficos en la petición');
                    }
                } catch (e) {
                    console.log('ℹ️ Body no es JSON válido');
                }
            }
        }
        
        // Ejecutar la petición original y capturar la respuesta
        return originalFetch.apply(this, args)
            .then(response => {
                if (url && url.includes('supabase') && url.includes('plan_accion')) {
                    console.log('📥 Respuesta de Supabase:', {
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                    });
                    
                    // Clonar la respuesta para poder leerla
                    const responseClone = response.clone();
                    responseClone.text().then(text => {
                        try {
                            const responseData = JSON.parse(text);
                            console.log('📄 Datos de respuesta:', responseData);
                            
                            if (responseData.error) {
                                console.error('❌ Error en respuesta de Supabase:', responseData.error);
                            }
                        } catch (e) {
                            console.log('📄 Respuesta (texto):', text);
                        }
                    });
                }
                
                return response;
            })
            .catch(error => {
                if (url && url.includes('supabase')) {
                    console.error('❌ Error en petición a Supabase:', error);
                }
                throw error;
            });
    };
    
    console.log('✅ Interceptor de fetch activado');
}

// 4. Probar inserción directa
function probarInsercionDirecta() {
    console.log('\n📋 4. PROBANDO INSERCIÓN DIRECTA');
    
    if (!window.supabase) {
        console.error('❌ Cliente Supabase no disponible');
        return;
    }
    
    const datosTest = {
        titulo: 'Test Demográfico - ' + new Date().toISOString(),
        descripcion: 'Prueba de inserción de datos demográficos',
        area_id: '3faec50d-30df-494e-8474-b2c4a091b3a2', // ID del área visible en la imagen
        grupo_etareo: 'Adultos (18-64 años)',
        grupo_poblacion: 'Población general',
        zona: 'Urbana',
        grupo_etnico: 'Mestizo',
        cantidad: 100,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    console.log('📦 Datos de prueba:', datosTest);
    
    window.supabase
        .from('plan_accion')
        .insert(datosTest)
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ Error en inserción directa:', error);
                console.error('📋 Detalles del error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
            } else {
                console.log('✅ Inserción directa exitosa:', data);
            }
        });
}

// 5. Verificar datos existentes
function verificarDatosExistentes() {
    console.log('\n📋 5. VERIFICANDO DATOS EXISTENTES');
    
    if (!window.supabase) {
        console.error('❌ Cliente Supabase no disponible');
        return;
    }
    
    window.supabase
        .from('plan_accion')
        .select('id, titulo, grupo_etareo, grupo_poblacion, zona, grupo_etnico, cantidad')
        .limit(5)
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ Error al consultar datos:', error);
            } else {
                console.log('📊 Últimos registros:', data);
                
                // Verificar si hay registros con datos demográficos
                const conDatosDemograficos = data.filter(registro => 
                    registro.grupo_etareo || registro.grupo_poblacion || 
                    registro.zona || registro.grupo_etnico || registro.cantidad
                );
                
                console.log(`📈 Registros con datos demográficos: ${conDatosDemograficos.length}/${data.length}`);
                
                if (conDatosDemograficos.length > 0) {
                    console.log('✅ Ejemplos con datos demográficos:', conDatosDemograficos);
                } else {
                    console.warn('⚠️ No se encontraron registros con datos demográficos');
                }
            }
        });
}

// 6. Función principal de diagnóstico
function ejecutarDiagnostico() {
    console.log('🚀 EJECUTANDO DIAGNÓSTICO COMPLETO\n');
    
    verificarAutenticacion();
    setTimeout(() => verificarPoliticasRLS(), 1000);
    setTimeout(() => interceptarLlamadasSupabase(), 2000);
    setTimeout(() => verificarDatosExistentes(), 3000);
    
    console.log('\n⏰ Diagnóstico programado. Ahora intenta enviar un formulario con datos demográficos.');
    console.log('📝 Para probar inserción directa, ejecuta: probarInsercionDirecta()');
}

// Exportar funciones para uso manual
window.diagnosticoDemografico = {
    ejecutar: ejecutarDiagnostico,
    verificarAuth: verificarAutenticacion,
    verificarRLS: verificarPoliticasRLS,
    interceptar: interceptarLlamadasSupabase,
    probarInsercion: probarInsercionDirecta,
    verificarDatos: verificarDatosExistentes
};

// Ejecutar automáticamente
ejecutarDiagnostico();

console.log('\n🎯 DIAGNÓSTICO INICIADO');
console.log('💡 Usa window.diagnosticoDemografico para acceder a las funciones individuales');
console.log('📋 Ejemplo: window.diagnosticoDemografico.probarInsercion()');