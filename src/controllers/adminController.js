const { conn } = require('../db/db.js')
const jtoken = require('jsonwebtoken')
const crypt = require('bcryptjs')
const jwtconfig = require('./../config/jwt.config.js')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join('./public/img');

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	}
});

const upload = multer({ storage: storage });

module.exports = {

	login: async (req, res) => {

		const { usuario, pass } = req.body;

		try {
			const [[valido]] = await conn.query('SELECT * FROM usuarios WHERE user = ? AND isAdmin = true', [usuario]);
			if (!valido) {
				return res.status(404).send('Usuario no encontrado');
			}
			const passwordIsValid = await crypt.compare(pass, valido.pass);
			if (!passwordIsValid) {
				return res.status(401).send({ auth: false, token: null });
			}
			const token = jtoken.sign({ id: valido.id }, jwtconfig.secretKey, { expiresIn: jwtconfig.tokenExpiresIn });
			res.status(200).send({ auth: true, token });

		} catch (error) {
			console.error(error);
			res.status(500).send('Error del servidor');
		}
	},
	editarHabitacion: async (req, res) => {
		try {
			upload.single('foto')(req, res, async (err) => {
				if (err instanceof multer.MulterError) {
					return res.status(400).json({ error: 'Error al cargar la imagen' });
				} else if (err) {
					return res.status(500).json({ error: 'Error interno del servidor' });
				}

				const formData = req.body;
				let fotoUrl = null;

				if (req.file) {
					fotoUrl = req.file.path.replace('public', '');;
				} else {
					fotoUrl = formData.foto;
				}

				try {
					const updateHabitacion = `
				  UPDATE habitaciones SET nombre = ?, precio = ?, descripcion = ?, tipoHab_id = ?, foto = ?
				  WHERE id = ?
				`;
					const params = [
						formData.nombre,
						formData.precio,
						formData.descripcion,
						formData.tipoHabitacion,
						fotoUrl,
						formData.id
					];

					await conn.query(updateHabitacion, params);

						const sql = `
							SELECT h.*, th.descripcion AS habitacionTipo, th.id AS habitacionTipo_id
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
			});
		} catch (error) {
			res.status(500).json({ error: 'Error interno del servidor' });
		}
	},
	eliminarHabitacion: async (req, res) => {
		try {
			const sql = `
                DELETE FROM habitaciones
                where id = ?
            `;
			const status = await conn.query(sql, [req.params.id]);
			if (status) {
				const sql = `
                SELECT h.*, th.descripcion AS habitacionTipo
                FROM habitaciones h
                LEFT JOIN tipoHabitacion th ON h.tipoHab_id = th.id
            `;
				const [registros] = await conn.query(sql);
				res.json(registros);
			} else {
				return res.status(400).json({ mensaje: 'Error al eliminar' });
			}
		} catch (error) {
			throw error;
		} finally {
			conn.releaseConnection();
		}
	},

	nuevaHabitacion: async (req, res) => {
		try {
			upload.single('foto')(req, res, async (err) => {

				const formData = req.body;
				let fotoUrl = null;

				if (req.file) {
					fotoUrl = req.file.path.replace('public', '');;
				} else {
					fotoUrl = formData.foto;
				}

				try {

					let params;

					insertHabitacion = `
					INSERT INTO habitaciones (nombre, precio, descripcion, tipoHab_id, foto)
					VALUES (?, ?, ?, ?, ?)
				  `;
					params = [
						formData.nombre,
						formData.precio,
						formData.descripcion,
						formData.tipoHabitacion,
						fotoUrl
					];

					await conn.query(insertHabitacion, params);

					const sql = `
				  SELECT h.*, th.descripcion AS habitacionTipo, th.id AS habitacionTipo_id
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
			});
		} catch (error) {
			res.status(500).json({ error: 'Error interno del servidor' });
		}
	},
	getHabitaciones: async (req, res) => {
		try {
			const sql = `
                SELECT h.*, th.descripcion AS habitacionTipo, th.id AS habitacionTipo_id
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

	}

}