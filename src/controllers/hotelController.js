const {conn} = require('../db/db');

module.exports= {
    
    reservarHabitacion: async (req, res) => {
        const formData = req.body;

        try {
            const insertUser = `
                INSERT INTO usuarios
                (nombre, apellido, email, isAdmin) VALUES (?,?,?,false)
            `;
            const resultUser = await conn.query(insertUser, [formData.nombre, formData.apellido, formData.email]);
            const userId = resultUser[0].insertId;
    
            const generarCodigoReserva = () => {
                const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                const longitud = 10;
                return Array.from({ length: longitud }, () => caracteres.charAt(Math.floor(Math.random() * caracteres.length))).join('');
            };
            const codigoReserva = generarCodigoReserva();

            const fechaReserva = new Date().toISOString().slice(0, 10);
    
            const insertReserva = `
                INSERT INTO reservas
                (userId, habitacionId, fechaLlegada, fechaSalida, codigoReserva, estadoReserva, fechaReserva)
                VALUES (?,?,?,?,?,?,?)
            `;
            const resultReserva = await conn.query(insertReserva, [userId, formData.id, formData.fechaLlegada, formData.fechaSalida, codigoReserva, true, fechaReserva]);
            
            const selectReserva = `
                SELECT r.*, 
                       u.nombre as NombreUsuario, u.apellido, u.email, u.isAdmin,
                       h.*, o.descripcion AS tipoHab
                FROM reservas r
                LEFT JOIN usuarios u ON r.userId = u.id
                LEFT JOIN habitaciones h ON r.habitacionId = h.id
                LEFT JOIN tipoHabitacion o ON h.tipoHab_id = o.id
                WHERE r.id = ? AND u.isAdmin = false
            `;
            const [registros] = await conn.query(selectReserva, [resultReserva[0].insertId]);
    
            if (registros.length == 0) {
                return res.status(404).json({ mensaje: 'Error al reservar' });
            }
    
            res.json(registros);
        } catch (error) {
            throw error;
        } finally {
            conn.releaseConnection();
        }
    },    
    verHabitacion: async (req, res) => {
        try {
            const sql = `
                SELECT h.*, th.descripcion AS habitacionTipo
                FROM habitaciones h
                LEFT JOIN tipoHabitacion th ON h.tipoHab_id = th.id
                WHERE h.id = ?
            `;
            const [registros] = await conn.query(sql, [req.params.id]);
            res.json(registros);
        } catch (error) {
            throw error;
        } finally {
            conn.releaseConnection();
        }
    },    
    getHabitaciones: async (req, res) => {
        try {
            const sql = `
                SELECT h.*, th.descripcion AS habitacionTipo
                FROM habitaciones h
                LEFT JOIN tipoHabitacion th ON h.tipoHab_id = th.id
            `;
            const [registros] = await conn.query(sql);
            res.json(registros);
        } catch (error) {
            throw error;
        } finally {
            conn.releaseConnection();
        }
    },    
    getReserva: async (req, res) => {
        try {
            const sql = `
                SELECT r.*, 
                       u.nombre as NombreUsuario, u.apellido, u.email, u.isAdmin,
                       h.*,o.descripcion AS tipoHab
                FROM reservas r
                LEFT JOIN usuarios u ON r.userId = u.id
                LEFT JOIN habitaciones h ON r.habitacionId = h.id
                LEFT JOIN tipoHabitacion o ON h.tipoHab_id = o.id
                WHERE r.codigoReserva = ? AND u.isAdmin = false
            `;
            const [registros] = await conn.query(sql, [req.params.id]);
            if (registros.length == 0) {
                return res.status(404).json({ mensaje: 'No se encontró ninguna reserva.' });
            }
            res.json(registros);
        } catch (error) {
            throw error;
        } finally {
            conn.releaseConnection();
        }
    },
    cancelarReserva: async (req, res) => {
        try {
            const updateSql = `
                UPDATE reservas
                SET estadoReserva = false
                WHERE codigoReserva = ?
            `;
            await conn.query(updateSql, [req.params.id]);

            const selectSql = `
                SELECT r.*, 
                       u.nombre as NombreUsuario, u.apellido, u.email, u.isAdmin,
                       h.*, o.descripcion AS tipoHab
                FROM reservas r
                LEFT JOIN usuarios u ON r.userId = u.id
                LEFT JOIN habitaciones h ON r.habitacionId = h.id
                LEFT JOIN tipoHabitacion o ON h.tipoHab_id = o.id
                WHERE r.codigoReserva = ? AND u.isAdmin = false
            `;
            const [registros] = await conn.query(selectSql, [req.params.id]);
            
            if (registros.length === 0) {
                return res.status(404).json({ mensaje: 'No se encontró ninguna reserva.' });
            }
    
            res.json(registros);
        } catch (error) {
            throw error;
        } finally {
            conn.releaseConnection();
        }
    }
}