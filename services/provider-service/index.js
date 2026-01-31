const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  database: 'skilllink_db'
};

let db;

(async () => {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('Conectado a MySQL');
  } catch (error) {
    console.error('Error conectando a MySQL:', error);
  }
})();

app.get('/api/providers', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.profile_image_url,
        pp.provider_id,
        pp.business_name,
        pp.business_description,
        pp.years_experience,
        pp.is_verified,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as review_count
      FROM users u
      JOIN provider_profiles pp ON u.user_id = pp.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE u.user_type = 'provider' AND pp.available_for_work = 1
      GROUP BY pp.provider_id, u.user_id
      ORDER BY average_rating DESC
    `;

    const [providers] = await db.execute(query);

    const formattedProviders = providers.map((p, index) => ({
      id: p.user_id.toString(),
      name: p.business_name,
      category: 'Servicios', 
      rating: parseFloat(p.average_rating) || 4.5,
      location: 'Centro, Ciudad',
      description: p.business_description,
      hourlyRate: 25 + (index * 5), 
      verified: p.is_verified === 1,
      yearsExperience: p.years_experience,
      reviewCount: p.review_count,
      profileImageUrl: p.profile_image_url
    }));

    res.json(formattedProviders);
  } catch (error) {
    console.error('Error obteniendo proveedores:', error);
    res.status(500).json({ error: 'Error obteniendo proveedores' });
  }
});


app.get('/api/providers/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;

    const query = `
      SELECT 
        u.user_id,
        u.email,
        u.profile_image_url,
        pp.provider_id,
        pp.business_name,
        pp.business_description,
        pp.years_experience,
        pp.service_radius_km,
        pp.is_verified,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as review_count
      FROM users u
      JOIN provider_profiles pp ON u.user_id = pp.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE u.user_id = ?
      GROUP BY pp.provider_id, u.user_id
    `;

    const [providers] = await db.execute(query, [providerId]);

    if (providers.length === 0) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const p = providers[0];
    const provider = {
      id: p.user_id.toString(),
      name: p.business_name,
      description: p.business_description,
      rating: parseFloat(p.average_rating) || 4.5,
      verified: p.is_verified === 1,
      yearsExperience: p.years_experience,
      serviceRadius: p.service_radius_km,
      reviewCount: p.review_count,
      email: p.email,
      profileImageUrl: p.profile_image_url
    };

    res.json(provider);
  } catch (error) {
    console.error('Error obteniendo proveedor:', error);
    res.status(500).json({ error: 'Error obteniendo proveedor' });
  }
});


app.get('/api/providers/:providerId/reviews', async (req, res) => {
  try {
    const { providerId } = req.params;

    const query = `
      SELECT 
        r.review_id,
        r.reviewer_user_id as userId,
        u.email as userName,
        r.rating,
        r.review_text as comment,
        DATE_FORMAT(r.created_at, '%d/%m/%Y') as date
      FROM reviews r
      JOIN users u ON r.reviewer_user_id = u.user_id
      WHERE r.reviewed_user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `;

    const [reviews] = await db.execute(query, [providerId]);
    res.json(reviews);
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    res.status(500).json({ error: 'Error obteniendo reseñas' });
  }
});


app.get('/api/providers/:providerId/services', async (req, res) => {
  try {
    const { providerId } = req.params;

    const query = `
      SELECT 
        s.service_id as id,
        s.service_id as serviceId,
        s.service_title as name,
        s.service_description as description,
        s.base_price as price,
        s.price_type,
        s.estimated_duration_minutes,
        CONCAT(
          CASE 
            WHEN s.estimated_duration_minutes IS NULL THEN 'Consultar'
            WHEN s.estimated_duration_minutes < 60 THEN CONCAT(s.estimated_duration_minutes, ' min')
            ELSE CONCAT(FLOOR(s.estimated_duration_minutes / 60), 'h ', MOD(s.estimated_duration_minutes, 60), 'm')
          END
        ) as duration
      FROM services s
      JOIN provider_profiles pp ON s.provider_id = pp.provider_id
      WHERE pp.user_id = ? AND s.is_active = 1
      ORDER BY s.service_title
    `;

    const [services] = await db.execute(query, [providerId]);
    res.json(services);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});


app.get('/api/services', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.service_id,
        s.service_title,
        s.service_description,
        s.base_price,
        s.price_type,
        s.estimated_duration_minutes,
        c.category_name,
        pp.provider_id,
        pp.business_name as provider_name,
        pp.is_verified as provider_verified,
        u.user_id,
        u.profile_image_url,
        COALESCE(AVG(r.rating), 4.5) as average_rating,
        COUNT(CASE WHEN r.review_id IS NOT NULL THEN 1 END) as review_count
      FROM services s
      JOIN service_categories c ON s.category_id = c.category_id
      JOIN provider_profiles pp ON s.provider_id = pp.provider_id
      JOIN users u ON pp.user_id = u.user_id
      LEFT JOIN reviews r ON u.user_id = r.reviewed_user_id
      WHERE s.is_active = 1 AND s.approval_status = 'approved'
      GROUP BY s.service_id, u.user_id
      ORDER BY s.created_at DESC
    `;

    const [services] = await db.execute(query);


    const formattedServices = services.map(s => ({
      id: s.service_id.toString(),
      providerId: s.user_id.toString(),
      name: s.service_title,
      category: s.category_name,
      rating: parseFloat(s.average_rating) || 4.5,
      location: 'Centro, Ciudad',
      description: s.service_description,
      hourlyRate: s.base_price || 0,
      priceType: s.price_type,
      estimatedDuration: s.estimated_duration_minutes,
      verified: s.provider_verified === 1,
      providerName: s.provider_name,
      reviewCount: s.review_count,
      profileImageUrl: s.profile_image_url
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error obteniendo servicios' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(` Provider Service corriendo en puerto ${PORT}`);
});
